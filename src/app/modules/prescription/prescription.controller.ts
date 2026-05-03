import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { PrescriptionService } from "./prescription.service";

const getMyPrescription = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.getMyPrescriptionFromDB(user);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Prescription fetched successfully",
        data: result,
    });
});

export const PrescriptionController = {
    getMyPrescription,
}