const supabase = require('../../../config/database');

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

const handler = async (req, res) => {
    try {
        // Vercel dynamic route param
        const { id } = req.query;

        const { data: business, error: businessError } = await supabase
            .from('business_profile')
            .select('*')
            .eq('id', id)
            .single();

        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }

        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', business.id);

        res.json({
            success: true,
            business: {
                _id: business.id,
                businessName: business.business_name,
                category: business.category,
                description: business.description,
                products: (products || []).map(p => ({
                    name: p.product_name,
                    price: p.price
                }))
            }
        });

    } catch (error) {
        console.error('Get public business error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
}

module.exports = allowCors(handler);
