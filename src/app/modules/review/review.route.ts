import { Router } from "express";
import { ReviewController } from "./review.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", ReviewController.getAllReviews);
router.get("/my-reviews", checkAuth(Role.PATIENT), ReviewController.getMyReviews);
router.post("/", checkAuth(Role.PATIENT), ReviewController.createReview);


export const ReviewRoute = router;