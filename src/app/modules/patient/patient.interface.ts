import { BloodGroup, Gender, MaritalStatus } from "../../../generated/prisma/enums";

export interface IUpdatePatientInfoPayload {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    gender?: Gender;
}

export interface IUpdatePatientHealthInfoPayload {
    gender: Gender;
    dateOfBirth: Date;
    bloodGroup: BloodGroup;
    hasAllergies: boolean;
    hasDiabetes: boolean;
    height: string;
    weight: string;
    smokingStatus: boolean;
    dietaryPreferences?: string;
    pregnancyStatus: boolean;
    mentalHealthHistory?: string;
    immunizationStatus?: string;
    hasPastSurgeries: boolean;
    recentAnxiety: boolean;
    recentDepression: boolean;
    maritalStatus: MaritalStatus;
}

export interface IUpdateMedicalReportPayload {
    reportName?: string;
    reportLink?: string;
    shouldDelete?: boolean;
    reportId?: string;
}

export interface IUpdatePatientProfilePayload {
    patientInfo: IUpdatePatientInfoPayload;
    patientHealthInfo: IUpdatePatientHealthInfoPayload;
    medicalReports: IUpdateMedicalReportPayload[];
}