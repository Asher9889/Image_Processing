import express from "express";
import devicesRoutes from "./upload.routes"
const router = express.Router();


router.use("/upload", devicesRoutes)


export default router;