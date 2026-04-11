import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service";

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentService.getAllAppointmentFromDB();
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Fetched Appointments successfully",
        data: result,
    })
});

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AppointmentService.getMyAppointmentsFromDB(id as string);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Fetched Appointments successfully",
        data: result,
    })
});

const getSingleAppointment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AppointmentService.getSingleAppointmentFromDB(id as string);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Fetched Appointments successfully",
        data: result,
    })
});

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
    const appointmentData = req.body;
    const result = await AppointmentService.bookAppointmentInDB(appointmentData);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Fetched Appointments successfully",
        data: result,
    })
});

const changeAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await AppointmentService.changeAppointmentStatusInDB(id as string, status);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Fetched Appointments successfully",
        data: result,
    })
});

export const AppointmentController = {
    getAllAppointments,
    getMyAppointments,
    getSingleAppointment,
    bookAppointment,
    changeAppointmentStatus
}