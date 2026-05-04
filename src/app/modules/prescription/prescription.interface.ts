export interface ICreatePrescriptionPayload {
    appointmentId: string;
    instructions: string;
    followUpDate: Date;
}

export interface IUpdatePrescriptionPayload {
    instructions?: string;
    followUpDate?: Date;
}