import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utils/cookie";

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

export const AuthController = {
    registerPatient,
    loginUser,
    getNewtoken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
}