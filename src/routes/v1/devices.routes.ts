import express from "express";
import { Request, Response, NextFunction } from "express";
import { registerController } from "../../controllers";

const router = express.Router();

router.post("/upload", registerController.upload)

export default router;