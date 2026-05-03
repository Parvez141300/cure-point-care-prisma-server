/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

export const deleteUploadedFilesFromGlobalErrorHandler = async (req: Request) => {
    try {
        const filesToDelete: string[] = [];
        
        if (req.file && req.file?.path) {
            filesToDelete.push(req.file.path);
        }
        else if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
            // {
            //     profilePhoto: [{path: "http://..."}],
            //     medicalReports: [[{path: "http://..."}], [{path: "http://..."}]]
            // }
            // =>
            // [[{path: "http://..."}], [{path: "http://..."}]]
            Object.values(req.files).forEach(fileArray => {
                fileArray.forEach(file => {
                    if (file.path) {
                        filesToDelete.push(file.path);
                    };
                });
            });
        } else if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (file.path) {
                    filesToDelete.push(file.path);
                };
            });
        }

        if (filesToDelete.length > 0) {
            await Promise.all(
                filesToDelete.map(url => deleteFileFromCloudinary(url))
            );
            console.log(`Files ${filesToDelete.join(",")} deleted from cloudinary`);
        }
    } catch (error: any) {
        console.log('Error deleting uploaded files', error.message);
    }
};