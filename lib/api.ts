//const BASE = "http://127.0.0.1:8000";
const BASE = "https://automl-ml-engine.onrender.com/";

export async function uploadFile(file: File): Promise<{ job_id: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/upload/`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return res.json();
}

export async function startTraining(jobId: string): Promise<unknown> {
    const res = await fetch(`${BASE}/train/${jobId}`, { method: "POST" });
    if (!res.ok) throw new Error(`Training start failed: ${res.statusText}`);
    return res.json();
}

export async function getStatus(jobId: string) {
    const res = await fetch(`${BASE}/status/${jobId}`);
    if (!res.ok) throw new Error(`Status fetch failed: ${res.statusText}`);
    return res.json();
}

export async function getResults(jobId: string) {
    const res = await fetch(`${BASE}/results/${jobId}`);
    if (!res.ok) throw new Error(`Results fetch failed: ${res.statusText}`);
    return res.json();
}
