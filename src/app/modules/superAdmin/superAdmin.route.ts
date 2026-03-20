import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";

const router = Router();

router.get("/", SuperAdminController.getAllSuperAdmin);
router.get("/:id", SuperAdminController.getSuperAdminById);
router.patch("/:id", SuperAdminController.updateSuperAdmin);
router.delete("/:id", SuperAdminController.softDeleteSuperAdmin);

export const SuperAdminRoute = router;