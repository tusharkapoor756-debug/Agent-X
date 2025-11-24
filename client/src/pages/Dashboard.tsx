import { useState, useEffect } from 'react';
import API_URL from '../config';
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
            const response = await fetch(`${API_URL}/business/my-business`, {
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-[#075e54] rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {business.businessName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{business.businessName}</h1>
                                <p className="text-sm text-gray-500">{business.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">Welcome, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Business Info Card */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Business Information</h2>
                            <Link
                                to="/onboarding"
                                className="text-[#075e54] hover:underline text-sm font-medium"
                            >
                                Edit Business
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Business Name</label>
                                <p className="text-gray-800 font-medium">{business.businessName}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Category</label>
                                <p className="text-gray-800">{business.category}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="text-gray-800">{business.description}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Established</label>
                                <p className="text-gray-800">{business.startYear}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-2">Products/Services</label>
                                <div className="space-y-3">
                                    {business.products.map((product, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-800">{product.name}</p>
                                                    {product.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-lg font-bold text-[#075e54]">₹{product.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">AI Sales Assistant</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block mb-2">Chat Link</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={`${window.location.origin}/chat/${business._id}`}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className="bg-[#075e54] text-white px-4 py-2 rounded-lg hover:bg-[#128c7e] transition-colors whitespace-nowrap"
                                        >
                                            {copiedLink ? '✓ Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                <Link
                                    to={`/chat/${business._id}`}
                                    className="block w-full bg-gradient-to-r from-[#075e54] to-[#128c7e] text-white text-center py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                                >
                                    Test Chat Interface
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">WhatsApp Integration</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Connect your business to WhatsApp Cloud API to receive real customer messages.
                            </p>
                            <button className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed" disabled>
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
