import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { PatientService } from "./patient.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await PatientService.updateMyProfileInDB(user, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Patient profile updated successfully",
        data: result,
    });
});

export const PatientController = {
    updateMyProfile,
}