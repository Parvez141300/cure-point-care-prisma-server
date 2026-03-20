import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/", AdminController.getAllAdmin);
router.get("/:id", AdminController.getAdminById);
router.patch("/:id", AdminController.updateAdmin);
router.delete("/:id", AdminController.softDeleteAdmin);

export const AdminRoute = router;