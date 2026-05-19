import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utils/cookie";
import { envVars } from "../../../config/env";
import { auth } from "../../lib/auth";
import { AuthService } from "./auth.service";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerPatientInDB(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Patient registered successfully",
        data: {
            ...rest,
            token,
            accessToken,
            refreshToken,
        },
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUserInDB(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            ...rest,
            token,
            accessToken,
            refreshToken,
        },
    });
});

const getNewtoken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string;
    const sessionToken = req.cookies["better-auth.session_token"] as string;
    if (!refreshToken) {
        throw new AppError(status.UNAUTHORIZED, 'Invalid refresh token');
    }
    const result = await AuthService.getNewtokenFromDB(refreshToken, sessionToken);

    const { accessToken, refreshToken: newRefreshToken, sessionToken: newSessionToken } = result;

    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, newSessionToken);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Token refreshed successfully",
        data: result,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"] as string;
    const result = await AuthService.changePasswordInDB(payload, betterAuthSessionToken);
    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password changed successfully",
        data: result,
    });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"] as string;
    const result = await AuthService.logoutUserInDB(betterAuthSessionToken);

    cookieUtils.clearCookie(res, "accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "better-auth.session_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged out successfully",
        data: result,
    });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyEmailInBetterAuth(email, otp);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Email verified successfully",
        data: result,
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await AuthService.forgetPasswordInBetterAuth(email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset OTP sent to email successfully",
        data: result,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    const result = await AuthService.resetPasswordInBetterAuth(email, otp, newPassword);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset successfully",
        data: result,
    });
});

const gooleLogin = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";
    const encodeRedirectPath = encodeURIComponent(redirectPath as string);
    const callbackUrl = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodeRedirectPath}`;

    res.render("googleRedirect", { callbackUrl: callbackUrl, betterAuthUrl: envVars.BETTER_AUTH_URL });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"] as string;

    if (!sessionToken) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=Oauth Login failed!`);
    }

    const session = await auth.api.getSession({
        headers: {
            "Cookie": `better-auth.session_token=${sessionToken}`
        }
    });

    if (!session) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=Session not found!`);
    }

    if (session && !session.user) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no user found!`);
    }

    const result = await AuthService.googleLoginSuccessFromDB(session);

    const { accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);

    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//") && !redirectPath.includes("/\\");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}?auth=success`);
});

const handleOAuthError = catchAsync(async (req: Request, res: Response) => {
    const error = req.query.error as string || "Unknown error occurred during OAuth login.";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});

const getLoggedInUserInfo = catchAsync(async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken as string;
    const result = await AuthService.getLoggedInUserInfoFromDB(accessToken);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: result,
    });
});

export const AuthController = {
    registerPatient,
    loginUser,
    getNewtoken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    gooleLogin,
    googleLoginSuccess,
    handleOAuthError,
    getLoggedInUserInfo,
}