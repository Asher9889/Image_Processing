import express from 'express';
import config from './config';
import apiRoutes from "./routes"
import { checkRouteExists, globalErrorHandler } from './utils';

const app = express();




app.use("/api", apiRoutes)

app.use(checkRouteExists);

app.use(globalErrorHandler);


app.listen(config.port, ()=> {
    console.log(`Server is ruuning on Port ${config.port}`);
})