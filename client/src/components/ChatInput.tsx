import { Smile, Mic, Send } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ChatInput({ value, onChange, onSend, onKeyPress }: ChatInputProps) {
    return (
        <div className="h-16 bg-white flex items-center gap-3 px-3 border-t border-gray-300">
            <Smile size={26} className="text-gray-600" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyPress}
                className="flex-1 bg-[#F0F2F5] px-4 py-2 rounded-full outline-none text-black"
                placeholder="Type a message"
            />
            {value.trim() ? (
                <button onClick={onSend}>
                    <Send className="text-[#075E54]" size={24} />
                </button>
            ) : (
                <Mic className="text-gray-600" size={26} />
            )}
        </div>
    );
}
