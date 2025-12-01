const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('./config/database');
const { buildPrompt, getRandomAssistantName } = require('./utils/promptBuilder');

const app = express();
const port = 3000;

// Allow all origins for public access
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

// Import routes
const businessRoutes = require('./routes/business');
const authRoutes = require('./routes/auth');

// Register routes
app.use('/api/business', businessRoutes);
app.use('/api/auth', authRoutes);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Log startup status
console.log('🔑 Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('💾 Supabase URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');

// @route   POST /api/conversation/start
// @desc    Start or retrieve conversation
// @access  Public
app.post('/api/conversation/start', async (req, res) => {
    try {
        const { business_id, user_name, user_number } = req.body;

        if (!business_id || !user_name || !user_number) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate phone number (Strict 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(user_number)) {
            return res.status(400).json({ error: 'Invalid phone number. Must be exactly 10 digits.' });
        }

        // Check if conversation already exists for this user and business
        const { data: existingConv, error: checkError } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('business_id', business_id)
            .eq('user_number', user_number)
            .order('created_at', { ascending: false })
            .limit(1);

        if (checkError) {
            console.error('Error checking conversation:', checkError);
        }

        if (existingConv && existingConv.length > 0) {
            return res.json({
                success: true,
                conversation_id: existingConv[0].conversation_id,
                exists: true
            });
        }

        // Generate new conversation_id
        const conversation_id = `conv_${business_id}_${Date.now()}`;

        res.json({
            success: true,
            conversation_id,
            exists: false
        });

    } catch (error) {
        console.error('Error in conversation start:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
});

// @route   POST /api/chat/:businessId
// @desc    Chat with business AI assistant
// @access  Public
app.post('/api/chat/:businessId', async (req, res) => {
    try {
        const { message, history, userName, assistantName: clientAssistantName, conversation_id, user_number } = req.body;
        const { businessId } = req.params;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API Key not configured' });
        }

        // Fetch business data
        const { data: businessData, error: businessError } = await supabase
            .from('business_profile')
            .select('*')
            .eq('id', businessId)
            .single();

        if (businessError || !businessData) {
            return res.status(404).json({
                error: 'Business not found. Please check the business ID.'
            });
        }

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', businessId);

        if (productsError) {
            console.error('Error fetching products:', productsError);
        }

        // Transform to expected format
        const business = {
            businessName: businessData.business_name,
            category: businessData.category,
            description: businessData.description,
            startYear: new Date(businessData.created_at).getFullYear(),
            offers_enabled: businessData.offers_enabled,
            products: (productsData || []).map(p => ({
                name: p.product_name,
                price: p.price,
                description: ''
            }))
        };

        // Use client's assistant name or generate new one
        const assistantName = clientAssistantName || getRandomAssistantName();

        // Build dynamic prompt with offer rules
        let systemPrompt = buildPrompt(business, assistantName, userName, businessData.offer_rules_json);

        // ENFORCE BRANDED ASSISTANT IDENTITY
        systemPrompt += `\n\nCRITICAL INSTRUCTION: You are the official sales assistant of ${business.businessName}. NEVER say "I am your assistant" or "I am an AI". ALWAYS identify yourself as the assistant of ${business.businessName}. You work for the business only. Start by saying "I am assistant of ${business.businessName}, how can I help you today?" if asked who you are.`;

        // Initialize model with system instruction
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        // Anti-repetition logic: Get last assistant message
        let lastAssistantMessage = "";
        if (history && history.length > 0) {
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].role === "model") {
                    lastAssistantMessage = history[i].parts[0].text;
                    break;
                }
            }
        }

        let finalMessage = message;
        if (lastAssistantMessage) {
            finalMessage = `${message}\n\n(SYSTEM NOTE: Your last reply was: "${lastAssistantMessage}". You MUST NOT repeat this exact wording or meaning. Say something new.)`;
        }

        // SAVE USER MESSAGE FIRST
        if (conversation_id && userName && user_number) {
            // Get current sequence number
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('sequence_number')
                .eq('conversation_id', conversation_id)
                .order('sequence_number', { ascending: false })
                .limit(1);

            const nextSequence = lastMsg && lastMsg.length > 0 ? lastMsg[0].sequence_number + 1 : 1;

            await supabase.from('messages').insert({
                business_id: businessId,
                conversation_id: conversation_id,
                user_name: userName,
                user_number: user_number,
                sender: 'user',
                content: message,
                sequence_number: nextSequence,
                timestamp: new Date().toISOString()
            });
        }

        try {
            const result = await chat.sendMessage(finalMessage);

            // Robust response extraction with multiple fallbacks
            const aiResponse =
                result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                (typeof result?.response?.text === 'function' ? result.response.text() : null) ||
                result?.response?.content?.[0]?.text ||
                "I'm here to help! Could you repeat that?";

            let text = aiResponse;

            // POST-GENERATION OFFER ENFORCEMENT
            let ruleViolation = false;
            if (businessData.offers_enabled && businessData.offer_rules_json) {
                const rules = businessData.offer_rules_json;
                const lowerText = text.toLowerCase();

                if (rules.forbidden_items && rules.forbidden_items.length > 0) {
                    for (const item of rules.forbidden_items) {
                        if (lowerText.includes(item.toLowerCase()) &&
                            (lowerText.includes("free") || lowerText.includes("discount") || lowerText.includes("muft"))) {

                            console.log(`⚠️ Rule Violation: AI offered discount on forbidden item '${item}'`);
                            text = `I apologize, but we do not offer discounts or freebies on ${item}. However, I can check our best prices for you!`;
                            ruleViolation = true;
                            break;
                        }
                    }
                }
            }

            // SAVE AI MESSAGE AFTER GENERATION
            if (conversation_id && userName && user_number) {
                // Get current sequence number again (it increased by 1)
                const { data: lastMsg } = await supabase
                    .from('messages')
                    .select('sequence_number')
                    .eq('conversation_id', conversation_id)
                    .order('sequence_number', { ascending: false })
                    .limit(1);

                const nextSequence = lastMsg && lastMsg.length > 0 ? lastMsg[0].sequence_number + 1 : 1;

                await supabase.from('messages').insert({
                    business_id: businessId,
                    conversation_id: conversation_id,
                    user_name: userName,
                    user_number: user_number,
                    sender: 'agent',
                    content: text,
                    sequence_number: nextSequence,
                    timestamp: new Date().toISOString()
                });
            }

            // Check for lead handoff trigger
            if (text.toLowerCase().includes("connect you with") ||
                text.toLowerCase().includes("transfer") ||
                text.toLowerCase().includes("owner") ||
                text.toLowerCase().includes("team for payment")) {
                console.log(`🚨 HIGH-VALUE LEAD: ${userName || 'Unknown'} - Business: ${business.businessName} - Message: "${message}"`);
            }

            res.json({
                text,
                assistantName
            });
        } catch (geminiError) {
            console.error('Gemini API error:', geminiError);
            res.json({
                text: "Sorry, I'm having trouble understanding right now. Could you please try again?",
                assistantName
            });
        }
    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// @route   POST /api/save-message
// @desc    Save chat message to Supabase with conversation tracking
// @access  Public
app.post("/api/save-message", async (req, res) => {
    const { business_id, conversation_id, user_name, user_number, sender, content, timestamp } = req.body;

    if (!business_id || !conversation_id || !user_name || !user_number || !sender || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Get current sequence number for this conversation
        const { data: lastMsg } = await supabase
            .from('messages')
            .select('sequence_number')
            .eq('conversation_id', conversation_id)
            .order('sequence_number', { ascending: false })
            .limit(1);

        const sequence_number = lastMsg && lastMsg.length > 0 ? lastMsg[0].sequence_number + 1 : 1;

        const { data, error } = await supabase
            .from("messages")
            .insert({
                business_id,
                conversation_id,
                user_name,
                user_number,
                sender,
                content,
                sequence_number,
                timestamp: timestamp || new Date().toISOString(),
            });

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const { error } = await supabase
            .from('business_profile')
            .select('count')
            .limit(1);

        res.json({
            status: 'ok',
            message: 'Agent X Multi-Business Platform with Supabase',
            supabase: error ? 'error' : 'connected',
            gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
            tables: ['business_profile', 'products', 'messages']
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
    });
}

module.exports = app;
