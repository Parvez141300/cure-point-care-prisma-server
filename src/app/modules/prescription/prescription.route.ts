import { Router } from "express";
import { PrescriptionController } from "./prescription.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", PrescriptionController.getAllPrescriptions);
router.get("/my-prescription", checkAuth(Role.PATIENT, Role.DOCTOR), PrescriptionController.getMyPrescription);
router.post("/", checkAuth(Role.DOCTOR), PrescriptionController.createPrescription);
router.patch("/:id", checkAuth(Role.DOCTOR), PrescriptionController.updatePrescription);
router.delete("/:id", checkAuth(Role.PATIENT), PrescriptionController.deletePrescription);

export const PrescriptionRoute = router;