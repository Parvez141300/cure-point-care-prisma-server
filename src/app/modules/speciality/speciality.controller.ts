/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { SpecialityService } from "./speciality.service";

const createSpeciality = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const result = await SpecialityService.createSpecialityInDB(payload);
        res.status(201).json({
            success: true,
            message: "Speaciality created successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create speciality",
            data: error.message,
        });
    }
}

const getAllSpeciality = async (req: Request, res: Response) => {
    try {
        const result = await SpecialityService.getAllSpecialityFromDB();
        res.status(200).json({
            success: true,
            message: "Speaciality all fetched successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed fetch all speciality",
            data: error.message,
        });
    }
}

const deleteSpeciality = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await SpecialityService.deleteSpecialityInDB(id as string);
        res.status(200).json({
            success: true,
            message: "Successfully deleted speciality",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to delete a speciality",
            data: error.message,
        });
    }
}

export const SpecialityController = {
    createSpeciality,
    getAllSpeciality,
    deleteSpeciality,
}