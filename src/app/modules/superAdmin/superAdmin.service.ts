import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateSuperAdminPayload } from "./superAdmin.interface";

const getAllSuperAdminFromDB = async () => {
    const superAdmins = await prisma.user.findMany({
        where: {
            role: Role.SUPER_ADMIN,
        },
        include: {
            admin: true,
        }
    });
    return superAdmins;
};

const getSuperAdminByIdFromDB = async (id: string) => {
    const superAdmin = await prisma.admin.findUnique({
        where: {
            id: id,
        },
        include: {
            user: true,
        }
    });

    if (!superAdmin) {
        throw new AppError(status.NOT_FOUND, `super Admin with id ${id} not found`);
    }

    return superAdmin;
}

const updateSuperAdminInDB = async (id: string, payload: IUpdateSuperAdminPayload) => {
    const superAdmin = await prisma.admin.findUnique({
        where: {
            id: id,
        }
    });
    if (!superAdmin) {
        throw new AppError(status.NOT_FOUND, `Admin with id ${id} not found`);
    }

    const result = await prisma.admin.update({
        where: {
            id: id,
        },
        data: {
            ...payload,
        }
    });

    return result;
}

const softDeleteSuperAdminInDB = async (id: string) => {
    const superAdmin = await prisma.admin.findUnique({
        where: {
            id: id,
        }
    });
    if (!superAdmin) {
        throw new AppError(status.NOT_FOUND, `Admin with id ${id} not found`);
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

export const SuperAdminService = {
    getAllSuperAdminFromDB,
    getSuperAdminByIdFromDB,
    softDeleteSuperAdminInDB,
    updateSuperAdminInDB,
}