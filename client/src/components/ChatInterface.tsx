import React, { useState, useRef, useEffect } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent' | 'ai';
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
    const navigate = useNavigate();
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
            const response = await fetch(`${API_URL}/api/business/${businessId}/public`);
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

    // Message Saving Logic
    const saveMessage = async (sender: 'user' | 'agent', content: string) => {
        if (!businessId) return;

        console.log("Saving:", sender, content); // DEBUG LOG

        try {
            await fetch(`${API_URL}/api/save-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    business_id: businessId,
                    sender,
                    content,
                    timestamp: new Date().toISOString(),
                })
            });
        } catch (error) {
            console.error("Failed to save message:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !businessId) return;

        const userMessage = inputValue.trim();
        const newMessage: Message = {
            id: Date.now().toString(),
            text: userMessage,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);
        await saveMessage('user', userMessage); // Save user message

        try {
            const response = await fetch(`${API_URL}/api/chat/${businessId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
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

            setTimeout(async () => {
                setMessages((prev) => [...prev, agentResponse]);
                setIsTyping(false);
                await saveMessage('agent', data.text); // Save AI message
            }, typingDelay);

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

    if (loadingBusiness) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0C0F17]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F9BFF] mx-auto shadow-[0_0_15px_rgba(79,155,255,0.5)]"></div>
                    <p className="mt-4 text-[#4F9BFF] font-sans animate-pulse">INITIALIZING...</p>
                </div>
            </div>
        );
    }

    if (businessError || !business) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0C0F17]">
                <div className="backdrop-blur-md bg-[rgba(20,25,35,0.6)] p-8 rounded-lg shadow-lg max-w-md border border-red-500/50">
                    <h2 className="text-xl font-bold text-red-500 mb-4 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">SYSTEM ERROR</h2>
                    <p className="text-gray-300 font-sans">{businessError || 'Business not found'}</p>
                </div>
            </div>
        );
    }

    if (!userName) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0C0F17]">
                <div className="backdrop-blur-md bg-[rgba(20,25,35,0.6)] p-8 rounded-2xl shadow-[0_0_20px_rgba(79,155,255,0.1)] w-96 border border-[rgba(79,155,255,0.2)]">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-[#0C0F17] border-2 border-[#4F9BFF] flex items-center justify-center text-[#4F9BFF] font-bold text-2xl shadow-[0_0_15px_rgba(79,155,255,0.3)]">
                            {business.businessName.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center text-[#4F9BFF] mb-2 tracking-wider drop-shadow-[0_0_5px_rgba(79,155,255,0.5)]">{business.businessName}</h1>
                    <p className="text-center text-[#9F70FF] mb-2 font-sans text-sm tracking-widest uppercase">{business.category}</p>
                    <p className="text-center text-gray-400 mb-6 font-sans text-sm">Identify yourself to proceed.</p>
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                        placeholder="ENTER YOUR NAME"
                        className="w-full p-3 bg-[#111621] border border-[#4F9BFF]/50 rounded-lg mb-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#4F9BFF] focus:shadow-[0_0_10px_rgba(79,155,255,0.3)] transition-all font-sans"
                    />
                    <button
                        onClick={handleStartChat}
                        disabled={!inputName.trim()}
                        className="w-full bg-transparent border border-[#4F9BFF] text-[#4F9BFF] p-3 rounded-lg font-bold hover:bg-[#4F9BFF]/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(79,155,255,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        INITIATE CHAT
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full">
            <ChatHeader
                businessName={business.businessName}
                onBack={() => navigate(-1)}
            />

            <div className="flex-1 overflow-y-auto p-3 chat-bg flex flex-col gap-2">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        sender={msg.sender}
                        text={msg.text}
                        timestamp={msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendMessage}
            />
        </div>
    );
};

export default ChatInterface;
