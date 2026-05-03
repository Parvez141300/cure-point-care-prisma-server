import { Router } from "express";
import { ReviewController } from "./review.controller";

const router = Router();

router.get("/", ReviewController.getAllReviews);
router.post("/", ReviewController.createReview);

export const ReviewRoute = router;