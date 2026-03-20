import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import { SuperAdminService } from "./superAdmin.service";

const getAllSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await SuperAdminService.getAllSuperAdminFromDB();
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin all fetched successfully",
        data: result,
    });
});

const getSuperAdminById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SuperAdminService.getSuperAdminByIdFromDB(id as string);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin fetched successfully",
        data: result,
    });
});

const updateSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await SuperAdminService.updateSuperAdminInDB(id as string, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin updated successfully",
        data: result,
    });
});

const softDeleteSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SuperAdminService.softDeleteSuperAdminInDB(id as string);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin deleted successfully",
        data: result,
    });
})

export const SuperAdminController = {
    getAllSuperAdmin,
    getSuperAdminById,
    softDeleteSuperAdmin,
    updateSuperAdmin,
}