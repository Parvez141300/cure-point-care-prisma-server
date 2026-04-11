import z from "zod";

const createScheduleZodSchema = z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Expected a valid date string.",
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Expected a valid date string.",
    }),
    startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Expected HH:mm format.",
    }),
    endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Expected HH:mm format.",
    }),
});

const updateScheduleZodSchema = z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Expected a valid date string.",
    }).optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Expected a valid date string.",
    }).optional(),
    startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Expected HH:mm format.",
    }).optional(),
    endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Expected HH:mm format.",
    }).optional(),
});

export const DoctorScheduleValidation = {
    createScheduleZodSchema,
    updateScheduleZodSchema,
}