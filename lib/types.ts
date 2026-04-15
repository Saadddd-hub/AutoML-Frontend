export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface StatusResponse {
    job_id: string;
    status: JobStatus;
    progress: number;
    message?: string;
    logs?: string[];
}

export interface ModelResult {
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    cv_mean?: number;
    cv_std?: number;
}

export interface ResultsResponse {
    job_id: string;
    best_model: string;
    accuracy: number;
    leaderboard: ModelResult[];
    metrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1: number;
    };
    cross_validation?: {
        mean: number;
        std: number;
        scores: number[];
    };
}

export interface Toast {
    id: string;
    type: "success" | "error" | "info";
    message: string;
    exiting?: boolean;
}
