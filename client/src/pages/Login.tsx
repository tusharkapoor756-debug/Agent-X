import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Login failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0F14] p-4 font-mono relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <div className="bg-[rgba(10,15,20,0.8)] p-8 rounded-xl shadow-[0_0_20px_rgba(0,255,127,0.2)] w-full max-w-md border border-[#00FF7F] backdrop-blur-sm relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-block bg-[#0A0F14] border-2 border-[#00FF7F] text-[#00FF7F] rounded-full p-4 mb-4 shadow-[0_0_15px_#00FF7F] animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold font-mono text-[#00FF7F] tracking-[0.2em] drop-shadow-[0_0_10px_#00FF7F] mb-2 animate-pulse">AGENT-X</h1>
                    <p className="text-[#00D16B] mt-2 text-sm tracking-widest uppercase">AI Sales Assistant Platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-[#00FF7F] mb-2 uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[#0A0F14] border border-[#00FF7F] rounded-lg text-[#C8FFC8] placeholder-[#00D16B]/50 focus:outline-none focus:border-[#00FF7F] focus:shadow-[0_0_10px_#00FF7F] transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-bold text-neon-green/80 mb-2 uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-bg-dark border border-neon-green/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:shadow-[0_0_10px_#00F7A5] transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0A0F14] border border-[#00FF7F] text-[#00FF7F] py-3 rounded-lg font-mono font-bold hover:bg-[#00FF7F]/10 hover:shadow-[0_0_15px_#00FF7F] hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#00D16B] hover:text-[#00FF7F] hover:underline transition-colors">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
