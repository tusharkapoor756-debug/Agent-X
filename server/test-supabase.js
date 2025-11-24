// Test existing Supabase tables structure
require('dotenv').config();
const supabase = require('./config/database');

async function inspectTables() {
    console.log('\n🔍 Inspecting Existing Supabase Tables...\n');

    try {
        // Check business_profile table
        console.log('1️⃣  business_profile table:');
        const { data: bp, error: bpError } = await supabase
            .from('business_profile')
            .select('*')
            .limit(1);

        if (bpError) {
            console.log('   ❌ Error:', bpError.message);
        } else {
            console.log('   ✅ Accessible');
            if (bp && bp.length > 0) {
                console.log('   Columns:', Object.keys(bp[0]));
            } else {
                console.log('   (empty table)');
            }
        }

        // Check products table
        console.log('\n2️⃣  products table:');
        const { data: prod, error: prodError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (prodError) {
            console.log('   ❌ Error:', prodError.message);
        } else {
            console.log('   ✅ Accessible');
            if (prod && prod.length > 0) {
                console.log('   Columns:', Object.keys(prod[0]));
            } else {
                console.log('   (empty table)');
            }
        }

        // Check messages table
        console.log('\n3️⃣  messages table:');
        const { data: msg, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .limit(1);

        if (msgError) {
            console.log('   ❌ Error:', msgError.message);
        } else {
            console.log('   ✅ Accessible');
            if (msg && msg.length > 0) {
                console.log('   Columns:', Object.keys(msg[0]));
            } else {
                console.log('   (empty table)');
            }
        }

        console.log('\n✅ Inspection complete!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }

    process.exit(0);
}

inspectTables();
