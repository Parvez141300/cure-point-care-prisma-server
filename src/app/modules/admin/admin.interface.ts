import { Gender, Role, UserStatus } from "../../../generated/prisma/enums"

export interface IUpdateAdminPayload {
    name?: string
    email?: string
    profilePhoto?: string
    contactNumber?: string
    address?: string
    experience?: number
    gender?: Gender
}

export interface IChangeUserStatusPayload {
    userId: string;
    userStatus: UserStatus;
}

export interface IChangeUserRolePayload {
    userId: string;
    role: Role;
}