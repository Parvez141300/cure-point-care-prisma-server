import { addHours, addMinutes, format } from "date-fns";
import { ICreateSchedulePayload, IUpdateSchedulePayload } from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";
import { prisma } from "../../lib/prisma";

const getAllScheduleFromDB = async () => {
  const result = await prisma.schedule.findMany();
  return result;
};

const getScheduleByIdFromDB = async (id: string) => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const createScheduleInDB = async (payload: ICreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const interval = 30; // 30 minutes interval

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  const schedules = [];

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}T${startTime}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}T${endTime}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, interval));

      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        }
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });

        schedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + interval);
    };

    currentDate.setDate(currentDate.getDate() + 1);
  };

  return schedules;
};

const updateScheduleInDB = async (id: string, payload: IUpdateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const startDateTime = new Date(
    addMinutes(
      addHours(`${format(startDate, "yyyy-MM-dd")}T${startTime}`, Number(startTime.split(":")[0])
      ),
      Number(startTime.split(":")[1])
    )
  );
  const endDateTime = new Date(
    addMinutes(
      addHours(`${format(endDate, "yyyy-MM-dd")}T${endTime}`, Number(endTime.split(":")[0])
      ),
      Number(endTime.split(":")[1])
    )
  );

  const updatedSchedule = await prisma.schedule.update({
    where: {
      id,
    },
    data: {
      startDateTime: startDateTime,
      endDateTime: endDateTime,
    }
  });

  return updatedSchedule;
};

const deleteScheduleFromDB = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ScheduleService = {
  getAllScheduleFromDB,
  getScheduleByIdFromDB,
  createScheduleInDB,
  updateScheduleInDB,
  deleteScheduleFromDB,
};