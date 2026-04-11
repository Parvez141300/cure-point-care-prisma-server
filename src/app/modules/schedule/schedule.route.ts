import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { DoctorScheduleValidation } from "./schedule.validation";

const router = Router();

router.get("/", ScheduleController.getAllSchedule);
router.get("/:id", ScheduleController.getScheduleById);
router.post("/", validateRequest(DoctorScheduleValidation.createScheduleZodSchema), ScheduleController.createSchedule);
router.patch("/:id", validateRequest(DoctorScheduleValidation.updateScheduleZodSchema), ScheduleController.updateSchedule);
router.delete("/:id", ScheduleController.deleteSchedule);

export const ScheduleRoute = router;