const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Deterministic fallback parser for offer rules
 * @param {string} text - Freeform offer text
 * @returns {Object} Parsed rules
 */
const fallbackParser = (text) => {
    const rules = {
        allowed_freebies: [],
        forbidden_items: [],
        max_discount_percent: 0,
        max_discount_rupees: 0,
        conditional_rules: []
    };

    const lowerText = text.toLowerCase();

    // Extract max discount rupees
    const rupeesMatch = lowerText.match(/(?:max|upto|maximum)\s*(?:discount)?\s*(?:rs\.?|₹|rupees)\s*(\d+)/);
    if (rupeesMatch) {
        rules.max_discount_rupees = parseInt(rupeesMatch[1]);
    }

    // Extract max discount percent
    const percentMatch = lowerText.match(/(?:max|upto|maximum)\s*(?:discount)?\s*(\d+)%/);
    if (percentMatch) {
        rules.max_discount_percent = parseInt(percentMatch[1]);
    }

    // Extract forbidden items (simple keyword search)
    if (lowerText.includes("battery") && (lowerText.includes("no") || lowerText.includes("nahi"))) {
        rules.forbidden_items.push("battery");
    }
    if (lowerText.includes("protein") && (lowerText.includes("no") || lowerText.includes("nahi"))) {
        rules.forbidden_items.push("protein");
    }

    // Extract allowed freebies (simple keyword search)
    if (lowerText.includes("bottle") && lowerText.includes("free")) {
        rules.allowed_freebies.push("water bottle");
    }
    if (lowerText.includes("shaker") && lowerText.includes("free")) {
        rules.allowed_freebies.push("shaker");
    }
    if (lowerText.includes("keychain") && lowerText.includes("free")) {
        rules.allowed_freebies.push("keychain");
    }

    return rules;
};

/**
 * Parse Hinglish offer text into structured JSON using LLM
 * @param {string} text - Freeform offer text
 * @returns {Promise<Object>} Structured offer rules
 */
const parseOffers = async (text) => {
    if (!text || !text.trim()) {
        return fallbackParser("");
    }

    try {
        const prompt = `
        You are a strict parser converting Hinglish business rules into JSON.
        
        INPUT TEXT: "${text}"
        
        TASK: Extract the following fields:
        - allowed_freebies (array of strings): Items explicitly mentioned as free/giveaway.
        - forbidden_items (array of strings): Items explicitly mentioned as NOT free or NO discount.
        - max_discount_percent (number): Maximum percentage discount allowed (0 if none).
        - max_discount_rupees (number): Maximum flat rupee discount allowed (0 if none).
        - conditional_rules (array of objects): e.g., [{"condition": "bulk_purchase", "discount_percent": 10}]
        
        OUTPUT FORMAT: JSON ONLY. No markdown, no explanations.
        
        Example JSON:
        {
          "allowed_freebies": ["keychain", "sticker"],
          "forbidden_items": ["battery"],
          "max_discount_percent": 10,
          "max_discount_rupees": 500,
          "conditional_rules": []
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("LLM Parsing failed, using fallback:", error);
        return fallbackParser(text);
    }
};

module.exports = {
    parseOffers
};
