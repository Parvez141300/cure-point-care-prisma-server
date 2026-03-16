export interface IErrorSources {
    path: string;
    message: string;
}

export interface IErrorResponse {
    success: boolean;
    message: string;
    errorSources?: IErrorSources[];
    stack?: string;
    data?: unknown;
}