import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { StatsService } from "./stats.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await StatsService.getDashboardStatsDataFromDB(user);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Dashboard stats fetched successfully",
        data: result,
    });
});

export const StatsController = {
    getDashboardStatsData,
}