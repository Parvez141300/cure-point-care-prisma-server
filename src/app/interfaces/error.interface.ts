export interface IErrorSources {
    path: string;
    message: string;
}

export interface IErrorResponse {
    success: boolean;
    statusCode?: number;
    message: string;
    errorSources: IErrorSources[];
    stack?: string;
    data?: unknown;
}