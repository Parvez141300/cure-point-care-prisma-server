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

export const AdminController = {
    getAllAdmin,
}