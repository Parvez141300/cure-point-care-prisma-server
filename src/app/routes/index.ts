import { Router } from "express";
import { SpecialityRoute } from "../modules/speciality/speciality.route";
import { AuthRoute } from "../modules/auth/auth.route";

const router = Router();

router.use("/auth", AuthRoute);
router.use("/specialities", SpecialityRoute);

export const IndexRoute = router;