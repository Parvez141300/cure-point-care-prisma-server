import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { ScheduleService } from "./schedule.service";


const getAllSchedule = catchAsync(async (req: Request, res: Response) => {

    const result = await ScheduleService.getAllScheduleFromDB();
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Fetched Schedules successfully",
        data: result,
    })
});


const getScheduleById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.getScheduleByIdFromDB(id as string);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Fetched Schedules successfully",
        data: result,
    })
});

const createSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleData = req.body;
    const result = await ScheduleService.createScheduleInDB(scheduleData);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Schedule created successfully",
        data: result,
    })
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const scheduleData = req.body;
    const result = await ScheduleService.updateScheduleInDB(id as string, scheduleData);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Schedule updated successfully",
        data: result,
    })
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.deleteScheduleFromDB(id as string);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Schedule deleted successfully",
        data: result,
    })
});

export const ScheduleController = {
    getAllSchedule,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule
}