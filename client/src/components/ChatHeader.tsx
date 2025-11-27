import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
    businessName: string;
    onBack: () => void;
}

export default function ChatHeader({ businessName, onBack }: ChatHeaderProps) {
    const initials = businessName ? businessName[0].toUpperCase() : "A";

    return (
        <div className="h-14 bg-[#075E54] flex items-center gap-3 px-4 text-white">
            <button onClick={onBack}><ArrowLeft size={22} /></button>

            <div className="w-10 h-10 rounded-full bg-white text-[#075E54] flex items-center justify-center font-bold">
                {initials}
            </div>

            <div className="flex flex-col leading-tight">
                <span className="font-medium">{businessName}</span>
                <span className="text-sm text-green-200">online</span>
            </div>
        </div>
    );
}
