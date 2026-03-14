import { Router } from "express";
import { SpecialityRoute } from "../modules/speciality/speciality.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { UserRoute } from "../modules/user/user.route";
import { DoctorRoute } from "../modules/doctor/doctor.route";

const router = Router();

router.use("/auth", AuthRoute);
router.use("/specialities", SpecialityRoute);
router.use("/users", UserRoute);
router.use("/doctors", DoctorRoute);

export const IndexRoute = router;