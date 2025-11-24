const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: true });

const businessSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        minlength: [3, 'Business name must be at least 3 characters'],
        maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Business category is required'],
        enum: {
            values: [
                'Saloon',
                'Gym',
                'Real Estate',
                'Restaurants',
                'Education',
                'Healthcare',
                'Retail',
                'Technology',
                'Consulting',
                'Other'
            ],
            message: 'Please select a valid category'
        }
    },
    description: {
        type: String,
        required: [true, 'Business description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    startYear: {
        type: Number,
        required: [true, 'Start year is required'],
        min: [1900, 'Start year must be 1900 or later'],
        max: [new Date().getFullYear(), 'Start year cannot be in the future'],
        validate: {
            validator: Number.isInteger,
            message: 'Start year must be a whole number'
        }
    },
    logo: {
        type: String,
        default: null // URL to logo image, optional for now
    },
    products: {
        type: [productSchema],
        validate: {
            validator: function (products) {
                return products && products.length > 0;
            },
            message: 'At least one product/service is required'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
businessSchema.index({ owner: 1 });
businessSchema.index({ isActive: 1 });

module.exports = mongoose.model('Business', businessSchema);
