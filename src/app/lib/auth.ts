import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";

const convertMilisecondToSecond = (milisecond: number) => milisecond / 1000;

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL as string,
    secret: envVars.BETTER_AUTH_SECRET as string,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID as string,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET as string,
            mapProfileToUser: () => {
                return {
                    role: Role.PATIENT,
                    status: UserStatus.ACTIVE,
                    needPasswordChange: false,
                    isDeleted: false,
                    deletedAt: null,
                };
            },
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            },
        },
    },
    session: {
        expiresIn: convertMilisecondToSecond(ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
        updateAge: convertMilisecondToSecond(ms(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as StringValue)),
        cookieCache: {
            enabled: true,
            maxAge: convertMilisecondToSecond(ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                console.log(`Sending OTP ${otp} to email ${email} for ${type}`);
                // You can integrate your email sending service here to send the OTP to the user's email address.
                if (type === "email-verification") {
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (user && !user.emailVerified) {
                        sendEmail({
                            to: email,
                            subject: "Your OTP for Email Verification",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp: otp,
                            }
                        })
                    }
                }
                else if (type === "forget-password") {
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (user) {
                        sendEmail({
                            to: email,
                            subject: "Your OTP for Password Reset",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp: otp,
                            }
                        })
                    }
                }
            },
            expiresIn: 2 * 60, // OTP expires in 2 minutes
            otpLength: 6, // OTP length of 6 digits
        }),
    ],
    advanced: {
        useSecureCookies: false,
        // disableCSRFCheck: true,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                },
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                }
            },
        },
    },
    redirectURLs: {
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    },
    trustedOrigins: [envVars.FRONTEND_URL as string, envVars.BETTER_AUTH_URL as string, "http://localhost:3000", "http://localhost:5000"],
});
