

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

export interface ICreateAdminPayload {
    password: string;
    admin: {
        name: string;
        email: string;
        profilePhoto: string;
        contactNumber: string;
        address: string;
        experience: number;
        gender: Gender;        
    };
}
export interface ICreateSuperAdminPayload {
    password: string;
    superAdmin: {
        name: string;
        email: string;
        profilePhoto: string;
        contactNumber: string;
        address: string;
        experience: number;
        gender: Gender;        
    };
}