import { Router } from "express";
import { PrescriptionController } from "./prescription.controller";

const router = Router();

router.get("/my-prescription", PrescriptionController.getMyPrescription);

export const PrescriptionRoute = router;