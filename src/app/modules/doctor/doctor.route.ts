import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateDoctorZodSchema } from "./doctor.validate";

const router = Router();

router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorById);
router.patch("/:id", validateRequest(updateDoctorZodSchema), DoctorController.updateDoctor);
router.delete("/:id", DoctorController.deleteDoctor);

export const DoctorRoute = router;