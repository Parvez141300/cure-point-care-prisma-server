import { Speciality } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"

const createSpecialityInDB = async (payload: Speciality): Promise<Speciality> => {
    const speciality = await prisma.speciality.create({
        data: payload
    });

    return speciality;
}

const getAllSpecialityFromDB = async (): Promise<Speciality[]> => {
    const specialities = await prisma.speciality.findMany();
    return specialities;
}

const deleteSpecialityInDB = async (id: string): Promise<Speciality> => {
    const speciality = await prisma.speciality.delete({
        where: {
            id: id,
        },
    });
    return speciality;
}

const updateSpecialityInDB = async (id: string, payload: Speciality): Promise<Speciality> => {
    const speciality = await prisma.speciality.update({
        where: {
            id: id,
        },
        data: payload
    });

    return speciality;
}

export const SpecialityService = {
    createSpecialityInDB,
    getAllSpecialityFromDB,
    deleteSpecialityInDB,
    updateSpecialityInDB,
}