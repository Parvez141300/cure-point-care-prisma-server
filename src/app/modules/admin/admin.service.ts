import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

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
    const admin = await prisma.user.findUnique({
        where: {
            id: id,
        },
        include: {
            admin: true,
        }
    });
    
    if(!admin){
        throw new AppError(status.NOT_FOUND, `Admin with id ${id} not found`);
    }

    return admin;
}

export const AdminService = {
    getAllAdminFromDB,
    getAdminByIdFromDB,
}