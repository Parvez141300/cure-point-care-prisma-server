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

const getMyDoctorScheduleFromDB = async () => { }

const getAllDoctorScheduleFromDB = async () => { }

const getDoctorScheduleByIdFromDB = async (doctorId: string, scheduleId: string) => { }

const updateMyDoctorScheduleInDB = async ( user: IRequestUser, payload: IUpdateDoctorSchedulePayload) => {
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

const deleteMyDoctorScheduleFromDB = async (scheduleId: string) => { }

export const DoctorScheduleService = {
    createDoctorScheduleInDB,
    getMyDoctorScheduleFromDB,
    getAllDoctorScheduleFromDB,
    getDoctorScheduleByIdFromDB,
    updateMyDoctorScheduleInDB,
    deleteMyDoctorScheduleFromDB,
}