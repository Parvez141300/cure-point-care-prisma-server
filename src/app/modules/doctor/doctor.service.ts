import { prisma } from "../../lib/prisma";

const getAllDoctorsFromDB = async () => {
    const doctors = await prisma.doctor.findMany({
        include: {
            user: true,
            specialities: {
                include: {
                    speciality: true,
                }
            },
        }
    });
    return doctors;
}

const getDoctorByIdFromDB = async (id: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: {
            id: id,
        },
        include: {
            user: true,
            specialities: {
                include: {
                    speciality: true,
                }
            },
        }
    });
    return doctor;
}

export const DoctorService = {
    getAllDoctorsFromDB,
    getDoctorByIdFromDB,
}