import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";

const getAllAppointmentFromDB = async () => { };

const getMyAppointmentsFromDB = async (id: string) => { };

const getSingleAppointmentFromDB = async (id: string) => { };

const bookAppointmentInDB = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedule.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: scheduleData.id,
    }
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {

    const appointmentData = await tx.appointment.create({
      data: {
        doctorId: doctorData.id,
        patientId: patientData.id,
        doctorScheduleId: doctorSchedule.id,
        videoCallingId,
      }
    });

    await tx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      }
    });

    // TODO: payment intigration will be here

    return appointmentData;
  });

  return result;
};

const changeAppointmentStatusInDB = async (id: string, status: string) => { };


export const AppointmentService = {
  getAllAppointmentFromDB,
  getMyAppointmentsFromDB,
  getSingleAppointmentFromDB,
  bookAppointmentInDB,
  changeAppointmentStatusInDB,
};
