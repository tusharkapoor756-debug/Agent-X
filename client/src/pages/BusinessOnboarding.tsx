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
        <div className="min-h-screen bg-[#0A0F14] py-12 px-4 font-mono relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="bg-[rgba(10,15,20,0.8)] rounded-xl shadow-[0_0_20px_rgba(0,255,127,0.2)] p-8 border border-[#00FF7F] backdrop-blur-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold font-mono text-[#00FF7F] tracking-[0.2em] drop-shadow-[0_0_10px_#00FF7F] mb-2 animate-pulse">AGENT-X</h1>
                        <h2 className="text-xl font-bold font-mono text-white tracking-wider">INITIALIZE BUSINESS</h2>
                        <p className="text-[#00D16B] mt-2 text-sm tracking-widest uppercase">Configure your AI Sales Assistant Protocol</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Owner Name */}
                        <div>
                            <label htmlFor="ownerName" className="block text-xs font-bold text-[#00FF7F] mb-2 uppercase tracking-wider">
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
                                className="w-full px-4 py-3 bg-[#0A0F14] border border-[#00FF7F] rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_10px_#00FF7F] transition-all"
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        {/* Business Name */}
                        <div>
                            <label htmlFor="businessName" className="block text-xs font-bold text-[#00FF7F] mb-2 uppercase tracking-wider">
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
                                className="w-full px-4 py-3 bg-[#0A0F14] border border-[#00FF7F] rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_10px_#00FF7F] transition-all"
                                placeholder="e.g., Shining Stars Salon"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-xs font-bold text-[#00FF7F] mb-2 uppercase tracking-wider">
                                Business Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#0A0F14] border border-[#00FF7F] rounded-lg text-[#C8FFC8] focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_10px_#00FF7F] transition-all appearance-none"
                            >
                                <option value="" className="bg-[#0A0F14] text-gray-500">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-[#0A0F14] text-[#C8FFC8]">{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-xs font-bold text-[#00FF7F] mb-2 uppercase tracking-wider">
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
                                className="w-full px-4 py-3 bg-[#0A0F14] border border-[#00FF7F] rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_10px_#00FF7F] transition-all resize-none"
                                placeholder="Tell us about your business..."
                            />
                            <p className="text-[10px] text-gray-500 mt-1 text-right">{description.length}/500 characters</p>
                        </div>

                        {/* WhatsApp Number */}
                        <div>
                            <label htmlFor="whatsappNumber" className="block text-xs font-bold text-[#00FF7F] mb-2 uppercase tracking-wider">
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
                                className="w-full px-4 py-3 bg-[#0A0F14] border border-[#00FF7F] rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_10px_#00FF7F] transition-all"
                                placeholder="e.g., 919876543210"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Enter number with country code (without +)</p>
                        </div>

                        {/* Products Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-xs font-bold text-[#00FF7F] uppercase tracking-wider">
                                    Products/Services <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddProduct}
                                    className="bg-transparent border border-[#00FF7F] text-[#00FF7F] px-4 py-2 rounded-lg text-xs font-mono font-bold hover:bg-[#00FF7F]/10 hover:shadow-[0_0_10px_#00FF7F] transition-all"
                                >
                                    + ADD PRODUCT
                                </button>
                            </div>

                            <div className="space-y-4">
                                {products.map((product, index) => (
                                    <div key={index} className="border border-[#00FF7F]/20 rounded-lg p-4 bg-[#0A0F14]/50 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-[#00D16B] text-sm tracking-wider">PRODUCT #{index + 1}</h4>
                                            {products.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    REMOVE
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
                                                    className="w-full px-3 py-2 bg-[#0A0F14] border border-[#00FF7F]/30 rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_5px_#00FF7F] transition-all text-sm"
                                                />
                                            </div>
                                            <div>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-[#00FF7F]/60">₹</span>
                                                    <input
                                                        type="number"
                                                        value={product.price}
                                                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                                        placeholder="Price"
                                                        min={0}
                                                        step="0.01"
                                                        className="w-full pl-8 pr-3 py-2 bg-[#0A0F14] border border-[#00FF7F]/30 rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_5px_#00FF7F] transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Offers & Rules Section */}
                        <div className="border-t border-[#00FF7F]/20 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-lg font-mono font-bold text-[#00FF7F] tracking-wider">
                                    OFFERS & RULES
                                </label>
                                <div className="flex items-center">
                                    <span className="mr-3 text-xs text-gray-400 uppercase tracking-wider">
                                        Enable Offers?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setOffersEnabled(!offersEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:ring-offset-2 focus:ring-offset-[#0A0F14] ${offersEnabled ? 'bg-[#00FF7F]' : 'bg-gray-700'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-[#0A0F14] transition-transform ${offersEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {offersEnabled && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-[#00D16B]/5 p-4 rounded-lg border border-[#00D16B]/20">
                                        <p className="text-xs text-[#00D16B] mb-2 font-bold uppercase tracking-wider">
                                            Write your rules in simple Hinglish:
                                        </p>
                                        <p className="text-xs text-gray-400 italic font-mono">
                                            "Agar koi 2000 se zyada ka bill banaye toh 10% discount de dena.
                                            Free delivery sirf 5km tak hai.
                                            Protein powder pe koi discount nahi milega."
                                        </p>
                                    </div>

                                    <textarea
                                        value={offersText}
                                        onChange={(e) => setOffersText(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[#0A0F14] border border-[#00FF7F]/30 rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_10px_#00FF7F] transition-all resize-none font-mono text-sm"
                                        placeholder="Enter your offers and rules here..."
                                    />

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleParseRules}
                                            disabled={isParsing || !offersText.trim()}
                                            className="text-xs text-[#00FF7F] font-bold uppercase tracking-wider hover:underline disabled:opacity-50"
                                        >
                                            {isParsing ? 'ANALYZING...' : 'PREVIEW RULES'}
                                        </button>
                                    </div>

                                    {parsedRules && (
                                        <div className="bg-[#0A0F14] p-4 rounded-lg border border-[#00FF7F]/30 text-sm shadow-[0_0_10px_rgba(0,255,127,0.05)]">
                                            <h4 className="font-bold text-[#00FF7F] mb-2 uppercase tracking-wider text-xs">AI Protocol Preview:</h4>
                                            <ul className="list-disc list-inside space-y-1 text-[#C8FFC8] font-mono text-xs">
                                                <li><span className="text-[#00D16B]">Allowed Freebies:</span> {parsedRules.allowed_freebies?.join(', ') || 'None'}</li>
                                                <li><span className="text-red-400">Forbidden Items:</span> {parsedRules.forbidden_items?.join(', ') || 'None'}</li>
                                                <li><span className="text-[#00FF7F]">Max Discount:</span> {parsedRules.max_discount_percent}% or ₹{parsedRules.max_discount_rupees}</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-transparent border border-[#00FF7F] text-[#00FF7F] py-4 rounded-lg font-mono font-bold text-lg hover:bg-[#00FF7F]/10 hover:shadow-[0_0_20px_#00FF7F] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                            {isLoading ? 'INITIALIZING SYSTEM...' : 'DEPLOY AGENT & START CHAT'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessOnboarding;
