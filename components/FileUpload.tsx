"use client";
import { useRef, useState, useCallback } from "react";
import { uploadFile } from "@/lib/api";

interface Props {
    onUploaded: (jobId: string) => void;
    onToast: (type: "success" | "error" | "info", msg: string) => void;
}

export default function FileUpload({ onUploaded, onToast }: Props) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        if (!file.name.endsWith(".csv")) {
            onToast("error", "Only CSV files are supported.");
            return;
        }
        // Clear previous state before new upload
        setUploadedFile(null);
        setJobId(null);
        setUploading(true);
        // Reset input so the same file can be re-selected
        if (inputRef.current) inputRef.current.value = "";
        try {
            const data = await uploadFile(file);
            setUploadedFile(file.name);
            setJobId(data.job_id);
            onUploaded(data.job_id);
            onToast("success", `File uploaded! Job ID: ${data.job_id}`);
        } catch (e) {
            onToast("error", e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    }, [onUploaded, onToast]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <h2 className="text-base font-semibold text-white">Upload Dataset</h2>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
          ${dragging
                        ? "border-blue-400 bg-blue-500/5 scale-[1.01]"
                        : "border-[#2a2a3a] hover:border-[#3a3a5a] hover:bg-[#1a1a24]"
                    }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={onInputChange}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin-slow" />
                        <p className="text-sm text-[#6b7280]">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
              ${dragging ? "bg-blue-500/20" : "bg-[#1a1a24]"}`}>
                            <svg className={`w-6 h-6 transition-colors ${dragging ? "text-blue-400" : "text-[#6b7280]"}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">
                                {dragging ? "Drop your CSV here" : "Drag & drop your CSV file"}
                            </p>
                            <p className="text-xs text-[#6b7280] mt-1">or click to browse</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Success state */}
            {jobId && uploadedFile && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="min-w-0">
                        <p className="text-sm text-green-400 font-medium truncate">{uploadedFile}</p>
                        <p className="text-xs text-[#6b7280] mt-0.5">
                            Job ID: <span className="font-mono text-green-400/80">{jobId}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
