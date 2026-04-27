import app from "./app"
import { seedSuperAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";


const bootstrap = async() => {
    try {
        await seedSuperAdmin();
        app.listen(envVars.PORT, () => {
            console.log(`Server app is listening on port ${envVars.PORT}`);
        });
    } catch (error) {
        console.log('failed to start server', error);
    }
}

bootstrap();
