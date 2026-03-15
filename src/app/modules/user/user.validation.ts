import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
    password: z.string("Password is Required").min(8, "Password must be at least 8 characters long").max(20, "Password must be at most 20 characters long"),
    doctor: z.object({
        name: z.string("Name is Requried").min(5, "Name must be at least 5 characters long").max(100, "Name must be at most 100 characters long"),

        email: z.email("Invalid email"),

        profilePhoto: z.string("Profile Photo is Required").min(5, "Profile Photo must be at least 5 characters long").max(100, "Profile Photo must be at most 100 characters long"),

        contactNumber: z.string("Contact Number is Required").min(11, "Contact Number must be at least 11 characters long").max(14, "Contact Number must be at most 14 characters long"),

        address: z.string("Address is Required").min(5, "Address must be at least 5 characters long").max(100, "Address must be at most 100 characters long").optional(),

        registrationNumber: z.string("Registration Number is Required"),

        experience: z.int("Experience is Required").nonnegative("Expericence cannot be negative").optional(),

        appointmentFee: z.number("Appointment Fee is Required").nonnegative("Appointment Fee cannot be negative"),

        qualification: z.string("Qualification is Required").min(5, "Qualification must be at least 5 characters long").max(100, "Qualification must be at most 100 characters long").optional(),

        currentWorkingPlace: z.string("Current Working Place is Required").min(5, "Current Working Place must be at least 5 characters long").max(100, "Current Working Place must be at most 100 characters long").optional(),

        designation: z.string("Designation is Required").min(5, "Designation must be at least 5 characters long").max(100, "Designation must be at most 100 characters long").optional(),

        gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], "Gender is Required"),

    }),
    specialities: z.array(z.uuid("Speciality ID is Required")).min(1, "At least one Speciality is Required"),
});