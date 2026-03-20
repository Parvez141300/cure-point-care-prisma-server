import { Role } from "../../../generated/prisma/enums";
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

export const AdminService = {
    getAllAdminFromDB,
}