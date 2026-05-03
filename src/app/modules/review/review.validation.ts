import z from "zod";

const createReviewZodSchema = z.object({
    appointmentId: z.string("Appointment Id is required"),
    rating: z.number("Rating is required").min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string("Rating is required").min(1, "Review must be at least 1 characters long"),
});

const updateReviewZodSchema = z.object({
    rating: z.number("Rating is required").min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string("Rating is required").min(1, "Review must be at least 1 characters long"),
});

export const ReviewValidation = {
    createReviewZodSchema,
    updateReviewZodSchema,
};