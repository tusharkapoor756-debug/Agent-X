import { Smile, Mic, Send } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: ChatInputProps) {
    return (
        <div className="h-16 bg-white flex items-center gap-3 px-3 border-t border-gray-300">
            <Smile size={24} className="text-gray-600" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type a message"
                className="flex-1 bg-[#F0F2F5] px-4 py-2 rounded-full outline-none text-black"
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
            />
            {value.trim() ? (
                <button onClick={onSend}>
                    <Send size={24} className="text-[#075E54]" />
                </button>
            ) : (
                <Mic size={24} className="text-gray-600" />
            )}
        </div>
    );
}
