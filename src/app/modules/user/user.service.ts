import { Role, Speciality } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";

const createDoctorInDB = async (payload: ICreateDoctorPayload) => {
    const specialities: Speciality[] = [];
    for (const specialityId of payload.specialities) {
        const speciality = await prisma.speciality.findUnique({
            where: {
                id: specialityId
            }
        });

        if (!speciality) {
            throw new Error(`Speciality with id ${specialityId} not found`);
        }

        specialities.push(speciality);
    }

    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.doctor.email
        }
    });

    if (userExists) {
        throw new Error(`User with email ${payload.doctor.email} already exists`);
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: payload.doctor.name,
            email: payload.doctor.email,
            password: payload.password,
            role: Role.DOCTOR,
            needPasswordChange: true,

        }
    });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const doctorData = await tx.doctor.create({
                data: {
                    userId: userData.user.id,
                    ...payload.doctor,
                }
            });

            const doctorSpecialityData = specialities.map((speciality) => {
                return {
                    doctorId: doctorData.id,
                    specialityId: speciality.id,
                }
            });

            await tx.doctorSpeciality.createMany({
                data: doctorSpecialityData
            });

            const doctor = await prisma.doctor.findUnique({
                where: {
                    id: doctorData.id
                },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    registrationNumber: true,
                    experience: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    address: true,
                    gender: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            status: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            createdAt: true,
                            updatedAt: true,
                        }
                    },
                    specialities: {
                        select: {
                            speciality: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                }
            });

            return doctor;
        });

        return result;
    } catch (error) {
        console.log('Transaction doctor create error: ', error);
        await prisma.user.delete({ where: { id: userData.user.id } });
        throw error;
    }
};

export const UserService = {
    createDoctorInDB,
}