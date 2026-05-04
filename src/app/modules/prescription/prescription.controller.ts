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

const getAllPrescriptions = catchAsync(async (req: Request, res: Response) => {
    const result = await PrescriptionService.getAllPrescriptionsFromDB();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Prescriptions fetched successfully",
        data: result,
    });
});

const createPrescription = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await PrescriptionService.createPrescriptionInDB(user, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Prescription created successfully",
        data: result,
    });
});

const deletePrescription = catchAsync(async (req: Request, res: Response) => {
    const { id: prescriptionId } = req.params;
    const user = req.user;
    const result = await PrescriptionService.deletePrescriptionFromDB(user, prescriptionId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Prescription deleted successfully",
        data: result,
    });
});

export const PrescriptionController = {
    getMyPrescription,
    getAllPrescriptions,
    deletePrescription,
    createPrescription,
}