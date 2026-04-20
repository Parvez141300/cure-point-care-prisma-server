import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const getAllAppointmentFromDB = async () => { };

const getMyAppointmentsFromDB = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user.email,
    }
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    }
  });

  if (patientData) {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        patient: true,
        doctorSchedule: {
          include: {
            schedule: true,
          }
        },
      }
    });

    return appointments;
  }
  else if (doctorData) {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        doctor: true,
        patient: true,
        doctorSchedule: {
          include: {
            schedule: true,
          }
        },
      }
    });

    return appointments;
  }
  else {
    throw new Error("User not found");
  }

  return [];
};

const getSingleAppointmentFromDB = async (appointmentId: string) => { };

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
        videoCallingId: videoCallingId,
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

const changeAppointmentStatusInDB = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IRequestUser) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    }
  });

  if (user.role === Role.DOCTOR) {
    if (user.email !== appointmentData.doctor.email) {
      throw new AppError(status.BAD_REQUEST, "This is not your appointment");
    }
  }

  // for patient update
  if (user.role === Role.PATIENT) {
    if(appointmentData.status === AppointmentStatus.COMPLETED || appointmentData.status === AppointmentStatus.CANCELED) {
      throw new AppError(status.BAD_REQUEST, "Appointment already completed/cancelled");
    }
    const result = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: appointmentStatus,
      }
    });

    return result;
  }

  // for doctor update
  if(user.role === Role.DOCTOR){
    if(appointmentData.status === AppointmentStatus.COMPLETED || appointmentData.status === AppointmentStatus.CANCELED) {
      throw new AppError(status.BAD_REQUEST, "Appointment already completed/cancelled");
    }
    const result = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: appointmentStatus,
      }
    });

    return result;
  }

  // for admin and super admin update
  if(user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN){
    const result = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: appointmentStatus,
      }
    });

    return result;
  }
};


export const AppointmentService = {
  getAllAppointmentFromDB,
  getMyAppointmentsFromDB,
  getSingleAppointmentFromDB,
  bookAppointmentInDB,
  changeAppointmentStatusInDB,
};
