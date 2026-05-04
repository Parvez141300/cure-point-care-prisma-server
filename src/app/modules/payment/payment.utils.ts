/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import { envVars } from "../../../config/env";

interface InvoiceData {
    invoiceId: string;
    patientName: string;
    doctorName: string;
    appointmentDate: Date;
    amount: number;
    transactionId?: string;
    paymentDate: string;
}

export const generateInvoicePdf = async (
    invoiceData: InvoiceData
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
            });

            const chunks: Buffer[] = [];

            doc.on("data", (chunk) => {
                chunks.push(chunk);
            });

            doc.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            doc.on("error", (error) => {
                reject(error);
            });

            // Title
            doc
                .fontSize(24)
                .font("Helvetica-Bold")
                .text("INVOICE", { align: "center" });

            doc.moveDown(0.5);

            doc
                .fontSize(10)
                .font("Helvetica")
                .text("Cure Point Care Services", { align: "center" });

            doc.text("Your Health, Our Priority", { align: "center" });

            doc.moveDown(1);

            // Line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(1);

            // Invoice Info
            doc.fontSize(11).font("Helvetica-Bold").text("Invoice Details");

            doc
                .fontSize(10)
                .font("Helvetica")
                .text(`Invoice ID: ${invoiceData.invoiceId}`)
                .text(
                    `Payment Date: ${new Date(
                        invoiceData.paymentDate
                    ).toLocaleDateString()}`
                );

            if (invoiceData.transactionId) {
                doc.text(`Transaction ID: ${invoiceData.transactionId}`);
            }

            doc.moveDown(0.8);

            // Patient Info
            doc.fontSize(11).font("Helvetica-Bold").text("Patient Information");

            doc
                .fontSize(10)
                .font("Helvetica")
                .text(`Name: ${invoiceData.patientName}`);

            doc.moveDown(0.8);

            // Doctor Info
            doc.fontSize(11).font("Helvetica-Bold").text("Doctor Information");

            doc
                .fontSize(10)
                .font("Helvetica")
                .text(`Name: Dr. ${invoiceData.doctorName}`);

            doc.moveDown(0.8);

            // Appointment Info
            doc.fontSize(11).font("Helvetica-Bold").text("Appointment Details");

            doc
                .fontSize(10)
                .font("Helvetica")
                .text(
                    `Appointment Date: ${new Date(
                        invoiceData.appointmentDate
                    ).toLocaleDateString()}`
                );

            doc.moveDown(1);

            // Line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(1);

            // Payment Summary
            doc.fontSize(11).font("Helvetica-Bold").text("Payment Summary");

            doc.moveDown(0.5);

            doc
                .fontSize(10)
                .font("Helvetica")
                .text(`Consultation Fee: ${invoiceData.amount} BDT`)
                .text(`Total Paid: ${invoiceData.amount} BDT`);

            doc.moveDown(1);

            // Line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

            doc.moveDown(1);

            // Footer
            doc
                .fontSize(9)
                .font("Helvetica")
                .text(
                    "This is an electronically generated invoice. No signature is required.",
                    { align: "center" }
                );

            doc.text(`For more information, visit: ${envVars.FRONTEND_URL}`, {
                align: "center",
            });

            // End
            doc.end();
        } catch (error: any) {
            console.log(`Error generating invoice pdf`, error.message);
        }
    });
};