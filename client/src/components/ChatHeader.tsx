import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
    businessName: string;
    assistantName?: string;
    onBack: () => void;
}

export default function ChatHeader({
    businessName,
    assistantName,
    onBack
}: ChatHeaderProps) {
    return (
        <div className="h-14 bg-[#075E54] flex items-center gap-3 px-4 text-white">
            <button onClick={onBack}>
                <ArrowLeft size={22} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex flex-col leading-tight">
                <span className="font-medium">{businessName}</span>
                <span className="text-xs text-green-200">
                    {assistantName ? `${assistantName} • ` : ''}online
                </span>
            </div>
        </div>
    );
}
