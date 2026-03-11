
import { Request, Response } from "express";
import { SpecialityService } from "./speciality.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";

const createSpeciality = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await SpecialityService.createSpecialityInDB(payload);
    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Speaciality created successfully",
        data: result,
    })
});

const getAllSpeciality = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialityService.getAllSpecialityFromDB();
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Speaciality all fetched successfully",
        data: result,
    })
});

const deleteSpeciality = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SpecialityService.deleteSpecialityInDB(id as string);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Successfully deleted speciality",
        data: result,
    })
});

const updateSpeciality = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await SpecialityService.updateSpecialityInDB(id as string, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Successfully updated speciality",
        data: result,
    })
});

export const SpecialityController = {
    createSpeciality,
    getAllSpeciality,
    deleteSpeciality,
    updateSpeciality,
}