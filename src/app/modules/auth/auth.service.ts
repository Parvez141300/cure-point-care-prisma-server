import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

const registerPatientInDB = async (payload: IRegisterPatientPayload) => {
    const {name, email, password} = payload;
    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        }
    });

    if(!data.user){
        throw new Error("User not found");
    }

    // todo: create patient after signup
    // const patient = await prisma.$transaction(async (tx) => {
    //     await 
    // })

    return data;
}

interface ILoginUserPayload {
    email: string;
    password: string;
}

const loginUserInDB = async (payload: ILoginUserPayload) => {
    const {email, password} = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    });

    if(data.user.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }

    if(data.user.status === UserStatus.DELETED){
        throw new Error("User is deleted");
    }

    return data;
}

export const AuthService = {
    registerPatientInDB,
    loginUserInDB,
}