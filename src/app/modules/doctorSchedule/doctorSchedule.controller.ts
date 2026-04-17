import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await DoctorScheduleService.createDoctorScheduleInDB(user, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Doctor Schedule created successfully",
        data: result,
    });
});

const getMyDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.getMyDoctorScheduleFromDB(user);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Doctor Schedule fetched successfully",
        data: result,
    });
});

const getAllDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const result = await DoctorScheduleService.getAllDoctorScheduleFromDB();
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Doctor Schedule fetched successfully",
        data: result,
    });
});

const getDoctorScheduleById = catchAsync(async (req: Request, res: Response) => {
    const { doctorId, scheduleId } = req.params;
    const result = await DoctorScheduleService.getDoctorScheduleByIdFromDB(doctorId as string, scheduleId as string);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Doctor Schedule fetched successfully",
        data: result,
    });
});

const updateMyDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await DoctorScheduleService.updateMyDoctorScheduleInDB(user, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Doctor Schedule updated successfully",
        data: result,
    });
});

const deleteMyDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    await DoctorScheduleService.deleteMyDoctorScheduleFromDB(id as string, user);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Doctor Schedule deleted successfully",
    });
});

export const DoctorScheduleController = {
    createDoctorSchedule,
    getMyDoctorSchedule,
    getAllDoctorSchedule,
    getDoctorScheduleById,
    updateMyDoctorSchedule,
    deleteMyDoctorSchedule,
}