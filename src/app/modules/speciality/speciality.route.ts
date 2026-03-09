import { Router } from "express";
import { SpecialityController } from "./speciality.controller";

const router = Router();

router.get("/", SpecialityController.getAllSpeciality);
router.post("/", SpecialityController.createSpeciality);
router.delete("/:id", SpecialityController.deleteSpeciality);

export const SpecialityRoute = router;