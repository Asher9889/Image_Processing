import express, { NextFunction, Request, Response } from 'express';
import config from './config/index';
import cors from 'cors';
import apiRoutes from "./routes/index";
import { checkRouteExists, globalErrorHandler } from './utils/index';
import path from 'path';
// import connectMongoDB from './db/connectMongoDB';
import connectMSSQL from './db/connectMSSQL';

const app = express();


// connectMongoDB().catch((err) => {
//     console.log(err)
// })
connectMSSQL().catch((err) => {
    console.log(err)
});

app.use(cors({
    origin: "*",  
    methods: ['GET', 'POST'],
    credentials: false,
    // allowedHeaders: ['']               
}));


  

// app.options('*', cors({
//     origin: "http://localhost:5173",
//     methods: ['GET', 'POST', 'OPTIONS'],
//     credentials: false,
//   }));
  


app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded())



app.use("/api", apiRoutes)

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/temp', express.static(path.join(__dirname, '../temp')));

app.use(checkRouteExists);

app.use(globalErrorHandler as any);


app.listen(config.port, () => {
    console.log(`Server is ruuning on Port ${config.port}`);
})