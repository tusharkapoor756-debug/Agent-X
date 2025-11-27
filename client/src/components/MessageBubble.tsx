

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
            <div className="text-[10px] text-gray-500 text-right mt-1">{timestamp}</div>
        </div>
    );
}
