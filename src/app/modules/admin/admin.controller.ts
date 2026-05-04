import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendReponse";

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getAllAdminFromDB();
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin all fetched successfully",
        data: result,
    });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AdminService.getAdminByIdFromDB(id as string);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin fetched successfully",
        data: result,
    });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await AdminService.updateAdminInDB(id as string, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin updated successfully",
        data: result,
    });
});

const softDeleteAdmin = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    // console.log('user of soft delete service', user);
    const result = await AdminService.softDeleteAdminInDB(id as string, user);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin deleted successfully",
        data: result,
    });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await AdminService.changeUserStatusInDB(user, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User status changed successfully",
        data: result,
    });
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await AdminService.changeUserRoleInDB(user, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User role changed successfully",
        data: result,
    });
});

export const AdminController = {
    getAllAdmin,
    getAdminById,
    softDeleteAdmin,
    updateAdmin,
    changeUserStatus,
    changeUserRole,
}