import React, { useState, useRef, useEffect } from 'react';
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
            const response = await fetch(`http://localhost:3000/api/business/${businessId}/public`);
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

    // Initial greeting removed as per user request - AI waits for user first
    // useEffect(() => {
    //     if (userName && business && messages.length === 0) {
    //         ...
    //     }
    // }, [userName, business]);

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
            const response = await fetch(`http://localhost:3000/api/chat/${businessId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputValue,
                    userName: userName,
                    assistantName: assistantName,
                    history: messages
                        // .filter((_, index) => index !== 0) // Removed: No longer needed as we don't have a fake greeting
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
            <div className="flex items-center justify-center h-screen bg-[#e5ddd5]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#075e54] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (businessError || !business) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#e5ddd5]">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{businessError || 'Business not found'}</p>
                </div>
            </div>
        );
    }

    if (!userName) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#e5ddd5]">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-[#075e54] flex items-center justify-center text-white font-bold text-2xl">
                            {business.businessName.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center text-[#075e54] mb-2">{business.businessName}</h1>
                    <p className="text-center text-gray-600 mb-2">{business.category}</p>
                    <p className="text-center text-gray-600 mb-6">Please enter your name to start chatting.</p>
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                        placeholder="Your Name"
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-[#075e54]"
                    />
                    <button
                        onClick={handleStartChat}
                        disabled={!inputName.trim()}
                        className="w-full bg-[#075e54] text-white p-3 rounded-lg font-semibold hover:bg-[#128c7e] transition-colors disabled:opacity-50"
                    >
                        Start Chat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#e5ddd5]">
            {/* Header */}
            <div className="bg-[#075e54] p-4 flex items-center shadow-md z-10">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#075e54] font-bold mr-3">
                    {business.businessName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-white font-semibold text-lg">{assistantName}</h1>
                    <p className="text-green-100 text-xs">{business.businessName} • Online</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[75%] p-3 rounded-lg shadow-sm relative ${msg.sender === 'user'
                                ? 'bg-[#dcf8c6] rounded-tr-none'
                                : 'bg-white rounded-tl-none'
                                }`}
                        >
                            <p className="text-gray-800 text-sm leading-relaxed">{msg.text}</p>
                            <span className="text-[10px] text-gray-500 block text-right mt-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {msg.sender === 'user' && <span className="ml-1 text-blue-500">✓✓</span>}
                            </span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f0f0] p-3 flex items-center space-x-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message"
                    className="flex-1 py-2 px-4 rounded-full border-none focus:ring-0 focus:outline-none bg-white shadow-sm"
                />
                <button
                    onClick={handleSendMessage}
                    className="p-3 rounded-full bg-[#075e54] text-white hover:bg-[#128c7e] transition-colors shadow-sm flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
