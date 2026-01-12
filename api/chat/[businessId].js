const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../../config/database');
const { buildPrompt, getRandomAssistantName } = require('../../utils/promptBuilder');

const allowCors = fn => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }
    return await fn(req, res)
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handler = async (req, res) => {
    try {
        const { message, history, userName, assistantName: clientAssistantName, conversation_id, user_number } = req.body;
        // Vercel dynamic route param
        const { businessId } = req.query;

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

        // Anti-repetition logic
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

        // NOTE: Message saving is handled by the frontend via /api/save-message to ensure reliability and avoid duplicates.
        // We do NOT save messages here anymore.

        try {
            const result = await chat.sendMessage(finalMessage);

            // Robust response extraction
            const aiResponse =
                result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                (typeof result?.response?.text === 'function' ? result.response.text() : null) ||
                result?.response?.content?.[0]?.text ||
                "I'm here to help! Could you repeat that?";

            let text = aiResponse;

            // POST-GENERATION OFFER ENFORCEMENT
            if (businessData.offers_enabled && businessData.offer_rules_json) {
                const rules = businessData.offer_rules_json;
                const lowerText = text.toLowerCase();

                if (rules.forbidden_items && rules.forbidden_items.length > 0) {
                    for (const item of rules.forbidden_items) {
                        if (lowerText.includes(item.toLowerCase()) &&
                            (lowerText.includes("free") || lowerText.includes("discount") || lowerText.includes("muft"))) {
                            text = `I apologize, but we do not offer discounts or freebies on ${item}. However, I can check our best prices for you!`;
                            break;
                        }
                    }
                }
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
}

module.exports = allowCors(handler);
