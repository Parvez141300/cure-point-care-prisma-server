/* eslint-disable @typescript-eslint/no-explicit-any */
import { envVars } from "../../config/env";
import { Role } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma"

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExists = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN,
            }
        });

        if (isSuperAdminExists) {
            console.log('Super admin already exixts');
            return
        }
        const superAdminUser = await auth.api.signUpEmail({
            body: {
                name: "Super Admin",
                email: envVars.SUPER_ADMIN_EMAIL,
                password: envVars.SUPER_ADMIN_PASSWORD,
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false,

            }
        });

        await prisma.$transaction(async (tx) => {

            await tx.user.update({
                where: {
                    id: superAdminUser.user.id,
                },
                data: {
                    emailVerified: true,
                }
            });

            await tx.admin.create({
                data: {
                    userId: superAdminUser.user.id,
                    email: superAdminUser.user.email,
                    name: superAdminUser.user.name,
                }
            });
        });

        const superAdmin = await prisma.admin.findFirst({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL
            },
            include: {
                user: true,
            }
        });

        console.log("Super admin created", superAdmin);
    } catch (error: any) {
        console.log("Error seeding super admin", error.message);
        await prisma.user.delete({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL,
            }
        });
    }
}