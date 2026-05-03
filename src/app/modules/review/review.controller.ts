import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getAllReviewsFromDB();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Reviews all fetched successfully",
        data: result,
    });
});

const createReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await ReviewService.createReviewInDB(user, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review created successfully",
        data: result,
    });
});

export const ReviewController = {
    getAllReviews,
    createReview,
};