/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import { envVars } from '../../config/env';
import AppError from '../errorHelpers/AppError';
import status from 'http-status';
import path from 'path';
import ejs from 'ejs';

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMPT_HOST,
    port: Number(envVars.EMAIL_SENDER.SMPT_PORT),
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMPT_USER,
        pass: envVars.EMAIL_SENDER.SMPT_PASS,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, unknown>;
    attachements?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[],
}

export const sendEmail = async ({ to, subject, templateName, templateData, attachements }: SendEmailOptions) => {
    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMPT_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachements?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType,
            })),
        });

        console.log(`Email send to: ${info.messageId}`);
    } catch (error: any) {
        console.log('Email sending error', error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to send email');
    }
};