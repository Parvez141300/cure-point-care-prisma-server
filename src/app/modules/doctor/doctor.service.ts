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

const deleteDoctorInDB = async (id: string) => {
    const isExistDoctor = await prisma.doctor.findUnique({
        where: {
            id: id,
        }
    });
    if(!isExistDoctor) {
        throw new Error(`Doctor with id ${id} not found`);
    }
    const doctor = await prisma.doctor.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        }
    });
    return doctor;
}

export const DoctorService = {
    getAllDoctorsFromDB,
    getDoctorByIdFromDB,
    deleteDoctorInDB,
}