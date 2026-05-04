import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma";

const getDashboardStatsDataFromDB = async (user: IRequestUser) => {
    let statsData;

    switch (user.role) {
        case Role.SUPER_ADMIN:
            statsData = getSuperAdminStatsData();
            break;

        case Role.ADMIN:
            statsData = getAdminStatsData();
            break;

        case Role.DOCTOR:
            statsData = getDoctorStatsData(user);
            break;

        case Role.PATIENT:
            statsData = getPatientStatsData(user);
            break;

        default:
            throw new AppError(status.FORBIDDEN, "You do not have permission to access this resource");
            break;
    }

    return statsData;
}

const getSuperAdminStatsData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const userCount = await prisma.user.count();
    const adminCount = await prisma.admin.count({
        where: {
            user: {
                role: Role.ADMIN,
            },
        },
    });
    const superAdminCount = await prisma.admin.count({
        where: {
            user: {
                role: Role.SUPER_ADMIN,
            },
        },
    });
    const specialityCount = await prisma.speciality.count();
    const paymentCount = await prisma.payment.count();
    const reviewCount = await prisma.review.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: PaymentStatus.PAID,
        },
    });

    const pieChartData = await getPieChartData();
    const barChartData = await getBarChartData();

    return {
        appointmentCount,
        doctorCount,
        patientCount,
        adminCount,
        superAdminCount,
        specialityCount,
        paymentCount,
        userCount,
        reviewCount,
        totalRevenue: totalRevenue._sum.amount || 0,
        pieChartData,
        barChartData,
    };
}

const getAdminStatsData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const userCount = await prisma.user.count();
    const adminCount = await prisma.admin.count({
        where: {
            user: {
                role: Role.ADMIN,
            },
        },
    });
    const specialityCount = await prisma.speciality.count();
    const paymentCount = await prisma.payment.count();
    const reviewCount = await prisma.review.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: PaymentStatus.PAID,
        },
    });

    const pieChartData = await getPieChartData();
    const barChartData = await getBarChartData();

    return {
        appointmentCount,
        doctorCount,
        patientCount,
        adminCount,
        specialityCount,
        paymentCount,
        userCount,
        reviewCount,
        totalRevenue: totalRevenue._sum.amount || 0,
        pieChartData,
        barChartData,
    };
}

const getDoctorStatsData = async (user: IRequestUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const reviewCount = await prisma.review.count({
        where: {
            doctorId: doctorData?.id,
        }
    });

    const patientCount = await prisma.appointment.groupBy({
        by: ["patientId"],
        _count: {
            id: true,
        },
        where: {
            doctorId: doctorData?.id,
        },
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            doctorId: doctorData?.id,
        },
    });

    const doctorRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            appointment: {
                doctorId: doctorData?.id,
            },
            status: PaymentStatus.PAID,
        },
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        where: {
            doctorId: doctorData?.id,
        },
    });

    const formatedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ _count, status }) => ({
        status,
        count: _count.id,
    }));

    return {
        reviewCount,
        patientCount: patientCount.length,
        appointmentCount,
        doctorRevenue: doctorRevenue._sum.amount || 0,
        apppointmentStatusDistribution: formatedAppointmentStatusDistribution,
    };
}

const getPatientStatsData = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            patientId: patientData?.id,
        },
    });

    const reviewCount = await prisma.review.count({
        where: {
            patientId: patientData?.id,
        }
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        where: {
            patientId: patientData?.id,
        },
    });

    const formatedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ _count, status }) => ({
        status,
        count: _count.id,
    }));

    const patientExpense = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            appointment: {
                patientId: patientData?.id,
            },
            status: PaymentStatus.PAID,
        }
    });

    return {
        appointmentCount,
        reviewCount,
        patientExpense: patientExpense._sum.amount || 0,
        appointmentStatusDistribution: formatedAppointmentStatusDistribution,
    };
}

const getPieChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
    });

    const formatedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ _count, status }) => ({
        status,
        count: _count.id,
    }));

    return formatedAppointmentStatusDistribution;
}

const getBarChartData = async () => {
    interface appointmentCountByMonth {
        month: Date;
        count: bigint
    }

    const appointmentCountByMonth: appointmentCountByMonth[] = await prisma.$queryRaw`
    SELECT 
    DATE_TRUNC('month', "createdAt") AS month, 
    CAST(COUNT(*) AS bigint) AS count
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC;
    `;

    const convertData = appointmentCountByMonth.map(({month, count}) => ({
        month,
        count: Number(count.toString()),
    }));

    return convertData;
}


export const StatsService = {
    getDashboardStatsDataFromDB,
}