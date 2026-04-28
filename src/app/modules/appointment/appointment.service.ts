// import { uuidv7 } from "zod";
import { v7 as uuidv7 } from "uuid";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { stripe } from "../../../config/stripe.config";
import { envVars } from "../../../config/env";

const getAllAppointmentFromDB = async () => {
  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
      patient: true,
      doctorSchedule: {
        include: {
          schedule: true,
        }
      }
    }
  });

  return appointments;
};

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

const getSingleAppointmentFromDB = async (appointmentId: string, user: IRequestUser) => {
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
    const appointment = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
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

    return appointment;
  }
  else if (doctorData) {
    const appointment = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
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

    return appointment;
  }
  else {
    throw new Error("User not found");
  }
};

// pay now book appointment
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

  if (doctorSchedule.isBooked) {
    throw new AppError(status.BAD_REQUEST, "This schedule is already been booked.");
  }

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
    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        transactionId: transactionId,
        amount: doctorData.appointmentFee,
      }
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        }
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointmentId=${appointmentData.id}&paymentId=${paymentData.id}`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments?error=Payment_cancelled`,
    });

    return {
      appointmentData,
      paymentData,
      paymentUrl: session.url,
    };
  });

  return {
    appointmentData: result.appointmentData,
    paymentData: result.paymentData,
    paymentUrl: result.paymentUrl,
  };
};

const bookAppointmentWithPayLaterInDB = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
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

  if (doctorSchedule.isBooked) {
    throw new AppError(status.BAD_REQUEST, "This schedule is already been booked.");
  }

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

    const transactionId = String(uuidv7());

    const paymentData = await tx.payment.create({
      data: {
        transactionId: transactionId,
        amount: doctorData.appointmentFee,
        appointmentId: appointmentData.id,
      }
    });

    return {
      appointment: appointmentData,
      payment: paymentData,
    };
  });

  return result;
}

const initiatePaymentInDB = async (appointmentId: string, user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    }
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      patientId: patientData.id,
    },
    include: {
      doctor: true,
      payment: true,
    }
  });

  if (!appointmentData) {
    throw new AppError(status.NOT_FOUND, 'Appointment not found');
  }

  if (!appointmentData.payment) {
    throw new AppError(status.NOT_FOUND, 'Payment not found');
  }

  if (appointmentData.payment?.status === PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, 'Payment already done for this appointment');
  }

  if (appointmentData.status === AppointmentStatus.CANCELED) {
    throw new AppError(status.BAD_REQUEST, 'Appointment already cancelled');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          product_data: {
            name: `Appointment with ${appointmentData.doctor.name}`,
          },
          unit_amount: appointmentData.doctor.appointmentFee * 100,
        },
        quantity: 1,
      }
    ],
    metadata: {
      appointmentId: appointmentData.id,
      paymentId: appointmentData.payment?.id,
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
  });

  return ({
    paymentUrl: session.url
  });
}

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
    if (appointmentData.status === AppointmentStatus.COMPLETED || appointmentData.status === AppointmentStatus.CANCELED) {
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
  if (user.role === Role.DOCTOR) {
    if (appointmentData.status === AppointmentStatus.COMPLETED || appointmentData.status === AppointmentStatus.CANCELED) {
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
  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
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

const cancelUnpaidAppointmentsInDB = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unpaidAppointments = await prisma.appointment.findMany({
    where: {
      status: AppointmentStatus.SCHEDULED,
      createdAt: {
        lte: thirtyMinutesAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentToCancel = unpaidAppointments.map((appointment) => (appointment.id));

  await prisma.$transaction(async (tx) => {
    await tx.appointment.updateMany({
      where: {
        id: {
          in: appointmentToCancel,
        }
      },
      data: {
        status: AppointmentStatus.CANCELED,
      }
    });

    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentToCancel,
        }
      }
    });

    for (const unpaidAppointment of unpaidAppointments) {
      await tx.doctorSchedule.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unpaidAppointment.doctorId,
            scheduleId: unpaidAppointment.doctorScheduleId,
          },
        },
        data: {
          isBooked: false,
        }
      });
    }
  });
}


export const AppointmentService = {
  getAllAppointmentFromDB,
  getMyAppointmentsFromDB,
  getSingleAppointmentFromDB,
  bookAppointmentInDB,
  bookAppointmentWithPayLaterInDB,
  initiatePaymentInDB,
  changeAppointmentStatusInDB,
  cancelUnpaidAppointmentsInDB,
};
