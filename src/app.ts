import express, { Application, Request, Response } from "express"
import cors from "cors";
import { IndexRoute } from "./app/routes";

const app: Application = express();

app.use(express.json());

app.use(cors());

// api route
app.use("/api/v1", IndexRoute);


app.get('/', (req: Request, res: Response) => {
    res.send('Cure Point Care server is running')
});

export default app;