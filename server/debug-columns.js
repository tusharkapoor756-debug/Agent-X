const axios = require('axios');
require('dotenv').config();
const supabase = require('./config/database');

async function testColumns() {
    console.log('🚀 Testing Columns...');

    try {
        // Try inserting without description
        console.log('Attempt 1: Insert without description...');
        const { data, error } = await supabase
            .from('business_profile')
            .insert([{
                owner_id: "Test Owner",
                business_name: "Test Business No Desc " + Date.now(),
                category: "Technology"
            }])
            .select();

        if (error) {
            console.error('❌ Attempt 1 Failed:', error.message);
        } else {
            console.log('✅ Attempt 1 Success! Description column might be missing or named differently.');
            // Clean up
            if (data && data[0]) {
                await supabase.from('business_profile').delete().eq('id', data[0].id);
            }
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }

    process.exit(0);
}

testColumns();
