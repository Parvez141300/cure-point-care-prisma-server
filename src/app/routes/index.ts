import { Router } from "express";
import { SpecialityRoute } from "../modules/speciality/speciality.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { UserRoute } from "../modules/user/user.route";

const router = Router();

router.use("/auth", AuthRoute);
router.use("/specialities", SpecialityRoute);
router.use("/doctors", UserRoute);

export const IndexRoute = router;