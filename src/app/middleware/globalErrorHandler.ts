/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { IErrorResponse, IErrorSources } from "../interfaces/error.interface";



export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let stack : string | undefined = undefined

    if (envVars.NODE_ENV === "development") {
        console.log('Error from Global error handler: ', err);
    }

    const errorSources: IErrorSources[] = [];

    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server error";

    // Zod Error Patern
    /* error.issues; 
     [
      {
        expected: 'string',
        code: 'invalid_type',
        path: [ 'username' ],
        message: 'Invalid input: expected string'
      },
      {
        expected: 'number',
        code: 'invalid_type',
        path: [ 'xp' ],
        message: 'Invalid input: expected number'
      }
    ] */

    if (err instanceof z.ZodError) {
        statusCode = status.BAD_REQUEST;
        message = "Zod validation error";

        err.issues.forEach((issue) => {
            errorSources.push({
                path: issue.path.join(" => "),
                message: issue.message,
            })
        });
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
    }

    const errorResponse : IErrorResponse = {
        success: false,
        message: message,
        errorSources,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        data: envVars.NODE_ENV === "development" ? err : undefined,
    }

    res.status(statusCode).json(errorResponse);
}