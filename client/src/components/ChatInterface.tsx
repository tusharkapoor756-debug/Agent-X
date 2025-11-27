import React, { useState, useRef, useEffect } from 'react';
import API_URL from '../config';
import { useParams } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface Business {
    _id: string;
    businessName: string;
    category: string;
    logo?: string;
}

const assistantNames = [
    "Raghav Kumar", "Amit Joshi", "Vikram Singh", "Arjun Mehta", "Kunal Yadav",
    "Priya Sharma", "Anjali Verma", "Neha Patel", "Sakshi Pandey", "Riya Malhotra"
];

const ChatInterface: React.FC = () => {
    const { businessId } = useParams<{ businessId: string }>();
    const [business, setBusiness] = useState<Business | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [inputName, setInputName] = useState('');
    const [loadingBusiness, setLoadingBusiness] = useState(true);
    const [businessError, setBusinessError] = useState('');

    const [assistantName] = useState(() =>
        assistantNames[Math.floor(Math.random() * assistantNames.length)]
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch business data on mount
    useEffect(() => {
        if (businessId) {
            fetchBusinessData();
        }
    }, [businessId]);

    const fetchBusinessData = async () => {
        try {
            const response = await fetch(`${API_URL}/business/${businessId}/public`);
            const data = await response.json();

            if (data.success) {
                setBusiness(data.business);
            } else {
                setBusinessError(data.error || 'Business not found');
            }
        } catch (error) {
            setBusinessError('Failed to load business information');
        }
        setLoadingBusiness(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleStartChat = () => {
        if (inputName.trim()) {
            setUserName(inputName.trim());
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !businessId) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch(`${API_URL}/chat/${businessId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputValue,
                    userName: userName,
                    assistantName: assistantName,
                    history: messages
                        .map(m => ({
                            role: m.sender === 'user' ? 'user' : 'model',
                            parts: [{ text: m.text }]
                        }))
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const agentResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.text,
                sender: 'agent',
                timestamp: new Date(),
            };

            // Simulate human-like typing delay (1-3 seconds randomly)
            const minDelay = 1000;
            const maxDelay = 3000;
            const typingDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

            setTimeout(() => {
                setMessages((prev) => [...prev, agentResponse]);
                setIsTyping(false);
            }, typingDelay);

            return;
        } catch (error) {
            setIsTyping(false);
            console.error('Error sending message:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: `Error: ${errorMessage}. Please try again.`,
                sender: 'agent',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loadingBusiness) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto shadow-[0_0_15px_#00F7A5]"></div>
                    <p className="mt-4 text-neon-green font-orbitron animate-pulse">INITIALIZING...</p>
                </div>
            </div>
        );
    }

    if (businessError || !business) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-dark">
                <div className="glass-panel p-8 rounded-lg shadow-lg max-w-md border border-red-500/50">
                    <h2 className="text-xl font-orbitron font-bold text-red-500 mb-4 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">SYSTEM ERROR</h2>
                    <p className="text-gray-300 font-inter">{businessError || 'Business not found'}</p>
                </div>
            </div>
        );
    }

    if (!userName) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-dark">
                <div className="glass-panel p-8 rounded-lg shadow-[0_0_20px_rgba(0,247,165,0.1)] w-96 border border-neon-green/30">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-bg-dark border-2 border-neon-green flex items-center justify-center text-neon-green font-orbitron font-bold text-2xl shadow-[0_0_15px_#00F7A5]">
                            {business.businessName.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <h1 className="text-2xl font-orbitron font-bold text-center text-neon-green mb-2 tracking-wider drop-shadow-[0_0_5px_#00F7A5]">{business.businessName}</h1>
                    <p className="text-center text-neon-cyan/80 mb-2 font-inter text-sm tracking-widest uppercase">{business.category}</p>
                    <p className="text-center text-gray-400 mb-6 font-inter text-sm">Identify yourself to proceed.</p>
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                        placeholder="ENTER YOUR NAME"
                        className="w-full p-3 bg-bg-dark border border-neon-green/50 rounded-lg mb-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:shadow-[0_0_10px_#00F7A5] transition-all font-inter"
                    />
                    <button
                        onClick={handleStartChat}
                        disabled={!inputName.trim()}
                        className="w-full bg-transparent border border-neon-green text-neon-green p-3 rounded-lg font-orbitron font-bold hover:bg-neon-green/10 hover:scale-105 hover:shadow-[0_0_15px_#00F7A5] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        INITIATE CHAT
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-bg-dark font-inter">
            {/* Header */}
            <div className="bg-bg-dark/90 backdrop-blur-md p-4 flex flex-col items-center border-b border-neon-green/30 shadow-[0_0_15px_rgba(0,247,165,0.1)] z-10 relative">
                <h1 className="text-3xl font-orbitron font-bold text-neon-green tracking-[0.2em] animate-pulse-glow drop-shadow-[0_0_10px_#00F7A5]">
                    AGENT-X
                </h1>
                <div className="flex items-center mt-2 space-x-2">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_5px_#00F7A5]"></div>
                    <p className="text-neon-cyan/80 text-xs tracking-widest uppercase">
                        {business.businessName} • {assistantName}
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[rgba(10,15,20,0.8)] border border-[#00FF7F] shadow-[0_0_8px_#00FF7F] rounded-xl backdrop-blur-sm m-4 relative">

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
                    >
                        <div
                            className={`max-w-[80%] p-4 rounded-xl backdrop-blur-sm ${msg.sender === 'user'
                                ? 'bg-[#00FF7F] text-black'
                                : 'bg-transparent border border-[#00FF7F] text-[#00FF7F]'
                                }`}
                        >
                            <p className="text-sm leading-relaxed font-mono">{msg.text}</p>
                            <span className={`text-[10px] block text-right mt-2 font-mono ${msg.sender === 'user' ? 'text-black/60' : 'text-[#00FF7F]/60'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start relative z-10">
                        <div className="text-[#00FF7F] animate-pulse text-xl">|</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-bg-dark p-4 border-t border-neon-green/20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-10">
                <div className="flex items-center space-x-3 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter command..."
                        className="flex-1 py-3 px-6 rounded-full bg-bg-dark border border-neon-green/30 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:shadow-[0_0_15px_rgba(0,247,165,0.3)] transition-all font-inter"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-3 rounded-full bg-transparent border border-neon-green text-neon-green hover:bg-neon-green/10 hover:shadow-[0_0_15px_#00F7A5] hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:drop-shadow-[0_0_5px_#00F7A5]">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
