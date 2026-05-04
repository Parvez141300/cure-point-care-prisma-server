/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { generateInvoicePdf } from "./payment.utils";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";

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
                    },
                    include: {
                        doctor: true,
                        patient: true,
                        payment: true,
                    }
                });

                if (!appointment) {
                    console.log(`Appointment with id ${appointmentId} not found`);
                    return { message: `Appointment with id ${appointmentId} not found` };
                }

                let pdfBuffer = null;

                const result = await prisma.$transaction(async (tx) => {
                    const updatedAppointment = await tx.appointment.update({
                        where: {
                            id: appointmentId,
                        },
                        data: {
                            paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        }
                    });

                    let invoiceUrl = null;

                    if (session.payment_status === "paid") {
                        try {
                            pdfBuffer = await generateInvoicePdf({
                                invoiceId: appointment.payment?.id || paymentId,
                                patientName: appointment.patient.name,
                                doctorName: appointment.doctor.name,
                                appointmentDate: appointment.createdAt,
                                amount: appointment.payment?.amount || 0,
                                transactionId: appointment.payment?.transactionId,
                                paymentDate: new Date().toISOString(),
                            });

                            // upload file to cloudinary
                            const cloudinaryResponse = await uploadFileToCloudinary(pdfBuffer, `cure-point-care/invoices/${appointment.patient.name}-${appointment.id}-invoice.pdf`);

                            invoiceUrl = cloudinaryResponse.secure_url;


                        } catch (error: any) {
                            console.error(`Failed to retrieve invoice for session ${session.id}:`, error.message);
                        }
                    }

                    const updatedpayment = await tx.payment.update({
                        where: {
                            id: paymentId,
                        },
                        data: {
                            stripeEventId: event.id,
                            status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                            paymentGatewayData: session as any,
                            invoiceUrl: invoiceUrl,
                        }
                    });

                    return { updatedAppointment, updatedpayment, invoiceUrl };
                });

                if (session.payment_status === "paid" && result.invoiceUrl) {
                    try {
                        await sendEmail({
                            to: appointment.patient.email,
                            subject: `Payment confirmation and invoice for your appointment with Dr. ${appointment.doctor.name}`,
                            templateName: "invoice",
                            templateData: {
                                invoiceId: appointment.payment?.id || paymentId,
                                transactionId: appointment.payment?.transactionId,
                                patientName: appointment.patient.name,
                                doctorName: appointment.doctor.name,
                                appointmentDate: appointment.createdAt.toLocaleDateString(),
                                paymentDate: new Date().toLocaleDateString(),
                                amount: result.updatedpayment.amount,
                                invoiceUrl: result.invoiceUrl,
                            },
                            attachements: [
                                {
                                    filename: `Invoice-${appointment.patient.name}-${appointment.id}.pdf`,
                                    content: pdfBuffer || Buffer.from(""),
                                    contentType: 'application/pdf',
                                },
                            ]
                        });

                        console.log(`Sent invoice email to ${appointment.patient.email} for appointment ${appointmentId}`);
                    } catch (error: any) {
                        console.error(`Failed to send invoice email for appointment ${appointmentId}:`, error.message);
                    }
                }

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
    return { message: `Webhook Processed event: ${event.id} successfully` };
};

export const PaymentService = {
    handleStripeWebhookEventInDB,
}