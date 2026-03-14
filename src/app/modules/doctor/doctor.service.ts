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

export const DoctorService = {
    getAllDoctorsFromDB,
}