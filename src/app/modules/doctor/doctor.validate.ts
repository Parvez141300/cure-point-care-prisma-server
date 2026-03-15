import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

/*
{
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    registrationNumber?: string;
    experience?: number;
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string;
    designation?: string;
    address?: string;
    gender?: Gender;
    specialities?: string[]
}
*/

export const updateDoctorZodSchema = z.object({
    name: z.string(),
    profilePhoto: z.string(),
    contactNumber: z.string(),
    registrationNumber: z.string(),
    experience: z.number(),
    appointmentFee: z.number(),
    qualification: z.string(),
    currentWorkingPlace: z.string(),
    designation: z.string(),
    address: z.string(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
    specialities: z.array(z.string()),
}).partial();