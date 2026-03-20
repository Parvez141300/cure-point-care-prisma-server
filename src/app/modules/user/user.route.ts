import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createAdminZodSchema, createDoctorZodSchema, createSuperAdminZodSchema } from "./user.validation";


const router = Router();

router.post("/create-doctor",
    //     (req: Request, res: Response, next: NextFunction) => {
    //     const parsedResult = createDoctorZodSchema.safeParse(req.body);
    //     console.log('after parsed', parsedResult);

    //     if(!parsedResult.success){
    //         next(parsedResult.error);
    //     }
    //     // sanitized data
    //     req.body = parsedResult.data;
    //     next();
    // }
    validateRequest(createDoctorZodSchema),
    UserController.createDoctor);
router.post("/create-admin", validateRequest(createAdminZodSchema), UserController.createAdmin);
router.post("/create-super-admin", validateRequest(createSuperAdminZodSchema), UserController.createSuperAdmin);

export const UserRoute = router;