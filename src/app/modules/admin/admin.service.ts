import { prisma } from "../../lib/prisma";

const getAllAdminFromDB = async () => {
    const admins = await prisma.user.findMany();
    return admins;
};