const supabase = require('../config/database');

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
    const { business_id, conversation_id, user_name, user_number, sender, content, timestamp } = req.body;

    if (!business_id || !conversation_id || !user_name || !user_number || !sender || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Get current sequence number for this conversation
        const { data: lastMsg } = await supabase
            .from('messages')
            .select('sequence_number')
            .eq('conversation_id', conversation_id)
            .order('sequence_number', { ascending: false })
            .limit(1);

        const sequence_number = lastMsg && lastMsg.length > 0 ? lastMsg[0].sequence_number + 1 : 1;

        const { data, error } = await supabase
            .from("messages")
            .insert({
                business_id,
                conversation_id,
                user_name,
                user_number,
                sender,
                content,
                sequence_number,
                timestamp: timestamp || new Date().toISOString(),
            });

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = allowCors(handler);
