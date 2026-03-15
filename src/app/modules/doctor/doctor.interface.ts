import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorPayload {
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

