import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const getAllReviewsFromDB = async () => {
    const result = await prisma.review.findMany();
    return result;
};

const getMyReviewsFromDB = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const result = await prisma.review.findMany({
        where: {
            patientId: patientData.id,
        },
    });
    return result;
}

const createReviewInDB = async (user: IRequestUser, payload: ICreateReviewPayload) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
        },
    });

    if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
        throw new AppError(status.BAD_REQUEST, 'You can only review for paid appointments');
    }

    if (appointmentData.patientId !== patientData.id) {
        throw new AppError(status.BAD_REQUEST, 'You can only review for your appointments');
    }

    const isExistedReview = await prisma.review.findFirst({
        where: {
            appointmentId: payload.appointmentId,
        }
    });

    if (isExistedReview) {
        throw new AppError(status.BAD_REQUEST, 'You have already reviewed for this appointment');
    }

    const result = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                patientId: patientData.id,
                doctorId: appointmentData.doctorId,
                appointmentId: payload.appointmentId,
                rating: payload.rating,
                comment: payload.comment,
            }
        });

        const averageRating = await tx.review.aggregate({
            where: {
                doctorId: appointmentData.doctorId,
            },
            _avg: {
                rating: true,
            }
        });

        await tx.doctor.update({
            where: {
                id: appointmentData.doctorId,
            },
            data: {
                averageRating: averageRating._avg.rating as number,
            }
        });

        return review;
    });

    return result;
}

const updateReviewInDB = async () => {

}

const deleteReviewFromDB = async () => {

}

export const ReviewService = {
    getAllReviewsFromDB,
    getMyReviewsFromDB,
    createReviewInDB,
    updateReviewInDB,
    deleteReviewFromDB
};