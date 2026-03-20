import { Router } from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateAdminZodSchema } from "./admin.validate";

const router = Router();

router.get("/", AdminController.getAllAdmin);
router.get("/:id", AdminController.getAdminById);
router.patch("/:id", validateRequest(updateAdminZodSchema), AdminController.updateAdmin);
router.delete("/:id", AdminController.softDeleteAdmin);

export const AdminRoute = router;