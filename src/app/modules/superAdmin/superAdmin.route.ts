import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateSuperAdminZodSchema } from "./superAdmin.validate";

const router = Router();

router.get("/", SuperAdminController.getAllSuperAdmin);
router.get("/:id", SuperAdminController.getSuperAdminById);
router.patch("/:id", validateRequest(updateSuperAdminZodSchema), SuperAdminController.updateSuperAdmin);
router.delete("/:id", SuperAdminController.softDeleteSuperAdmin);

export const SuperAdminRoute = router;