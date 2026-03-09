import app from "./app"


const bootstrap = () => {
    try {
        app.listen(5000, () => {
            console.log(`Server app is listening on port ${5000}`);
        });
    } catch (error) {
        console.log('failed to start server', error);
    }
}

bootstrap();
