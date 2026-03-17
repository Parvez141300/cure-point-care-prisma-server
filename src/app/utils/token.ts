import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";

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

export const tokenUtils = {
    getAccessToken,
    getRefreshToken
}