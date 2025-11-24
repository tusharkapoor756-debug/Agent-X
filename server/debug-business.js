const axios = require('axios');

async function testCreateBusiness() {
    console.log('🚀 Testing Business Creation API...');

    const payload = {
        ownerName: "Test Owner",
        businessName: "Test Business " + Date.now(),
        category: "Technology",
        description: "This is a test business description for debugging purposes.",
        whatsappNumber: "919876543210",
        products: [
            { name: "Test Product 1", price: 100 },
            { name: "Test Product 2", price: 200 }
        ]
    };

    try {
        const response = await axios.post('http://localhost:3000/api/business', payload);
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:');
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Message:', error.message);
        }
    }
}

testCreateBusiness();
