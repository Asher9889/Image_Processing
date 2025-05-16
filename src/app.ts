import express from 'express';
import config from './config';
import cors from 'cors'
import apiRoutes from "./routes"
import { checkRouteExists, globalErrorHandler } from './utils';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({limit: "10mb"}))
app.use(express.urlencoded())
app.use("/api", apiRoutes)

app.use(checkRouteExists);

app.use(globalErrorHandler);


app.listen(config.port, ()=> {
    console.log(`Server is ruuning on Port ${config.port}`);
})