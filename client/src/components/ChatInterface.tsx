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
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface Business {
    _id: string;
    businessName: string;
    category: string;
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

    const [assistantName] = useState(
        () => assistantNames[Math.floor(Math.random() * assistantNames.length)]
    );

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch business data
    useEffect(() => {
        if (!businessId) return;
        fetchBusinessData();
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
        } catch (err) {
            setBusinessError("Failed to load business details");
        }
        setLoadingBusiness(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleStartChat = () => {
        if (inputName.trim()) {
            setUserName(inputName.trim());
        }
    };

    // SAVE MESSAGE
    const saveMessage = async (sender: 'user' | 'agent', content: string) => {
        if (!businessId) return;
        try {
            await fetch(`${API_URL}/save-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business_id: businessId,
                    sender,
                    content,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (err) {
            console.error("Message save failed:", err);
        }
    };

    // SEND MESSAGE
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();

        const newMessage: Message = {
            id: `${Date.now()}`,
            text: userText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);

        await saveMessage('user', userText);

        try {
            const response = await fetch(`${API_URL}/chat/${businessId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userText,
                    userName,
                    assistantName,
                    history: messages.map((m) => ({
                        role: m.sender === "user" ? "user" : "model",
                        parts: [{ text: m.text }],
                    })),
                }),
            });

            const data = await response.json();

            const agentMessage: Message = {
                id: `${Date.now() + 1}`,
                text: data.text,
                sender: "agent",
                timestamp: new Date(),
            };

            setTimeout(async () => {
                setMessages((prev) => [...prev, agentMessage]);
                setIsTyping(false);

                await saveMessage('agent', data.text);
            }, 1200);

        } catch (err) {
            setIsTyping(false);

            const errorMessage: Message = {
                id: `${Date.now() + 2}`,
                text: "Error sending message. Try again.",
                sender: "agent",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    if (loadingBusiness) {
        return (
            <div className="flex items-center justify-center h-screen text-white">Loading...</div>
        );
    }

    if (businessError || !business) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                {businessError}
            </div>
        );
    }

    if (!userName) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-[350px]">
                    <h1 className="text-center text-2xl font-semibold text-white mb-6">{business.businessName}</h1>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full mb-4 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                    />

                    <button
                        onClick={handleStartChat}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-2 text-white rounded"
                    >
                        Start Chat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full">
            <ChatHeader businessName={business.businessName} onBack={() => navigate(-1)} />

            <div className="p-4 flex flex-col space-y-3 bg-[#ECE5DD] flex-1 overflow-y-auto">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        sender={msg.sender}
                        text={msg.text}
                        timestamp={msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    />
                ))}

                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSendMessage} />
        </div>
    );
};

export default ChatInterface;
