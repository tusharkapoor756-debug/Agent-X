interface BubbleProps {
    sender: "user" | "agent" | "ai";
    text: string;
    timestamp: string;
}

export default function MessageBubble({ sender, text, timestamp }: BubbleProps) {
    const isUser = sender === "user";

    return (
        <div className={`max-w-[75%] px-4 py-2 rounded-lg shadow ${isUser
            ? "bg-green-500 text-white ml-auto"
            : "bg-white text-gray-900 border"
            }`}>
            <div>{text}</div>
            <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 mt-1">
                {timestamp}
                {isUser && <span className="text-blue-600 text-xs">✓✓</span>}
            </div>
        </div>
    );
}
