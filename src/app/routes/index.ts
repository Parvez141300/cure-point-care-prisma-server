import { Router } from "express";
import { SpecialityRoute } from "../modules/speciality/speciality.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { UserRoute } from "../modules/user/user.route";
import { DoctorRoute } from "../modules/doctor/doctor.route";
import { AdminRoute } from "../modules/admin/admin.route";
import { SuperAdminRoute } from "../modules/superAdmin/superAdmin.route";
import { ScheduleRoute } from "../modules/schedule/schedule.route";
import { AppointmentRoute } from "../modules/appointment/appointment.route";
import { DoctorScheduleRoute } from "../modules/doctorSchedule/doctorSchedule.route";

const router = Router();

router.use("/auth", AuthRoute);
router.use("/specialities", SpecialityRoute);
router.use("/users", UserRoute);
router.use("/doctors", DoctorRoute);
router.use("/admins", AdminRoute);
router.use("/super-admins", SuperAdminRoute);
router.use("/schedules", ScheduleRoute);
router.use("/doctor-schedules", DoctorScheduleRoute);
router.use("/appointments", AppointmentRoute);

export const IndexRoute = router;