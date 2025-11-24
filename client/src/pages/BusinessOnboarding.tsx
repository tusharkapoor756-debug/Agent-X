import { useState } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';

interface Product {
    name: string;
    price: number | string;
}

const categories = [
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
];

const BusinessOnboarding = () => {
    const navigate = useNavigate();

    const [ownerName, setOwnerName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [products, setProducts] = useState<Product[]>([
        { name: '', price: '' }
    ]);

    // Offers & Rules State
    const [offersEnabled, setOffersEnabled] = useState(false);
    const [offersText, setOffersText] = useState('');
    const [parsedRules, setParsedRules] = useState<any>(null);
    const [isParsing, setIsParsing] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddProduct = () => {
        setProducts([...products, { name: '', price: '' }]);
    };

    const handleRemoveProduct = (index: number) => {
        if (products.length > 1) {
            setProducts(products.filter((_, i) => i !== index));
        }
    };

    const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
        const newProducts = [...products];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setProducts(newProducts);
    };

    const handleParseRules = async () => {
        if (!offersText.trim()) return;

        setIsParsing(true);
        try {
            // We use a dummy ID 'preview' since we just want to parse
            const response = await fetch(`${API_URL}/business/preview/parse-offers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offers_text: offersText })
            });
            const data = await response.json();
            if (data.success) {
                setParsedRules(data.rules);
            }
        } catch (err) {
            console.error("Failed to parse rules", err);
        }
        setIsParsing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!ownerName.trim() || !businessName.trim() || !category || !description.trim() || !whatsappNumber.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        const validProducts = products.filter(p => p.name.trim() && p.price);
        if (validProducts.length === 0) {
            setError('Please add at least one product with name and price');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/business`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ownerName: ownerName.trim(),
                    businessName: businessName.trim(),
                    category,
                    description: description.trim(),
                    whatsappNumber: whatsappNumber.trim(),
                    products: validProducts.map(p => ({
                        name: p.name.trim(),
                        price: parseFloat(p.price.toString())
                    })),
                    offers_enabled: offersEnabled,
                    offers_text: offersEnabled ? offersText : '',
                    // We let the backend parse and save the JSON rules automatically
                })
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to chat with the new business ID
                navigate(`/chat/${data.business.id}`);
            } else {
                setError(data.error || 'Failed to create business');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#075e54] to-[#128c7e] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Create Your AI Sales Assistant</h1>
                        <p className="text-gray-600 mt-2">Set up your business profile to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Owner Name */}
                        <div>
                            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="ownerName"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                required
                                minLength={2}
                                maxLength={100}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none"
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        {/* Business Name */}
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                                Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="businessName"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                required
                                minLength={3}
                                maxLength={100}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none"
                                placeholder="e.g., Shining Stars Salon"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Business Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Business Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                minLength={10}
                                maxLength={500}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none resize-none"
                                placeholder="Tell us about your business..."
                            />
                            <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                        </div>

                        {/* WhatsApp Number */}
                        <div>
                            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                WhatsApp Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="whatsappNumber"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                required
                                minLength={10}
                                maxLength={15}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none"
                                placeholder="e.g., 919876543210"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter number with country code (without +)</p>
                        </div>

                        {/* Products Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Products/Services <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddProduct}
                                    className="bg-[#075e54] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#128c7e] transition-colors"
                                >
                                    + Add Product
                                </button>
                            </div>

                            <div className="space-y-4">
                                {products.map((product, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-medium text-gray-700">Product #{index + 1}</h4>
                                            {products.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={product.name}
                                                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                    placeholder="Product/Service Name"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none"
                                                />
                                            </div>
                                            <div>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        value={product.price}
                                                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                                        placeholder="Price"
                                                        min={0}
                                                        step="0.01"
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Offers & Rules Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-lg font-medium text-gray-800">
                                    Offers & Rules
                                </label>
                                <div className="flex items-center">
                                    <span className="mr-3 text-sm text-gray-600">
                                        Does your business give offers?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setOffersEnabled(!offersEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:ring-offset-2 ${offersEnabled ? 'bg-[#075e54]' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${offersEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {offersEnabled && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-800 mb-2 font-medium">
                                            Write your rules in simple Hinglish. Example:
                                        </p>
                                        <p className="text-sm text-blue-600 italic">
                                            "Agar koi 2000 se zyada ka bill banaye toh 10% discount de dena.
                                            Free delivery sirf 5km tak hai.
                                            Protein powder pe koi discount nahi milega."
                                        </p>
                                    </div>

                                    <textarea
                                        value={offersText}
                                        onChange={(e) => setOffersText(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075e54] focus:border-transparent outline-none resize-none"
                                        placeholder="Enter your offers and rules here..."
                                    />

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleParseRules}
                                            disabled={isParsing || !offersText.trim()}
                                            className="text-sm text-[#075e54] font-medium hover:underline disabled:opacity-50"
                                        >
                                            {isParsing ? 'Analyzing...' : 'Preview Rules'}
                                        </button>
                                    </div>

                                    {parsedRules && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                                            <h4 className="font-semibold text-gray-700 mb-2">AI Understood:</h4>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                                <li>Allowed Freebies: {parsedRules.allowed_freebies?.join(', ') || 'None'}</li>
                                                <li>Forbidden Items: {parsedRules.forbidden_items?.join(', ') || 'None'}</li>
                                                <li>Max Discount: {parsedRules.max_discount_percent}% or ₹{parsedRules.max_discount_rupees}</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#075e54] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#128c7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Business...' : 'Create Business & Start Chat'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessOnboarding;
