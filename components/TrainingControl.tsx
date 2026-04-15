"use client";
import { useState, useEffect } from "react";
import { startTraining } from "@/lib/api";

interface Props {
    jobId: string | null;
    onStarted: () => void;
    onToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function TrainingControl({ jobId, onStarted, onToast }: Props) {
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);

    // Reset whenever a new job is uploaded
    useEffect(() => {
        setStarted(false);
        setLoading(false);
    }, [jobId]);

    const handleStart = async () => {
        if (!jobId) return;
        setLoading(true);
        try {
            await startTraining(jobId);
            setStarted(true);
            onStarted();
            onToast("success", "Training started successfully!");
        } catch (e) {
            onToast("error", e instanceof Error ? e.message : "Failed to start training");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-base font-semibold text-white">Training Control</h2>
            </div>

            <div className="space-y-4">
                {jobId ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                        <span className="text-xs text-[#6b7280]">Job ID:</span>
                        <span className="text-xs font-mono text-blue-400 truncate">{jobId}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                        <span className="text-xs text-[#6b7280]">Upload a CSV file first to get a Job ID</span>
                    </div>
                )}

                <button
                    onClick={handleStart}
                    disabled={!jobId || loading || started}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm
            transition-all duration-200
            ${!jobId || started
                            ? "bg-[#1a1a24] text-[#6b7280] cursor-not-allowed border border-[#2a2a3a]"
                            : loading
                                ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-400 text-black cursor-pointer shadow-lg shadow-green-500/20 hover:shadow-green-500/30 animate-pulse-glow"
                        }`}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin-slow" />
                            Starting...
                        </>
                    ) : started ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Training Started
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                            Start Training
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
