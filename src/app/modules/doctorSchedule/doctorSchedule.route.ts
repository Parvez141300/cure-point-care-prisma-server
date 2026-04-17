import { Router } from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", DoctorScheduleController.getAllDoctorSchedule);
router.get("/my-doctor-schedules", DoctorScheduleController.getMyDoctorSchedule);
router.get("/:doctorId/schedule/:scheduleId", DoctorScheduleController.getDoctorScheduleById);
router.post("/create-my-doctor-schedule", checkAuth(Role.DOCTOR), DoctorScheduleController.createDoctorSchedule);
router.patch("/update-my-doctor-schedule", checkAuth(Role.DOCTOR), DoctorScheduleController.getDoctorScheduleById);
router.delete("/delete-my-doctor-schedule/:id", DoctorScheduleController.deleteMyDoctorSchedule);

export const DoctorScheduleRoute = router;