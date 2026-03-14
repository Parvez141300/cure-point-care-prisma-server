

import { Gender } from "../../../generated/prisma/enums";

export interface ICreateDoctorPayload {
    password: string;
    doctor: {
        name: string;
        email: string;
        profilePhoto: string;
        contactNumber: string;
        registrationNumber: string;
        experience: number;
        appointmentFee: number;
        qualification: string;
        currentWorkingPlace: string;
        designation: string;
        address: string;
        gender: Gender;
    };
    specialities: string[]; 
}