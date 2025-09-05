export interface AnalysisPrompt {
    documents: Array<{
        type: string;
        title: string;
        content: string;
    }>;
}
export interface ResumePrompt {
    documents: Array<{
        type: string;
        title: string;
        content: string;
    }>;
    jobCategory: string;
    jobTitle?: string;
}
export declare function generatePersonalityAnalysis(prompt: AnalysisPrompt): Promise<any>;
export declare function generateResume(prompt: ResumePrompt): Promise<any>;
