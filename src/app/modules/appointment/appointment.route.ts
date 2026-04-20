import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/all-appointments", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AppointmentController.getAllAppointments);
router.get("/my-appointments", AppointmentController.getMyAppointments);
router.get("/my-single-appointment/:id", AppointmentController.getSingleAppointment);
router.post("/book-appointment", checkAuth(Role.PATIENT), AppointmentController.bookAppointment);
router.patch("/change-appointment-status/:id", checkAuth(Role.PATIENT, Role.DOCTOR, Role.SUPER_ADMIN, Role.ADMIN), AppointmentController.changeAppointmentStatus);

export const AppointmentRoute = router;