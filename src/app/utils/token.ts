import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import ms, { StringValue } from "ms";

const getAccessToken = (paylod: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        paylod,
        envVars.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: envVars.JWT_ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        envVars.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: envVars.JWT_REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );

    return refreshToken;
}

const setAccessTokenInCookie = (res: Response, token: string) => {
    const maxAge = ms(envVars.JWT_ACCESS_TOKEN_EXPIRES_IN as StringValue);
    cookieUtils.setCookie(
        res,
        "accessToken",
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: maxAge,
            path: "/",
        }
    );
}

const setRefreshTokenInCookie = (res: Response, token: string) => {
    const maxAge = ms(envVars.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue);
    cookieUtils.setCookie(
        res,
        "refreshToken",
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: maxAge,
            path: "/",
        }
    );
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    const maxAge = ms(envVars.JWT_ACCESS_TOKEN_EXPIRES_IN as StringValue);
    cookieUtils.setCookie(
        res,
        "better-auth.session_token",
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: maxAge,
            path: "/",
        }
    );
}

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenInCookie,
    setRefreshTokenInCookie,
    setBetterAuthSessionCookie,
}