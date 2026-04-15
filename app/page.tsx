"use client";
import { useCallback, useState } from "react";
import FileUpload from "@/components/FileUpload";
import TrainingControl from "@/components/TrainingControl";
import StatusTracker from "@/components/StatusTracker";
import ResultsDashboard from "@/components/ResultsDashboard";
import ToastContainer from "@/components/ToastContainer";
import { Toast } from "@/lib/types";
import { startTraining } from "@/lib/api";

let toastCounter = 0;

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [failed, setFailed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = String(++toastCounter);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  const handleUploaded = (id: string) => {
    setJobId(id);
    setPolling(false);
    setShowResults(false);
    setFailed(false);
  };

  const handleTrainingStarted = () => {
    setPolling(true);
    setShowResults(false);
    setFailed(false);
  };

  const handleCompleted = () => {
    setPolling(false);
    setShowResults(true);
  };

  const handleFailed = () => {
    setPolling(false);
    setFailed(true);
  };

  const handleRetry = async () => {
    if (!jobId) return;
    setFailed(false);
    setPolling(true);
    try {
      await startTraining(jobId);
      addToast("info", "Retrying training...");
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Retry failed");
      setFailed(true);
      setPolling(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <header className="border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="font-semibold text-white text-sm">AutoML Platform</span>
            </div>
            <div className="flex items-center gap-2">
              {jobId && (
                <span className="text-xs text-[#6b7280] font-mono hidden sm:block">
                  {jobId}
                </span>
              )}
              <div className={`w-2 h-2 rounded-full transition-colors ${polling ? "bg-blue-400 animate-pulse" :
                  showResults ? "bg-green-400" :
                    failed ? "bg-red-400" :
                      "bg-[#2a2a3a]"
                }`} />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">ML Training Dashboard</h1>
            <p className="text-sm text-[#6b7280] mt-1">Upload your dataset, train models, and explore results</p>
          </div>

          {/* Top grid: Upload + Control + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <FileUpload onUploaded={handleUploaded} onToast={addToast} />
            <TrainingControl jobId={jobId} onStarted={handleTrainingStarted} onToast={addToast} />
            <div className="md:col-span-2 xl:col-span-1">
              <StatusTracker
                jobId={jobId}
                polling={polling}
                onCompleted={handleCompleted}
                onFailed={handleFailed}
                onToast={addToast}
              />
            </div>
          </div>

          {/* Retry banner */}
          {failed && (
            <div className="mb-6 flex items-center justify-between gap-4 px-5 py-4 rounded-xl
              border border-red-500/30 bg-red-500/5 animate-fade-in">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-400">Training failed</p>
                  <p className="text-xs text-[#6b7280]">Something went wrong during the training process</p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20
                  border border-red-500/30 text-red-400 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          )}

          {/* Results */}
          <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-6">
            {!showResults ? (
              <div className="text-center py-16 text-[#6b7280]">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">Results will appear here after training completes</p>
              </div>
            ) : (
              <ResultsDashboard jobId={jobId} visible={showResults} onToast={addToast} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
