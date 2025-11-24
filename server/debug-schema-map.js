require('dotenv').config();
const supabase = require('./config/database');

async function mapColumns() {
    console.log('🚀 Mapping Columns for business_profile...');

    const columnsToCheck = ['id', 'owner_id', 'business_name', 'category', 'description', 'created_at', 'Owner_Id', 'Business_Name', 'ownerId', 'businessName'];

    for (const col of columnsToCheck) {
        process.stdout.write(`Checking column '${col}'... `);
        const { data, error } = await supabase
            .from('business_profile')
            .select(col)
            .limit(1);

        if (error) {
            console.log('❌ Missing');
        } else {
            console.log('✅ Exists');
        }
    }

    console.log('\n🚀 Mapping Columns for products...');
    const prodColumns = ['id', 'business_id', 'product_name', 'price', 'created_at', 'name', 'description'];
    for (const col of prodColumns) {
        process.stdout.write(`Checking column '${col}'... `);
        const { data, error } = await supabase
            .from('products')
            .select(col)
            .limit(1);

        if (error) {
            console.log('❌ Missing');
        } else {
            console.log('✅ Exists');
        }
    }

    process.exit(0);
}

mapColumns();
