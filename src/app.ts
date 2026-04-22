import express, { Application, Request, Response } from "express"
import cors from "cors";
import { IndexRoute } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFround } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import { envVars } from "./config/env";
import { PaymentController } from "./app/modules/payment/payment.controller";

const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

// stripe webhook
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);

// middleware
app.use("/api/auth", toNodeHandler(auth));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());

// api route
app.use("/api/v1", IndexRoute);


app.get('/', (req: Request, res: Response) => {
    res.send('Cure Point Care server is running')
});

// not found route
app.use(notFround);
// global error handeling
app.use(globalErrorHandler);

export default app;