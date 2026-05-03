import z from "zod";

const createPrescriptionZodSchema = z.object({
    appointmentId: z.string("Appointment Id is required"),
    instructions: z.string("Instructions is required").min(1, "Instructions must be at least 1 characters long"),
    followupDate: z.string("Followup Date must be valid").optional(),
});

const updatePrescriptionZodSchema = z.object({
    instructions: z.string("Instructions is required").min(1, "Instructions must be at least 1 characters long"),
    followupDate: z.string("Followup Date must be valid").optional(),
});

export const PrescriptionValidation = {
    createPrescriptionZodSchema,
    updatePrescriptionZodSchema,
};