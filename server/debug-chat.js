const axios = require('axios');
require('dotenv').config();
const supabase = require('./config/database');

async function debugChat() {
    console.log('🚀 Debugging Chat API...');

    try {
        // 1. Get a valid business ID
        const { data: business, error } = await supabase
            .from('business_profile')
            .select('id, business_name')
            .limit(1)
            .single();

        if (error || !business) {
            console.error('❌ No business found to test with.');
            return;
        }

        console.log(`✅ Using Business: ${business.business_name} (${business.id})`);

        // 2. Send a chat message with INVALID history (starting with model)
        const payload = {
            message: "How are you?",
            userName: "Debug User",
            history: [
                {
                    role: "model",
                    parts: [{ text: "Hello, I am the assistant." }]
                }
            ]
        };

        console.log('📤 Sending request...');
        const response = await axios.post(`http://localhost:3000/api/chat/${business.id}`, payload);

        console.log('✅ Response received:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Error calling Chat API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }

    process.exit(0);
}

debugChat();
