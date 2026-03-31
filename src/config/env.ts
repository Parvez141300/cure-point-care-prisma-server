import dotenv from "dotenv";
import AppError from "../app/errorHelpers/AppError";
import status from "http-status";

dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    JWT_ACCESS_TOKEN_EXPIRES_IN: string;
    JWT_REFRESH_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
    EMAIL_SENDER: {
        SMPT_HOST: string;
        SMPT_PORT: string;
        SMPT_USER: string;
        SMPT_PASS: string;
        SMPT_FROM: string;
    };
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    FRONTEND_URL: string;
}

const loadEnvVariables = (): EnvConfig => {
    const requireEnvVariable = [
        "NODE_ENV",
        "PORT",
        "DATABASE_URL",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "JWT_ACCESS_TOKEN_SECRET",
        "JWT_REFRESH_TOKEN_SECRET",
        "JWT_ACCESS_TOKEN_EXPIRES_IN",
        "JWT_REFRESH_TOKEN_EXPIRES_IN",
        "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
        "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
        "EMAIL_SENDER_SMPT_HOST",
        "EMAIL_SENDER_SMPT_PORT",
        "EMAIL_SENDER_SMPT_USER",
        "EMAIL_SENDER_SMPT_PASS",
        "EMAIL_SENDER_SMPT_FROM",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_CALLBACK_URL",
        "FRONTEND_URL",
    ];

    requireEnvVariable.forEach((variable) => {
        if (!process.env[variable]) {
            // throw new Error(`Missing env variable ${variable} in .env file`);
            throw new AppError(status.INTERNAL_SERVER_ERROR, `Missing env variable ${variable} in .env file`);
        }
    });

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
        JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
        JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
        JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as string,
        JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string,
        BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
        BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
        EMAIL_SENDER: {
            SMPT_HOST: process.env.EMAIL_SENDER_SMPT_HOST as string,
            SMPT_PORT: process.env.EMAIL_SENDER_SMPT_PORT as string,
            SMPT_USER: process.env.EMAIL_SENDER_SMPT_USER as string,
            SMPT_PASS: process.env.EMAIL_SENDER_SMPT_PASS as string,
            SMPT_FROM: process.env.EMAIL_SENDER_SMPT_FROM as string,
        },
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
    }
}

export const envVars = loadEnvVariables();