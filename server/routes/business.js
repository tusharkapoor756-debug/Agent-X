const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');

// @route   POST /api/business
// @desc    Create a new business with products
// @access  Public (no auth)
router.post('/', [
    body('ownerName').trim().isLength({ min: 2, max: 100 }).withMessage('Owner name required'),
    body('businessName').trim().isLength({ min: 3, max: 100 }).withMessage('Business name must be between 3 and 100 characters'),
    body('category').isIn(['Saloon', 'Gym', 'Real Estate', 'Restaurants', 'Education', 'Healthcare', 'Retail', 'Technology', 'Consulting', 'Other']).withMessage('Invalid category'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('whatsappNumber').trim().isLength({ min: 10, max: 15 }).withMessage('Valid WhatsApp number required'),
    body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { ownerName, businessName, category, description, whatsappNumber, products, offers_enabled, offers_text } = req.body;

        let offer_rules_json = {};
        if (offers_enabled && offers_text) {
            // Import parseOffers if not already imported at top level (it is imported at bottom, so we might need to move import up or use it here)
            // Since require is at bottom, we should move it up or require it here.
            // To be safe and clean, I'll assume I need to move the require to top or just use it here if I can.
            // Actually, I can't use it if it's defined below. I should move the require to the top of the file in a separate step or just require it inside.
            const { parseOffers } = require('../utils/ruleBuilder');
            offer_rules_json = await parseOffers(offers_text);
        }

        // Create business profile
        const { data: business, error: businessError } = await supabase
            .from('business_profile')
            .insert([{
                owner_id: ownerName,
                business_name: businessName,
                category: category,
                description: description,
                whatsapp_number: whatsappNumber,
                offers_enabled: offers_enabled || false,
                offers_text: offers_text || '',
                offer_rules_json: offer_rules_json
            }])
            .select()
            .single();

        if (businessError) {
            console.error('Error creating business:', businessError);
            return res.status(500).json({
                success: false,
                error: 'Error creating business',
                details: businessError
            });
        }

        // Insert products
        const productsToInsert = products.map(p => ({
            business_id: business.id,
            product_name: p.name,
            price: parseFloat(p.price),
        }));

        const { data: insertedProducts, error: productsError } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();

        if (productsError) {
            console.error('Error creating products:', productsError);
            // Rollback business creation
            await supabase.from('business_profile').delete().eq('id', business.id);
            return res.status(500).json({
                success: false,
                error: 'Error creating products'
            });
        }

        res.status(201).json({
            success: true,
            business: {
                id: business.id,
                ownerName: business.owner_id,
                businessName: business.business_name,
                category: business.category,
                description: business.description,
                whatsappNumber: business.whatsapp_number,
                offers_enabled: business.offers_enabled,
                products: insertedProducts.map(p => ({
                    id: p.id,
                    name: p.product_name,
                    price: p.price
                }))
            }
        });

    } catch (error) {
        console.error('Create business error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while creating business'
        });
    }
});

// @route   GET /api/business/:id
// @desc    Get business with products
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        // Get business profile
        const { data: business, error: businessError } = await supabase
            .from('business_profile')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }

        // Get products
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', business.id);

        if (productsError) {
            console.error('Error fetching products:', productsError);
        }

        res.json({
            success: true,
            business: {
                _id: business.id,
                businessName: business.business_name,
                category: business.category,
                description: business.description,
                whatsappNumber: business.whatsapp_number,
                products: (products || []).map(p => ({
                    id: p.id,
                    name: p.product_name,
                    price: p.price
                }))
            }
        });

    } catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   GET /api/business/:id/public
// @desc    Get public business info (for chat)
// @access  Public
router.get('/:id/public', async (req, res) => {
    try {
        // Use the same endpoint as above
        const { data: business, error: businessError } = await supabase
            .from('business_profile')
            .select('*')
            .eq('id', req.params.id)
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
});

// @route   POST /api/business/:id/message
// @desc    Save chat message
// @access  Public
router.post('/:id/message', async (req, res) => {
    try {
        const { sender, message } = req.body;
        const { id: businessId } = req.params;

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                business_id: businessId,
                sender: sender,
                message: message
            }])
            .select()
            .single();

        if (error) {
            console.error('Error saving message:', error);
            return res.status(500).json({
                success: false,
                error: 'Error saving message'
            });
        }

        res.json({
            success: true,
            message: data
        });

    } catch (error) {
        console.error('Save message error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

const { parseOffers } = require('../utils/ruleBuilder');

// @route   PUT /api/business/:id
// @desc    Update business profile (including offers)
// @access  Public (should be protected in prod)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Fields allowed to be updated
        const allowedUpdates = [
            'ownerName', 'businessName', 'category', 'description', 'whatsappNumber',
            'offers_enabled', 'offers_text', 'offer_rules_json'
        ];

        const updateData = {};

        // Map camelCase to snake_case for DB
        if (updates.ownerName) updateData.owner_id = updates.ownerName; // Note: Schema uses owner_id for name currently
        if (updates.businessName) updateData.business_name = updates.businessName;
        if (updates.category) updateData.category = updates.category;
        if (updates.description) updateData.description = updates.description;
        if (updates.whatsappNumber) updateData.whatsapp_number = updates.whatsappNumber;
        if (updates.offers_enabled !== undefined) updateData.offers_enabled = updates.offers_enabled;
        if (updates.offers_text !== undefined) updateData.offers_text = updates.offers_text;
        if (updates.offer_rules_json !== undefined) updateData.offer_rules_json = updates.offer_rules_json;

        // If offers_text is updated but rules aren't provided, parse them automatically
        if (updates.offers_text && !updates.offer_rules_json) {
            updateData.offer_rules_json = await parseOffers(updates.offers_text);
        }

        const { data, error } = await supabase
            .from('business_profile')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update business error:', error);
            return res.status(500).json({ success: false, error: 'Failed to update business' });
        }

        // Update products if provided
        if (updates.products && Array.isArray(updates.products)) {
            // Delete existing products
            await supabase.from('products').delete().eq('business_id', id);

            // Insert new products
            const productsToInsert = updates.products.map(p => ({
                business_id: id,
                product_name: p.name,
                price: parseFloat(p.price),
            }));

            await supabase.from('products').insert(productsToInsert);
        }

        res.json({ success: true, business: data });

    } catch (error) {
        console.error('Update business error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/business/:id/parse-offers
// @desc    Parse offer text into JSON rules
// @access  Public
router.post('/:id/parse-offers', async (req, res) => {
    try {
        const { offers_text } = req.body;
        const rules = await parseOffers(offers_text);

        // Save to DB if requested (optional, but usually done via PUT)
        // Here we just return the parsed rules for preview

        res.json({
            success: true,
            rules: rules,
            summary: `Parsed: ${rules.allowed_freebies.length} allowed items, ${rules.forbidden_items.length} forbidden items.`
        });

    } catch (error) {
        console.error('Parse offers error:', error);
        res.status(500).json({ success: false, error: 'Parsing failed' });
    }
});

module.exports = router;
