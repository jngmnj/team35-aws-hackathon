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
export interface PersonalityAnalysisResult {
    personalityType: {
        type: string;
        description: string;
        traits: string[];
    };
    strengths: Array<{
        title: string;
        description: string;
        evidence: string;
    }>;
    weaknesses: Array<{
        title: string;
        description: string;
        improvement: string;
    }>;
    values: string[];
    interests: string[];
}
export declare function generatePersonalityAnalysis(prompt: AnalysisPrompt): Promise<PersonalityAnalysisResult>;
export interface ResumeResult {
    personalInfo: {
        summary: string;
    };
    experience: Array<{
        title: string;
        company: string;
        duration: string;
        description: string;
    }>;
    skills: string[];
    achievements: string[];
}
export declare function generateResume(prompt: ResumePrompt): Promise<ResumeResult>;
