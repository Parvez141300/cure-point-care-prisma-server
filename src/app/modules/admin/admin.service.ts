import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IChangeUserRolePayload, IChangeUserStatusPayload, IUpdateAdminPayload } from "./admin.interface";
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

const changeUserStatusInDB = async (user: IRequestUser, payload: IChangeUserStatusPayload) => {
    const isAdminExist = await prisma.admin.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        include: {
            user: true,
        },
    });

    const { userId, userStatus } = payload;

    const userToChangeStatus = await prisma.user.findUnique({
        where: {
            id: userId,
        }
    });

    const selfStatusChange = isAdminExist.userId === userId;

    if (selfStatusChange) {
        throw new AppError(status.BAD_REQUEST, "You can not change your own status");
    };

    if (isAdminExist.user.role === Role.ADMIN && userToChangeStatus?.role === Role.SUPER_ADMIN) {
        throw new AppError(status.UNAUTHORIZED, "You can not change status of a super admin. Only super admin can change status of another super admin");
    }

    if (isAdminExist.user.role === Role.ADMIN && userToChangeStatus?.role === Role.ADMIN) {
        throw new AppError(status.UNAUTHORIZED, "You can not change status of another admin. Only super admin can change status of another admin");
    }

    if (userStatus === UserStatus.DELETED) {
        throw new AppError(status.BAD_REQUEST, "You can not set user status to deleted user. Please use soft delete api to delete a user");
    }

    const result = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status: userStatus,
        }
    });

    return result;
}

const changeUserRoleInDB = async (user: IRequestUser, payload: IChangeUserRolePayload) => {
    const isAdminExist = await prisma.admin.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        include: {
            user: true,
        },
    });

    const { userId, role } = payload;

    const userToChangeRole = await prisma.user.findUnique({
        where: {
            id: userId,
        }
    });

    const selfRoleChange = isAdminExist.userId === userId;

    if (selfRoleChange) {
        throw new AppError(status.BAD_REQUEST, "You can not change your own role");
    };

    if (isAdminExist.user.role === Role.ADMIN && userToChangeRole?.role === Role.SUPER_ADMIN) {
        throw new AppError(status.UNAUTHORIZED, "You can not change role of a super admin. Only super admin can change role of another super admin");
    }

    if (isAdminExist.user.role === Role.ADMIN && userToChangeRole?.role === Role.ADMIN) {
        throw new AppError(status.UNAUTHORIZED, "You can not change role of another admin. Only super admin can change role of another admin");
    }

    if (isAdminExist.user.role === Role.DOCTOR || isAdminExist.user.role === Role.PATIENT) {
        throw new AppError(status.UNAUTHORIZED, "You are not authorized to change user role");
    }

    const result = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role: role,
        }
    });

    return result;
}

export const AdminService = {
    getAllAdminFromDB,
    getAdminByIdFromDB,
    softDeleteAdminInDB,
    updateAdminInDB,
    changeUserStatusInDB,
    changeUserRoleInDB,
}