import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IUpdatePatientHealthInfoPayload, IUpdatePatientProfilePayload } from "./patient.interface";
import { convertDateTime } from "./patient.utils";

const updateMyProfileInDB = async (user: IRequestUser, payload: IUpdatePatientProfilePayload) => {
    const { patientInfo, patientHealthInfo, medicalReports } = payload;

    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        },
        include: {
            patientHealthData: true,
            medicalReports: true,
        }
    });

    const result = await prisma.$transaction(async (tx) => {
        if (patientInfo) {
            await tx.patient.update({
                where: {
                    id: patientData.id
                },
                data: {
                    ...patientInfo
                },
            });

            if (patientInfo.name || patientInfo.profilePhoto) {
                const userData = {
                    name: patientInfo.name ? patientInfo.name : patientData.name,
                    image: patientInfo.profilePhoto ? patientInfo.profilePhoto : patientData.profilePhoto,
                }
                await tx.user.update({
                    where: {
                        id: patientData.userId,
                    },
                    data: {
                        ...userData,
                    }
                });
            };
        };
        if (patientHealthInfo) {
            const healthInfoToSave: IUpdatePatientHealthInfoPayload = {
                ...patientHealthInfo,
            };
            if (patientHealthInfo.dateOfBirth) {
                healthInfoToSave.dateOfBirth = convertDateTime(typeof healthInfoToSave.dateOfBirth === "string" ? healthInfoToSave.dateOfBirth : undefined) as Date;
            }

            await tx.patientHealthData.upsert({
                where: {
                    patientId: patientData.id,
                },
                update: healthInfoToSave,
                create: {
                    patientId: patientData.id,
                    ...healthInfoToSave,
                }
            });
        }
        if (medicalReports && Array.isArray(medicalReports) && medicalReports.length > 0) {
            for (const report of medicalReports) {
                if (report.shouldDelete && report.reportId) {
                    await tx.medicalReport.delete({
                        where: {
                            id: report.reportId,
                        }
                    });
                } else if (report.reportName && report.reportLink) {
                    await tx.medicalReport.create({
                        data: {
                            patientId: patientData.id,
                            reportName: report.reportName,
                            reportLink: report.reportLink,
                        }
                    });
                }
            }
        }

        const result = await tx.patient.findUniqueOrThrow({
            where: {
                email: user.email,
            },
            include: {
                user: true,
                patientHealthData: true,
                medicalReports: true,
            }
        });

        return result;
    });

    return result;
}

export const PatientService = {
    updateMyProfileInDB,
}