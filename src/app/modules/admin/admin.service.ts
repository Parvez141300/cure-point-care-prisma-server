import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateAdminPayload } from "./admin.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getAllAdminFromDB = async () => {
    const admins = await prisma.user.findMany({
        where: {
            role: Role.ADMIN,
        },
        include: {
            admin: true,
        }
    });
    return admins;
};

const getAdminByIdFromDB = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id: id,
        },
        include: {
            user: true,
        }
    });

    if (!admin) {
        throw new AppError(status.NOT_FOUND, `Admin with id ${id} not found`);
    }

    return admin;
}

const updateAdminInDB = async (id: string, payload: IUpdateAdminPayload) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id: id,
        }
    });
    if (!admin) {
        throw new AppError(status.NOT_FOUND, `Admin with id ${id} not found`);
    }

    const result = await prisma.$transaction(async (tx) => {
        const admin = await tx.admin.update({
            where: {
                id: id,
            },
            data: {
                ...payload,
            }
        });
        const user = await tx.user.update({
            where: {
                id: admin.userId,
            },
            data: {
                name: payload.name ? payload.name : admin.name,
                image: payload.profilePhoto ? payload.profilePhoto : admin.profilePhoto,
            }
        });
        return {
            admin,
            user,
        };
    });

    return result;
}

const softDeleteAdminInDB = async (id: string, user: IRequestUser) => {

    const admin = await prisma.admin.findUnique({
        where: {
            id: id,
        }
    });
    if (!admin) {
        throw new AppError(status.NOT_FOUND, `Admin with id ${id} not found`);
    }

    console.log('admin data', admin);
    console.log('user data', user);

    if (admin.userId === user.userId) {
        throw new AppError(status.UNAUTHORIZED, `You can not delete yourself`);
    }

    const result = await prisma.admin.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        }
    });
    return result;
}

export const AdminService = {
    getAllAdminFromDB,
    getAdminByIdFromDB,
    softDeleteAdminInDB,
    updateAdminInDB,
}