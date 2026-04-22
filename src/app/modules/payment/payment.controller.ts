
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../../config/env";
import status from "http-status";
import { stripe } from "../../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendReponse";
import AppError from "../../errorHelpers/AppError";

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET as string;

    if (!signature || !webhookSecret) {
        console.error("Missing Stripe signature or webhook secret");
        return res.status(status.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error: any) {
        console.error("Error constructing Stripe webhook event", error.message);
        return res.status(status.BAD_REQUEST).json({ message: "Error constructing Stripe webhook event" });
    }

    try {
        const result = await PaymentService.handleStripeWebhookEventInDB(event);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Event processed successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error processing Stripe webhook event", error.message);
        throw new AppError(status.BAD_REQUEST, error.message);
    }
});

export const PaymentController = {
    handleStripeWebhookEvent,
}