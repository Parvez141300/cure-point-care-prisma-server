import status from "http-status";
import { Role, Speciality } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, ICreateDoctorPayload, ICreateSuperAdminPayload } from "./user.interface";

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

            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorData.id
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            status: true,
                            id: true,
                        }
                    },
                    specialities: {
                        select: {
                            speciality: {
                                select: {
                                    id: true,
                                    title: true,
                                }
                            }
                        }
                    },
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

const createAdminInDB = async (payload: ICreateAdminPayload) => {
    const {password, admin} = payload;
    const userExists = await prisma.user.findUnique({
        where: {
            email: admin.email
        }
    });

    if (userExists) {
        throw new AppError(status.BAD_REQUEST, `User with email ${payload.admin.email} already exists`);
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: admin.name,
            email: admin.email,
            password,
            role: Role.ADMIN,
            needPasswordChange: true,
        }
    });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const adminData = await tx.admin.create({
                data: {
                    userId: userData.user.id,
                    ...admin,
                }
            });

            const adminInfo = await tx.admin.findUnique({
                where: {
                    id: adminData.id,
                },
                include: {
                    user: true,
                }
            });

            return adminInfo;
        });

        return result;
    } catch (error) {
        console.log('create admin error: ', error);
        await prisma.user.delete({ where: { id: userData.user.id } });
        throw error;
    }
}
const createSuperAdminInDB = async (payload: ICreateSuperAdminPayload) => {
    const {password, superAdmin} = payload;
    const userExists = await prisma.user.findUnique({
        where: {
            email: superAdmin.email
        }
    });

    if (userExists) {
        throw new AppError(status.BAD_REQUEST, `User with email ${payload.superAdmin.email} already exists`);
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: superAdmin.name,
            email: superAdmin.email,
            password,
            role: Role.ADMIN,
            needPasswordChange: true,
        }
    });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const adminData = await tx.admin.create({
                data: {
                    userId: userData.user.id,
                    ...superAdmin,
                }
            });

            const adminInfo = await tx.admin.findUnique({
                where: {
                    id: adminData.id,
                },
                include: {
                    user: true,
                }
            });

            return adminInfo;
        });

        return result;
    } catch (error) {
        console.log('create admin error: ', error);
        await prisma.user.delete({ where: { id: userData.user.id } });
        throw error;
    }
}

export const UserService = {
    createDoctorInDB,
    createAdminInDB,
    createSuperAdminInDB,
}