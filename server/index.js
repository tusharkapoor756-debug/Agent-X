// This file is deprecated.
// All logic has been moved to Vercel Serverless Functions in /api directory.
// - /api/conversation/start.js
// - /api/chat/[businessId].js
// - /api/save-message.js
// - /api/business/[id]/public.js

module.exports = (req, res) => {
    res.status(200).json({ message: "Please use the specific API endpoints." });
};
