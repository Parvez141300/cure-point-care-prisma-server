import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { ICreateDoctorSchedulePayload, IUpdateDoctorSchedulePayload } from "./doctorSchedule.interface"

const createDoctorScheduleInDB = async (user: IRequestUser, payload: ICreateDoctorSchedulePayload) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            userId: user.userId
        },
    });

    const scheduleData = payload.scheduleIds.map((scheduleId) => ({
        doctorId: doctorData.id,
        scheduleId
    }));

    const result = await prisma.doctorSchedule.createMany({
        data: scheduleData
    });

    return result;
}

const getMyDoctorScheduleFromDB = async (user: IRequestUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            userId: user.userId
        }
    });

    const result = await prisma.doctorSchedule.findMany({
        where: {
            doctorId: doctorData.id
        },
        include: {
            schedule: true
        }
    });

    return result;
}

const getAllDoctorScheduleFromDB = async () => {
    const result = await prisma.doctorSchedule.findMany({
        include: {
            schedule: true
        }
    });

    return result;
}

const getDoctorScheduleByIdFromDB = async (doctorId: string, scheduleId: string) => {
    const result = await prisma.doctorSchedule.findUnique({
        where: {
            doctorId_scheduleId: {
                doctorId,
                scheduleId
            }
        },
        include: {
            schedule: true
        }
    });

    return result;
}

const updateMyDoctorScheduleInDB = async (user: IRequestUser, payload: IUpdateDoctorSchedulePayload) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            userId: user.userId
        }
    });

    const deleteIds = payload.scheduleIds.filter((scheduleId) => scheduleId.shouldDelete).map((scheduleId) => scheduleId.id);

    const createIds = payload.scheduleIds.filter((scheduleId) => !scheduleId.shouldDelete).map((scheduleId) => scheduleId.id);

    const result = await prisma.$transaction(async (tx) => {
        await tx.doctorSchedule.deleteMany({
            where: {
                doctorId: doctorData.id,
                scheduleId: {
                    in: deleteIds,
                }
            }
        });

        const doctorScheduleData = createIds.map((scheduleId) => ({
            doctorId: doctorData.id,
            scheduleId
        }));

        const result = await tx.doctorSchedule.createMany({
            data: doctorScheduleData
        });

        return result;
    });

    return result;
}

const deleteMyDoctorScheduleFromDB = async (scheduleId: string, user: IRequestUser) => {
    await prisma.doctor.findUniqueOrThrow({
        where: {
            userId: user.userId
        }
    });

    const result = await prisma.doctorSchedule.deleteMany({
        where: {
            scheduleId
        }
    });

    return result;
}

export const DoctorScheduleService = {
    createDoctorScheduleInDB,
    getMyDoctorScheduleFromDB,
    getAllDoctorScheduleFromDB,
    getDoctorScheduleByIdFromDB,
    updateMyDoctorScheduleInDB,
    deleteMyDoctorScheduleFromDB,
}