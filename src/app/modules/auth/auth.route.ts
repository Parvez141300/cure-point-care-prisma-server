import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.getNewtoken);
router.post("/change-password", checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT), AuthController.changePassword);
router.post("/logout", checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT), AuthController.logoutUser);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

router.get("/login/google", AuthController.gooleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);
router.get("/me", AuthController.getLoggedInUserInfo);

export const AuthRoute = router;