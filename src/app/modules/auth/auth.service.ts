import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

const registerPatientInDB = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;
    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        }
    });

    if (!data.user) {
        throw new Error("User not found");
    }

    try {
        // todo: create patient after signup
        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email,
                }
            });

            return patientTx;
        });

        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
        });

        return { ...data, patient, accessToken, refreshToken };
    } catch (error) {
        console.log('patient profile create transaction error: ', error);
        await prisma.user.delete({
            where: {
                id: data.user.id,
            }
        });
        throw error;
    }
}

interface ILoginUserPayload {
    email: string;
    password: string;
}

const loginUserInDB = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    });

    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }

    if (data.user.status === UserStatus.DELETED) {
        throw new Error("User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };
}

export const AuthService = {
    registerPatientInDB,
    loginUserInDB,
}