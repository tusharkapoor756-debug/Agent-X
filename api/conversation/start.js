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

        // Try to save to conversations table (if it exists)
        try {
            await supabase.from('conversations').insert({
                conversation_id,
                business_id,
                user_name,
                user_number,
                created_at: new Date().toISOString()
            });
        } catch (e) {
            // Ignore if table doesn't exist
        }

        res.json({
            success: true,
            conversation_id,
            exists: false
        });

    } catch (error) {
        console.error('Error in conversation start:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
}

module.exports = allowCors(handler);
