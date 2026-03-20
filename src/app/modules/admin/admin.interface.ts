import { Gender } from "../../../generated/prisma/enums"

export interface IUpdateAdminPayload {
    name?: string
    email?: string
    profilePhoto?: string
    contactNumber?: string
    address?: string
    experience?: number
    gender?: Gender
}