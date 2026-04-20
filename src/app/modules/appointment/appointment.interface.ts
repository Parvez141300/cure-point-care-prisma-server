export interface IBookAppointmentPayload {
    patientId: string;
    doctorId: string;
    scheduleId: string;
}

export interface IUpdateAppointmentPayload {
    doctorId?: string;
    scheduleId?: string;
    status?: string;
}