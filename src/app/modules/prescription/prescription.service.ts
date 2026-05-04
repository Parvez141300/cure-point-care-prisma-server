/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma";
import { ICreatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPdf } from "./prescription.utils";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";

const createPrescriptionInDB = async (user: IRequestUser, payload: ICreatePrescriptionPayload) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        include: {
            specialities: {
                include: {
                    speciality: true,
                },
            }
        }
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
        },
        include: {
            patient: true,
            doctor: {
                include: {
                    specialities: {
                        include: {
                            speciality: true,
                        },
                    },
                },
            },
        }
    });

    if (appointmentData.doctorId !== doctorData.id) {
        throw new AppError(status.BAD_REQUEST, 'You can only create prescription for your appointments');
    }

    const isAlreadyPrescribed = await prisma.prescription.findFirst({
        where: {
            appointmentId: payload.appointmentId,
        }
    });

    if (isAlreadyPrescribed) {
        throw new AppError(status.BAD_REQUEST, 'You have already prescribed for this appointment');
    }

    const followUpDate = new Date(payload.followUpDate);

    const result = await prisma.$transaction(async (tx) => {
        const createdPrescriptionData = await tx.prescription.create({
            data: {
                patientId: appointmentData.patientId,
                doctorId: doctorData.id,
                appointmentId: payload.appointmentId,
                instructions: payload.instructions,
                followUpDate: followUpDate,
            }
        });

        const pdfBuffer = await generatePrescriptionPdf({
            doctorName: doctorData.name,
            doctorEmail: doctorData.email,
            patientName: appointmentData.patient.name,
            patientEmail: appointmentData.patient.email,
            instructions: payload.instructions,
            followUpDate: followUpDate,
            prescriptionId: createdPrescriptionData.id,
            appointmentDate: appointmentData.createdAt,
            createdAt: new Date(),
        });

        const fileName = `Prescription-${Date.now()}.pdf`;
        const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
        const pdfUrl = uploadedFile.secure_url;

        const updatedPrescription = await tx.prescription.update({
            where: {
                id: createdPrescriptionData.id,
            },
            data: {
                pdfUrl: pdfUrl,
            }
        });

        try {
            const patientData = appointmentData.patient;
            const doctorData = appointmentData.doctor;

            await sendEmail({
                to: patientData.email,
                subject: `You have received a new prescription from Dr. ${doctorData.name}`,
                templateName: 'prescription',
                templateData: {
                    doctorName: doctorData.name,
                    doctorEmail: doctorData.email,
                    patientName: patientData.name,
                    patientEmail: patientData.email,
                    instructions: payload.instructions,
                    followUpDate: followUpDate,
                    prescriptionId: createdPrescriptionData.id,
                    appointmentDate: appointmentData.createdAt,
                    createdAt: new Date(),
                    specialization: appointmentData.doctor.specialities.map(s => s.speciality.title).join(', '),
                },
                attachements: [{
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                }],
            });

        } catch (error: any) {
            console.log('Error for sending prescription email:', error.message);
        }

        return updatedPrescription;
    });

    return result;
}

const getAllPrescriptionsFromDB = async () => {
    const result = await prisma.prescription.findMany();
    return result;
}

const getMyPrescriptionFromDB = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const result = await prisma.prescription.findMany({
        where: {
            patientId: patientData.id,
        },
    });

    return result;
}

const deletePrescriptionFromDB = async (user: IRequestUser, id: string) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const prescriptionData = await prisma.prescription.findUniqueOrThrow({
        where: {
            id: id,
            patientId: patientData.id,
        },
    });

    const result = await prisma.prescription.delete({
        where: {
            id: prescriptionData.id,
        }
    });

    return result;
}

export const PrescriptionService = {
    createPrescriptionInDB,
    getMyPrescriptionFromDB,
    getAllPrescriptionsFromDB,
    deletePrescriptionFromDB,
}