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

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.getDoctorByIdFromDB(id as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor fetched successfully",
        data: result,
    })
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.deleteDoctorInDB(id as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor deleted successfully",
        data: result,
    })
});

export const DoctorController = {
    getAllDoctors,
    getDoctorById,
    deleteDoctor,
}