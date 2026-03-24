import status from "http-status";
import { envVars } from "../../../config/env";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import { JwtPayload } from "jsonwebtoken";
import ms, { StringValue } from "ms";

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

const getNewtokenFromDB = async (refreshToken: string, sessionToken: string) => {

    const isSessionTokenExists = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true,
        }
    });

    if (!isSessionTokenExists) {
        throw new AppError(status.UNAUTHORIZED, 'Invalid session token');
    }

    const verfiyRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.JWT_REFRESH_TOKEN_SECRET);

    if (!verfiyRefreshToken.success && verfiyRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, 'Invalid refresh token');
    }

    const user = verfiyRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isDeleted: user.isDeleted,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isDeleted: user.isDeleted,
    });

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken,
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
            updatedAt: new Date(),
        }
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    };
}

export const AuthService = {
    registerPatientInDB,
    loginUserInDB,
    getNewtokenFromDB,
}