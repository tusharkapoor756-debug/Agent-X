import { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Business {
    _id: string;
    businessName: string;
    category: string;
    description: string;
    startYear: number;
    logo?: string;
    products: Array<{
        name: string;
        price: number;
        description: string;
    }>;
    isActive: boolean;
}

const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<Business | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        fetchBusiness();
    }, []);

    const fetchBusiness = async () => {
        try {
            const response = await fetch(`https://server-tusharkapoor756-2007-tushar-kapoors-projects-9cac3c78.vercel.app/api/business/my-business`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setBusiness(data.business);
            } else {
                if (response.status === 404) {
                    // No business found, redirect to onboarding
                    navigate('/onboarding');
                } else if (response.status === 401) {
                    logout();
                    navigate('/login');
                } else {
                    setError(data.error || 'Failed to load business');
                }
            }
        } catch (error) {
            setError('Network error. Please try again.');
        }
        setIsLoading(false);
    };

    const handleCopyLink = () => {
        if (business) {
            const chatLink = `${window.location.origin}/chat/${business._id}`;
            navigator.clipboard.writeText(chatLink);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#075e54] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your business...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-red-600 text-center">
                        <p className="text-lg font-semibold">Error</p>
                        <p className="mt-2">{error}</p>
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="mt-4 bg-[#075e54] text-white px-6 py-2 rounded-lg hover:bg-[#128c7e]"
                        >
                            Create Business
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!business) return null;

    return (
        <div className="min-h-screen bg-[#0A0F14] font-mono relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            {/* Header */}
            <header className="bg-[#0A0F14]/90 backdrop-blur-md border-b border-[#00FF7F]/30 sticky top-0 z-50 shadow-[0_0_15px_rgba(0,255,127,0.1)]">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-[#0A0F14] border-2 border-[#00FF7F] flex items-center justify-center text-[#00FF7F] font-mono font-bold text-xl shadow-[0_0_10px_#00FF7F]">
                                {business.businessName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-mono text-[#00FF7F] tracking-wider drop-shadow-[0_0_5px_#00FF7F]">AGENT-X</h1>
                                <p className="text-xs text-white tracking-widest uppercase">{business.businessName}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-400 text-sm hidden sm:block">OPERATOR: <span className="text-[#00FF7F]">{user?.name}</span></span>
                            <button
                                onClick={handleLogout}
                                className="bg-transparent border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all text-xs font-bold uppercase tracking-wider"
                            >
                                TERMINATE SESSION
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Business Info Card */}
                    <div className="lg:col-span-2 bg-[rgba(10,15,20,0.8)] rounded-xl shadow-[0_0_15px_rgba(0,255,127,0.05)] p-6 border border-[#00FF7F]/20 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-6 border-b border-[#00FF7F]/10 pb-4">
                            <h2 className="text-xl font-bold font-mono text-[#00FF7F] tracking-wider">BUSINESS PROTOCOLS</h2>
                            <Link
                                to="/onboarding"
                                className="text-[#00D16B] hover:text-white text-xs font-bold uppercase tracking-wider hover:underline transition-colors"
                            >
                                [ EDIT CONFIGURATION ]
                            </Link>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Business Name</label>
                                    <p className="text-white font-medium">{business.businessName}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                                    <p className="text-white">{business.category}</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                                    <p className="text-[#C8FFC8] text-sm leading-relaxed">{business.description}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-[#00FF7F]/80 uppercase tracking-wider block mb-3">Active Products/Services</label>
                                <div className="space-y-3">
                                    {business.products.map((product, index) => (
                                        <div key={index} className="bg-[#0A0F14]/50 border border-[#00FF7F]/10 p-4 rounded-lg hover:border-[#00FF7F]/30 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-[#00D16B] text-sm">{product.name}</p>
                                                    {product.description && (
                                                        <p className="text-xs text-gray-400 mt-1">{product.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-lg font-bold text-white font-mono">₹{product.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="space-y-6">
                        <div className="bg-[rgba(10,15,20,0.8)] rounded-xl shadow-[0_0_15px_rgba(0,209,107,0.05)] p-6 border border-[#00D16B]/20 backdrop-blur-sm">
                            <h3 className="text-lg font-bold font-mono text-[#00D16B] mb-4 tracking-wider">DEPLOYMENT</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Public Access Link</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={`${window.location.origin}/chat/${business._id}`}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-[#0A0F14] border border-[#00D16B]/30 rounded-lg text-xs text-[#C8FFC8] font-mono focus:outline-none"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className="bg-[#00D16B]/10 border border-[#00D16B] text-[#00D16B] px-3 py-2 rounded-lg hover:bg-[#00D16B]/20 transition-colors whitespace-nowrap text-xs font-bold uppercase"
                                        >
                                            {copiedLink ? 'COPIED' : 'COPY'}
                                        </button>
                                    </div>
                                </div>

                                <Link
                                    to={`/chat/${business._id}`}
                                    className="block w-full bg-transparent border border-[#00FF7F] text-[#00FF7F] text-center py-3 rounded-lg font-mono font-bold hover:bg-[#00FF7F]/10 hover:shadow-[0_0_15px_#00FF7F] transition-all uppercase tracking-wider text-sm"
                                >
                                    LAUNCH TEST INTERFACE
                                </Link>
                            </div>
                        </div>

                        <div className="bg-[#0A0F14]/50 rounded-xl p-6 border border-gray-700 opacity-75">
                            <h3 className="text-lg font-bold font-mono text-gray-500 mb-2 tracking-wider">WHATSAPP LINK</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Integration with WhatsApp Cloud API is currently locked. Upgrade clearance level to access.
                            </p>
                            <button className="w-full bg-gray-800 text-gray-600 py-2 rounded-lg cursor-not-allowed text-xs font-bold uppercase tracking-wider border border-gray-700" disabled>
                                SYSTEM LOCKED
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
