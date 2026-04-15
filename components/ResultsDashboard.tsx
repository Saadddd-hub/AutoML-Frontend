"use client";
import { useEffect, useState } from "react";
import { getResults } from "@/lib/api";

// ── Real API shape ──────────────────────────────────────────────────────────
interface ApiResults {
    target_column: string;
    task_type: string;
    best_model: string;
    accuracy: number;
    model_path: string;
    leaderboard: [string, number][];          // [modelName, accuracy]
    cv_results: Record<string, { cv_mean: number; cv_std: number }>;
    metrics: Record<string, {
        accuracy: number;
        precision: number;
        recall: number;
        f1_score: number;
    }>;
}

interface Props {
    jobId: string | null;
    visible: boolean;
    onToast: (type: "success" | "error" | "info", msg: string) => void;
}

function pct(v: number) { return (v * 100).toFixed(2) + "%"; }

function MetricPill({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-lg bg-[#1a1a24] border border-[#2a2a3a] p-4 flex flex-col gap-1">
            <p className="text-xs text-[#6b7280] uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{pct(value)}</p>
            <div className="h-1 rounded-full bg-[#2a2a3a] overflow-hidden mt-1">
                <div className={`h-full rounded-full ${color.replace("text-", "bg-")}`}
                    style={{ width: `${value * 100}%` }} />
            </div>
        </div>
    );
}

const rankStyle = [
    "bg-yellow-500/20 text-yellow-400",
    "bg-gray-400/20 text-gray-300",
    "bg-orange-500/20 text-orange-400",
];

export default function ResultsDashboard({ jobId, visible, onToast }: Props) {
    const [results, setResults] = useState<ApiResults | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible || !jobId) return;
        setResults(null);
        setLoading(true);
        getResults(jobId)
            .then(setResults)
            .catch((e) => onToast("error", e instanceof Error ? e.message : "Failed to load results"))
            .finally(() => setLoading(false));
    }, [visible, jobId, onToast]);

    if (!visible) return null;

    return (
        <div className="animate-fade-in space-y-6">
            {/* Section header */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0
                 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946
                 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138
                 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806
                 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438
                 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
                <h2 className="text-base font-semibold text-white">Results Dashboard</h2>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin-slow" />
                </div>
            )}

            {results && !loading && (
                <div className="space-y-6">

                    {/* ── Best model hero card ─────────────────────────────────────── */}
                    <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                        <div className="relative">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-xs font-medium text-green-400 uppercase tracking-wider
                  px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                    Best Model
                                </span>
                                <span className="text-xs text-[#6b7280] capitalize">{results.task_type}</span>
                                <span className="text-xs text-[#6b7280]">·</span>
                                <span className="text-xs text-[#6b7280]">Target: <span className="text-white">{results.target_column}</span></span>
                            </div>
                            <div className="flex items-end justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="text-2xl font-bold text-white">{results.best_model}</p>
                                    <p className="text-sm text-[#6b7280] mt-1 font-mono truncate max-w-xs">{results.model_path}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-bold text-green-400">{pct(results.accuracy)}</p>
                                    <p className="text-xs text-[#6b7280] mt-1">Overall Accuracy</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Per-model metrics ────────────────────────────────────────── */}
                    {Object.entries(results.metrics).map(([model, m]) => (
                        <div key={model} className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <p className="text-sm font-semibold text-white">{model}</p>
                                {model === results.best_model && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                        Best
                                    </span>
                                )}
                                {results.cv_results[model] && (
                                    <span className="ml-auto text-xs text-[#6b7280]">
                                        CV: <span className="text-white">{pct(results.cv_results[model].cv_mean)}</span>
                                        <span className="text-[#6b7280]"> ±{pct(results.cv_results[model].cv_std)}</span>
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <MetricPill label="Accuracy" value={m.accuracy} color="text-green-400" />
                                <MetricPill label="Precision" value={m.precision} color="text-blue-400" />
                                <MetricPill label="Recall" value={m.recall} color="text-purple-400" />
                                <MetricPill label="F1 Score" value={m.f1_score} color="text-yellow-400" />
                            </div>
                        </div>
                    ))}

                    {/* ── Leaderboard ──────────────────────────────────────────────── */}
                    <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                            <p className="text-xs text-[#6b7280] uppercase tracking-wider">Model Leaderboard</p>
                            <p className="text-xs text-[#6b7280]">{results.leaderboard.length} models</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#2a2a3a]">
                                        {["Rank", "Model", "Accuracy", "CV Mean", "CV Std"].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.leaderboard.map(([name, acc], i) => {
                                        const cv = results.cv_results[name];
                                        return (
                                            <tr key={name}
                                                className={`border-b border-[#2a2a3a]/50 transition-colors hover:bg-[#1a1a24]
                          ${name === results.best_model ? "bg-green-500/5" : ""}`}>
                                                <td className="px-4 py-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${rankStyle[i] ?? "bg-[#1a1a24] text-[#6b7280]"}`}>
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white">{name}</span>
                                                        {name === results.best_model && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                                                Best
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 rounded-full bg-[#2a2a3a] overflow-hidden">
                                                            <div className="h-full rounded-full bg-green-500/70"
                                                                style={{ width: `${acc * 100}%` }} />
                                                        </div>
                                                        <span className="text-white font-mono text-xs">{pct(acc)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-blue-400">
                                                    {cv ? pct(cv.cv_mean) : "—"}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">
                                                    {cv ? `±${pct(cv.cv_std)}` : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
