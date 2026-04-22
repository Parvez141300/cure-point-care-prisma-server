/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";

const handleStripeWebhookEventInDB = async (event: Stripe.Event) => {
    const existingPayment = await prisma.payment.findFirst({
        where: {
            stripeEventId: event.id,
        }
    });
    if (existingPayment) {
        console.log(`Event ${event.id} already processed`);
        return { message: `Event ${event.id} already processed` };
    }
    switch (event.type) {
        case "checkout.session.completed":
            {
                const session = event.data.object;
                const appointmentId = session?.metadata?.appointmentId;
                const paymentId = session.metadata?.paymentId;
                if (!paymentId || !appointmentId) {
                    console.log("Missing appointmentId or paymentId in session");
                    return { message: "Missing appointmentId or paymentId in session" };
                }

                const appointment = await prisma.appointment.findUnique({
                    where: {
                        id: appointmentId,
                    }
                });

                if (!appointment) {
                    console.log(`Appointment with id ${appointmentId} not found`);
                    return { message: `Appointment with id ${appointmentId} not found` };
                }

                await prisma.$transaction(async (tx) => {
                    await tx.appointment.update({
                        where: {
                            id: appointmentId,
                        },
                        data: {
                            paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        }
                    });

                    await tx.payment.update({
                        where: {
                            id: paymentId,
                        },
                        data: {
                            stripeEventId: event.id,
                            status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                            paymentGatewayData: session as any,
                        }
                    });
                });

                console.log(`Processed checkout.session.completed for appointmentId: ${appointmentId} and paymentId: ${paymentId}`);
                break;
            }
        case "checkout.session.expired":
            {
                const session = event.data.object;
                console.log(`checkout session ${session.id} expired. Marking payment as failed`);
                break;
            }
        case "payment_intent.payment_failed":
            {
                const session = event.data.object;
                console.log(`Payment intent ${session.id} failed. Marking payment as failed.`);
                break;
            }

        default:
            console.log(`unhandled event type ${event.type}`);
            break;
    }
    return {message: `Webhook Processed event: ${event.id} successfully`};
};

export const PaymentService = {
    handleStripeWebhookEventInDB,
}