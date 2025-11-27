
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('./config/database');
const { buildPrompt, getRandomAssistantName } = require('./utils/promptBuilder');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Import routes
const businessRoutes = require('./routes/business');
const authRoutes = require('./routes/auth');

// Register routes
app.use('/api/business', businessRoutes);
app.use('/api/auth', authRoutes);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Log startup status
console.log('🔑 Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('💾 Supabase URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');

// @route   POST /api/chat/:businessId
// @desc    Chat with business AI assistant
// @access  Public
// @route   POST /api/chat/:businessId
// @desc    Chat with business AI assistant
// @access  Public
app.post('/api/chat/:businessId', async (req, res) => {
    try {
        const { message, history, userName, assistantName: clientAssistantName } = req.body;
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
        const systemPrompt = buildPrompt(business, assistantName, userName, businessData.offer_rules_json);

        // Initialize model with system instruction (Better adherence to rules)
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

        // Send message (System prompt is now handled by systemInstruction)
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

        const result = await chat.sendMessage(finalMessage);
        const response = await result.response;
        let text = response.text();

        // ---------------------------------------------------------
        // POST-GENERATION OFFER ENFORCEMENT
        // ---------------------------------------------------------
        let ruleViolation = false;
        if (businessData.offers_enabled && businessData.offer_rules_json) {
            const rules = businessData.offer_rules_json;
            const lowerText = text.toLowerCase();

            // Check 1: Forbidden Items
            if (rules.forbidden_items && rules.forbidden_items.length > 0) {
                for (const item of rules.forbidden_items) {
                    // If text mentions forbidden item AND (free OR discount)
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
        // ---------------------------------------------------------

        // Save message to database
        await supabase.from('messages').insert([
            { business_id: businessId, sender: 'user', message: message },
            { business_id: businessId, sender: 'agent', message: text, rule_violation: ruleViolation } // Assuming we add rule_violation column later or it ignores extra fields
        ]);

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
    } catch (error) {
        console.error('Error calling Gemini:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test Supabase connection
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
