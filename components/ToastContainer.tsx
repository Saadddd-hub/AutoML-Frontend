"use client";
import { Toast } from "@/lib/types";

interface Props {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const icons = {
    success: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    info: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const colors = {
    success: "border-green-500/40 bg-green-500/10 text-green-400",
    error: "border-red-500/40 bg-red-500/10 text-red-400",
    info: "border-blue-500/40 bg-blue-500/10 text-blue-400",
};

export default function ToastContainer({ toasts, onRemove }: Props) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
            ${colors[t.type]} ${t.exiting ? "animate-toast-out" : "animate-toast-in"}`}
                >
                    <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
                    <p className="text-sm flex-1">{t.message}</p>
                    <button
                        onClick={() => onRemove(t.id)}
                        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
