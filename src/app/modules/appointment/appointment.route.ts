import { Router } from "express";
import { AppointmentController } from "./appointment.controller";

const router = Router();

router.get("/", AppointmentController.getAllAppointments);
router.get("/my-appointments/:id", AppointmentController.getMyAppointments);
router.get("/:id", AppointmentController.getSingleAppointment);
router.post("/", AppointmentController.bookAppointment);
router.patch("/status/:id", AppointmentController.changeAppointmentStatus);

export const AppointmentRoute = router;