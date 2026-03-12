import app from "./app"
import { envVars } from "./config/env";


const bootstrap = () => {
    try {
        app.listen(envVars.PORT, () => {
            console.log(`Server app is listening on port ${envVars.PORT}`);
        });
    } catch (error) {
        console.log('failed to start server', error);
    }
}

bootstrap();
