import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerPatientInDB(payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Patient registered successfully",
        data: result,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUserInDB(payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Patient logged in successfully",
        data: result,
    });
});

export const AuthController = {
    registerPatient,
    loginUser,
}