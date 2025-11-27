

interface BubbleProps {
    sender: "user" | "agent" | "ai";
    text: string;
    timestamp: string;
}

export default function MessageBubble({
    sender,
    text,
    timestamp
}: BubbleProps) {
    const isUser = sender === "user";

    return (
        <div
            className={`max-w-[75%] px-3 py-2 rounded-xl shadow-sm text-black ${isUser
                ? "bg-[#DCF8C6] ml-auto rounded-br-none"
                : "bg-white rounded-bl-none"
                }`}
        >
            <div className="text-[15px]">{text}</div>
            <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-gray-500">{timestamp}</span>
                {sender === "user" && (
                    <span className="text-blue-600 text-xs">✓✓</span>
                )}
            </div>
        </div>
    );
}
