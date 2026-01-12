import { useState } from 'react';

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
            const response = await fetch(`https://server-tusharkapoor756-2007-tushar-kapoors-projects-9cac3c78.vercel.app/api/business/preview/parse-offers`, {
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
            const response = await fetch(`https://server-tusharkapoor756-2007-tushar-kapoors-projects-9cac3c78.vercel.app/api/business`, {
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
                })
            });

            const data = await response.json();

            if (data.success) {
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
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            <div className="
                w-full max-w-3xl mx-auto mt-10 p-10 
                rounded-2xl 
                bg-[var(--panel-bg)] 
                border border-[var(--panel-border)]
                shadow-[0_0_25px_rgba(79,155,255,0.15)]
                backdrop-blur-xl
                relative z-10
            ">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-[var(--accent)] mb-2 tracking-wide">
                        AGENT-X
                    </h1>
                    <h2 className="text-xl font-semibold text-[var(--text-main)] mb-6 opacity-80">
                        Initialize Your Business
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Owner Name */}
                    <div>
                        <label className="text-[var(--text-soft)] text-sm mb-1 block">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            required
                            className="
                                w-full p-3 rounded-lg 
                                bg-[rgba(255,255,255,0.05)] 
                                border border-[rgba(100,180,255,0.2)]
                                text-[var(--text-main)]
                                placeholder-[var(--text-soft)]
                                focus:outline-none
                                focus:border-[var(--accent)]
                                focus:ring-2 focus:ring-[var(--focus-ring)]
                                transition-all
                            "
                            placeholder="e.g., John Doe"
                        />
                    </div>

                    {/* Business Name */}
                    <div>
                        <label className="text-[var(--text-soft)] text-sm mb-1 block">
                            Business Name
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                            className="
                                w-full p-3 rounded-lg 
                                bg-[rgba(255,255,255,0.05)] 
                                border border-[rgba(100,180,255,0.2)]
                                text-[var(--text-main)]
                                placeholder-[var(--text-soft)]
                                focus:outline-none
                                focus:border-[var(--accent)]
                                focus:ring-2 focus:ring-[var(--focus-ring)]
                                transition-all
                            "
                            placeholder="e.g., Shining Stars Salon"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-[var(--text-soft)] text-sm mb-1 block">
                            Business Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="
                                w-full p-3 rounded-lg 
                                bg-[rgba(255,255,255,0.05)] 
                                border border-[rgba(100,180,255,0.2)]
                                text-[var(--text-main)]
                                focus:outline-none
                                focus:border-[var(--accent)]
                                focus:ring-2 focus:ring-[var(--focus-ring)]
                                transition-all appearance-none
                            "
                        >
                            <option value="" className="bg-[var(--bg-dark)] text-gray-500">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="bg-[var(--bg-dark)] text-[var(--text-main)]">{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[var(--text-soft)] text-sm mb-1 block">
                            Business Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            className="
                                w-full p-3 rounded-lg 
                                bg-[rgba(255,255,255,0.05)] 
                                border border-[rgba(100,180,255,0.2)]
                                text-[var(--text-main)]
                                placeholder-[var(--text-soft)]
                                focus:outline-none
                                focus:border-[var(--accent)]
                                focus:ring-2 focus:ring-[var(--focus-ring)]
                                transition-all resize-none
                            "
                            placeholder="Tell us about your business..."
                        />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                        <label className="text-[var(--text-soft)] text-sm mb-1 block">
                            WhatsApp Number
                        </label>
                        <input
                            type="text"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            required
                            className="
                                w-full p-3 rounded-lg 
                                bg-[rgba(255,255,255,0.05)] 
                                border border-[rgba(100,180,255,0.2)]
                                text-[var(--text-main)]
                                placeholder-[var(--text-soft)]
                                focus:outline-none
                                focus:border-[var(--accent)]
                                focus:ring-2 focus:ring-[var(--focus-ring)]
                                transition-all
                            "
                            placeholder="e.g., 919876543210"
                        />
                    </div>

                    {/* Products Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[var(--text-soft)] text-sm block">
                                Products/Services
                            </label>
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="text-[var(--accent)] border border-[var(--accent)] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[var(--accent)] hover:text-white transition-all"
                            >
                                + ADD PRODUCT
                            </button>
                        </div>

                        <div className="space-y-4">
                            {products.map((product, index) => (
                                <div key={index} className="border border-[var(--panel-border)] rounded-lg p-4 bg-[rgba(255,255,255,0.02)]">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-[var(--text-soft)] text-sm">PRODUCT #{index + 1}</h4>
                                        {products.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(index)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold uppercase"
                                            >
                                                REMOVE
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={product.name}
                                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                            placeholder="Product Name"
                                            className="
                                                w-full p-2 rounded-lg 
                                                bg-[rgba(255,255,255,0.05)] 
                                                border border-[rgba(100,180,255,0.2)]
                                                text-[var(--text-main)]
                                                placeholder-[var(--text-soft)]
                                                focus:outline-none
                                                focus:border-[var(--accent)]
                                                transition-all text-sm
                                            "
                                        />
                                        <input
                                            type="number"
                                            value={product.price}
                                            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                            placeholder="Price"
                                            className="
                                                w-full p-2 rounded-lg 
                                                bg-[rgba(255,255,255,0.05)] 
                                                border border-[rgba(100,180,255,0.2)]
                                                text-[var(--text-main)]
                                                placeholder-[var(--text-soft)]
                                                focus:outline-none
                                                focus:border-[var(--accent)]
                                                transition-all text-sm
                                            "
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Offers & Rules Section */}
                    <div className="border-t border-[var(--panel-border)] pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[var(--accent)] font-bold tracking-wide">
                                OFFERS & RULES
                            </label>
                            <div className="flex items-center">
                                <span className="mr-3 text-xs text-[var(--text-soft)] uppercase">
                                    Enable Offers?
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setOffersEnabled(!offersEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)] ${offersEnabled ? 'bg-[var(--accent)]' : 'bg-gray-700'
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
                                <div className="bg-[rgba(79,155,255,0.1)] p-4 rounded-lg border border-[rgba(79,155,255,0.2)]">
                                    <p className="text-xs text-[var(--accent)] mb-2 font-bold uppercase">
                                        Write your rules in simple Hinglish:
                                    </p>
                                    <p className="text-xs text-[var(--text-soft)] italic">
                                        "Agar koi 2000 se zyada ka bill banaye toh 10% discount de dena.
                                        Free delivery sirf 5km tak hai."
                                    </p>
                                </div>

                                <textarea
                                    value={offersText}
                                    onChange={(e) => setOffersText(e.target.value)}
                                    rows={4}
                                    className="
                                        w-full p-3 rounded-lg 
                                        bg-[rgba(255,255,255,0.05)] 
                                        border border-[rgba(100,180,255,0.2)]
                                        text-[var(--text-main)]
                                        placeholder-[var(--text-soft)]
                                        focus:outline-none
                                        focus:border-[var(--accent)]
                                        focus:ring-2 focus:ring-[var(--focus-ring)]
                                        transition-all resize-none
                                    "
                                    placeholder="Enter your offers and rules here..."
                                />

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleParseRules}
                                        disabled={isParsing || !offersText.trim()}
                                        className="text-xs text-[var(--accent)] font-bold uppercase tracking-wider hover:underline disabled:opacity-50"
                                    >
                                        {isParsing ? 'ANALYZING...' : 'PREVIEW RULES'}
                                    </button>
                                </div>

                                {parsedRules && (
                                    <div className="bg-[var(--bg-dark)] p-4 rounded-lg border border-[var(--panel-border)] text-sm shadow-sm">
                                        <h4 className="font-bold text-[var(--accent)] mb-2 uppercase text-xs">AI Protocol Preview:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-[var(--text-soft)] text-xs">
                                            <li><span className="text-white">Allowed Freebies:</span> {parsedRules.allowed_freebies?.join(', ') || 'None'}</li>
                                            <li><span className="text-red-400">Forbidden Items:</span> {parsedRules.forbidden_items?.join(', ') || 'None'}</li>
                                            <li><span className="text-[var(--accent)]">Max Discount:</span> {parsedRules.max_discount_percent}% or ₹{parsedRules.max_discount_rupees}</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="
                            w-full py-4 rounded-lg 
                            bg-[var(--accent)] text-white 
                            font-bold text-lg 
                            hover:bg-blue-600 
                            hover:shadow-[0_0_20px_rgba(79,155,255,0.4)] 
                            hover:scale-[1.02] 
                            transition-all 
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                        "
                    >
                        {isLoading ? 'INITIALIZING SYSTEM...' : 'DEPLOY AGENT & START CHAT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BusinessOnboarding;
