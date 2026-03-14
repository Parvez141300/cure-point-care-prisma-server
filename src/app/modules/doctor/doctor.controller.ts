import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { DoctorService } from "./doctor.service";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
    const result = await DoctorService.getAllDoctorsFromDB();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctors all fetched successfully",
        data: result,
    })
});

export const DoctorController = {
    getAllDoctors,
}