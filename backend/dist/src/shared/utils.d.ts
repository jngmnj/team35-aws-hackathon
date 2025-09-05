export declare function getHeaders(): {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Methods': string;
    'Access-Control-Allow-Headers': string;
};
export declare function createResponse(statusCode: number, data: Record<string, unknown>): {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
    };
    body: string;
};
export declare function createErrorResponse(statusCode: number, message: string, code?: string, details?: unknown): {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
    };
    body: string;
};
export declare function createSuccessResponse(data: unknown, statusCode?: number, message?: string): {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
    };
    body: string;
};
