import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma";

const createPrescriptionInDB = async (payload: any) => {

}

const getMyPrescriptionFromDB = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const result = await prisma.prescription.findMany({
        where: {
            patientId: patientData.id,
        },
    });
    
    return result;
}

export const PrescriptionService = {
    createPrescriptionInDB,
    getMyPrescriptionFromDB,
}