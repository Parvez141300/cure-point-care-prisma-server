/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export const checkAuth = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // session token
            const sessionToken = cookieUtils.getCookie(req, "accessToken");

            if (!sessionToken) {
                throw new Error('Unauthorized Access! No session token provided');
            }

            if (sessionToken) {
                const isExistSession = await prisma.session.findFirst({
                    where: {
                        token: sessionToken,
                        expiresAt: {
                            gt: new Date(),
                        }
                    },
                    include: {
                        user: true,
                    }
                });

                if (isExistSession && isExistSession.user) {
                    const user = isExistSession.user;

                    const now = new Date();
                    const expiresAt = new Date(isExistSession.expiresAt);
                    const createdAt = new Date(isExistSession.createdAt);

                    const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                    const timeRemaining = expiresAt.getTime() - now.getTime();

                    const parcentRemaning = (timeRemaining / sessionLifeTime) * 100;

                    if (parcentRemaning < 20) {
                        res.setHeader("X-Session-Refresh", "true");
                        res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
                        res.setHeader("X-Time-Remaining", timeRemaining.toString());

                        console.log('sessin is expiring soon');
                    }

                    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                        throw new Error("Unauthorized Access! User is not active");
                    }

                    if (user.isDeleted) {
                        throw new Error("Unauthorized Access! User is deleted");
                    }

                    if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                        throw new Error("Forbidden Access you do not have the permission to access this resource");
                    }

                }
            }

            // access token
            const accessToken = cookieUtils.getCookie(req, "accessToken");
            console.log(accessToken);
            if (!accessToken) {
                throw new Error('Access token not found');
            }

            const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.JWT_ACCESS_TOKEN_SECRET);

            if (!verifiedToken.success) {
                throw new Error(verifiedToken.message);
            }

            if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role)) {
                throw new Error('Unauthorized you do not have the permission to access this resource');
            }

            next();
        } catch (error: any) {
            next(error);
        }
    }
}