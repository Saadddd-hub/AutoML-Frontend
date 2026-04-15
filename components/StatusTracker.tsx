"use client";
import { useEffect, useRef, useState } from "react";
import { getStatus } from "@/lib/api";
import { StatusResponse, JobStatus } from "@/lib/types";

const POLL_INTERVAL = 10; // seconds

interface Props {
    jobId: string | null;
    polling: boolean;
    onCompleted: () => void;
    onFailed: () => void;
    onToast: (type: "success" | "error" | "info", msg: string) => void;
}

const statusConfig: Record<JobStatus, { label: string; color: string; dot: string }> = {
    pending: { label: "Pending", color: "text-yellow-400", dot: "bg-yellow-400" },
    running: { label: "Running", color: "text-blue-400", dot: "bg-blue-400 animate-pulse" },
    completed: { label: "Completed", color: "text-green-400", dot: "bg-green-400" },
    failed: { label: "Failed", color: "text-red-400", dot: "bg-red-400" },
};

export default function StatusTracker({ jobId, polling, onCompleted, onFailed, onToast }: Props) {
    const [status, setStatus] = useState<StatusResponse | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [countdown, setCountdown] = useState(POLL_INTERVAL);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const doneRef = useRef(false);

    // Reset stale state whenever a new job is loaded
    useEffect(() => {
        setStatus(null);
        setLogs([]);
        setCountdown(POLL_INTERVAL);
        doneRef.current = false;
        clearInterval(intervalRef.current!);
        clearInterval(countRef.current!);
    }, [jobId]);

    useEffect(() => {
        if (!polling || !jobId) return;
        doneRef.current = false;

        const poll = async () => {
            try {
                const data: StatusResponse = await getStatus(jobId);
                setStatus(data);
                if (data.logs) {
                    setLogs((prev) => {
                        const newEntries = data.logs!.filter((l) => !prev.includes(l));
                        return newEntries.length ? [...prev, ...newEntries] : prev;
                    });
                }
                if (data.message) {
                    setLogs((prev) => prev.includes(data.message!) ? prev : [...prev, data.message!]);
                }
                if (data.status === "completed" && !doneRef.current) {
                    doneRef.current = true;
                    clearInterval(intervalRef.current!);
                    clearInterval(countRef.current!);
                    onCompleted();
                    onToast("success", "Training completed!");
                } else if (data.status === "failed" && !doneRef.current) {
                    doneRef.current = true;
                    clearInterval(intervalRef.current!);
                    clearInterval(countRef.current!);
                    onFailed();
                    onToast("error", "Training failed. You can retry.");
                }
            } catch (e) {
                onToast("error", e instanceof Error ? e.message : "Status poll failed");
            }
        };

        // immediate first call
        poll();
        setCountdown(POLL_INTERVAL);

        // poll every 10 s
        intervalRef.current = setInterval(() => {
            poll();
            setCountdown(POLL_INTERVAL);
        }, POLL_INTERVAL * 1000);

        // countdown tick every 1 s
        countRef.current = setInterval(() => {
            setCountdown((c) => (c > 0 ? c - 1 : POLL_INTERVAL));
        }, 1000);

        return () => {
            clearInterval(intervalRef.current!);
            clearInterval(countRef.current!);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [polling, jobId]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const cfg = status ? statusConfig[status.status] : null;

    return (
        <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className="text-base font-semibold text-white">Training Status</h2>
                {polling && status?.status !== "completed" && status?.status !== "failed" && (
                    <span className="ml-auto text-xs text-blue-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Next poll in {countdown}s
                    </span>
                )}
            </div>

            {!jobId ? (
                <div className="text-center py-8 text-[#6b7280] text-sm">
                    Start training to see status updates
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Status badge */}
                    {cfg && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            {status && (
                                <span className="text-sm font-mono text-white">
                                    {status.progress}%
                                </span>
                            )}
                        </div>
                    )}

                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-[#1a1a24] overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500
                ${status?.status === "running" ? "progress-bar-animated" : ""}
                ${status?.status === "completed" ? "bg-green-500" : ""}
                ${status?.status === "failed" ? "bg-red-500" : ""}
                ${status?.status === "pending" ? "bg-yellow-500" : ""}
              `}
                            style={{ width: `${status?.progress ?? 0}%` }}
                        />
                    </div>

                    {/* Logs */}
                    {logs.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wider">Logs</p>
                            <div className="bg-[#0a0a0f] rounded-lg border border-[#2a2a3a] p-3 h-32 overflow-y-auto font-mono text-xs space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i} className="text-[#6b7280]">
                                        <span className="text-green-500/60 mr-2">›</span>{log}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
