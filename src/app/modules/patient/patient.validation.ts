import z from "zod";
import { BloodGroup, Gender, MaritalStatus } from "../../../generated/prisma/enums";

const updatePatientZodSchema = z.object({
    patientInfo: z.object({
        name: z.string("Name must be string").min(1, "Name is required").max(100, "Name must be at most 100 characters long").optional(),
        profilePhoto: z.string("Profile Photo must be string").min(1, "Profile Photo is required").max(1000, "Profile Photo must be at most 1000 characters long").optional(),
        contactNumber: z.string("Contact Number must be string").min(1, "Contact Number is required").max(20, "Contact Number must be at most 20 characters long").optional(),
        address: z.string("Address must be string").min(1, "Address is required").max(100, "Address must be at most 100 characters long").optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], "Gender is Required").optional(),
    }).optional(),
    patientHealthInfo: z.object({
        gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], "Gender is Required").optional(),
        dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Date of Birth must be a valid date",
        }).optional(),
        bloodGroup: z.enum([BloodGroup.A_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_POSITIVE, BloodGroup.B_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE, BloodGroup.AB_POSITIVE, BloodGroup.AB_NEGATIVE], "Blood Group is Required").optional(),
        hasAllergies: z.boolean("Has Allergies must be boolean").optional(),
        hasDiabetes: z.boolean("Has Diabetes must be boolean").optional(),
        height: z.string("Height must be string").min(1, "Height is required").max(100, "Height must be at most 100 characters long").optional(),
        weight: z.string("Weight must be string").min(1, "Weight is required").max(100, "Weight must be at most 100 characters long").optional(),
        smokingStatus: z.boolean("Smoking Status must be boolean").optional(),
        dietaryPreferences: z.string("Dietary Preferences must be string").min(1, "Dietary Preferences is required").max(100, "Dietary Preferences must be at most 100 characters long").optional(),
        pregnancyStatus: z.boolean("Pregnancy Status must be boolean").optional(),
        mentalHealthHistory: z.string("Mental Health History must be string").min(1, "Mental Health History is required").max(100, "Mental Health History must be at most 100 characters long").optional(),
        immunizationStatus: z.string("Immunization Status must be string").min(1, "Immunization Status is required").max(100, "Immunization Status must be at most 100 characters long").optional(),
        hasPastSurgeries: z.boolean("Has Past Surgeries must be boolean").optional(),
        recentAnxiety: z.boolean("Recent Anxiety must be boolean").optional(),
        recentDepression: z.boolean("Recent Depression must be boolean").optional(),
        maritalStatus: z.enum([MaritalStatus.MARRIED, MaritalStatus.UNMARRIED, MaritalStatus.DIVORCED, MaritalStatus.WIDOWED], "Marital Status is Required").optional(),
    }).optional(),
    medicalReports: z.array(z.object({
        reportName: z.string("Report Name must be string").min(1, "Report Name is required").max(100, "Report Name must be at most 100 characters long").optional(),
        reportLink: z.string("Report Link must be string").min(1, "Report Link is required").max(1000, "Report Link must be at most 1000 characters long").optional(),
        shouldDelete: z.boolean("Should Delete must be boolean").optional(),
        reportId: z.string("Report Id must be string").min(1, "Report Id is required").max(100, "Report Id must be at most 100 characters long").optional(),
    })).refine((reports) => {
        if (!reports || reports.length === 0) return true;

        for (const report of reports) {
            if (report.shouldDelete && !report.reportId) {
                return false;
            }

            if (report.reportId && !report.shouldDelete) {
                return false;
            }

            if (report.reportName && !report.reportLink) {
                return false;
            }

            if (!report.reportName && report.reportLink) {
                return false;
            }

            return true;
        }
    }, { message: "Invalid report data" }).optional(),
});

export const PatientValidation = {
    updatePatientZodSchema,
}