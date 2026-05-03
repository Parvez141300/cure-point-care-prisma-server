/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { IErrorResponse, IErrorSources } from "../interfaces/error.interface";
import AppError from "../errorHelpers/AppError";
import { handleZodError } from "../errorHelpers/HandleZodError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";



export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    let stack: string | undefined = undefined

    if (envVars.NODE_ENV === "development") {
        console.log('Error from Global error handler: ', err);
    }

    // if (req.file) {
    //     await deleteFileFromCloudinary(req.file.path);
    // }

    // if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    //     const imageUrls = req.files.map((file: any) => file.path);
    //     await Promise.all(imageUrls.map((url: string) => deleteFileFromCloudinary(url)));
    // }

    await deleteUploadedFilesFromGlobalErrorHandler(req);

    let errorSources: IErrorSources[] = [];

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
        const simpifiedZodError = handleZodError(err);
        statusCode = simpifiedZodError.statusCode as number;
        message = simpifiedZodError.message;

        errorSources = [...simpifiedZodError.errorSources];
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            },
        ]
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            },
        ]
    }

    const errorResponse: IErrorResponse = {
        success: false,
        message: message,
        errorSources,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        data: envVars.NODE_ENV === "development" ? err : undefined,
    }

    res.status(statusCode).json(errorResponse);
}