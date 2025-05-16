import express from "express";
import devicesRoutes from "./devices.routes"
const router = express.Router();


router.use("/register", devicesRoutes)


export default router;