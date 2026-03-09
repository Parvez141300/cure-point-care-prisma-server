import { Router } from "express";
import { SpecialityRoute } from "../modules/speciality/speciality.route";

const router = Router();

router.use("/specialities", SpecialityRoute);

export const IndexRoute = router;