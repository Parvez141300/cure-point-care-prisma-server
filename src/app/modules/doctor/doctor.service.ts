import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";

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

const updateDoctorInDB = async (id: string, payload: IUpdateDoctorPayload) => {
    const { specialities, ...doctorData } = payload;

    const isExistDoctor = await prisma.doctor.findUnique({
        where: {
            id: id,
        }
    });

    if (!isExistDoctor) {
        throw new Error(`Doctor with id ${id} not found`);
    }

    const result = await prisma.$transaction(async (tx) => {
        // update doctor information
        const doctor = await tx.doctor.update({
            where: {
                id: id,
            },
            data: {
                ...doctorData,
            }
        });
        if (specialities && specialities.length) {
            // doctor existing specialities
            const existingDoctorSpecialities = await tx.doctorSpeciality.findMany({
                where: {
                    doctorId: id,
                }
            });
            // A    B   C
            const existingIds = existingDoctorSpecialities.map(s => s.specialityId);

            // to add speciality    A   B   D
            const toAdd = specialities?.filter(s => !existingIds.includes(s));
            // to remove speciality     A   B   D
            const toRemove = existingIds.filter(s => !specialities?.includes(s));

            if (toRemove && toRemove.length > 0) {
                await tx.doctorSpeciality.deleteMany({
                    where: {
                        doctorId: id,
                        specialityId: { in: toRemove }
                    }
                });
            }
            
            if (toAdd && toAdd?.length > 0) {
                await tx.doctorSpeciality.createMany({
                    data: toAdd.map(specialityId => (
                        {
                            doctorId: id,
                            specialityId: specialityId,
                        }
                    ))
                });
            }

        }

        return doctor;
    })

    return result;
}

const deleteDoctorInDB = async (id: string) => {
    const isExistDoctor = await prisma.doctor.findUnique({
        where: {
            id: id,
        }
    });
    if (!isExistDoctor) {
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
    updateDoctorInDB,
    deleteDoctorInDB,
}