import express from 'express';
import config from './config';
import apiRoutes from "./routes"
const app = express();


app.use("/api", apiRoutes)


app.listen(config.port, ()=> {
    console.log(`Server is ruuning on Port ${config.port}`);
})