import express from "express";
import { uploadController } from "../../controllers";

const router = express.Router();

router.post("/register", uploadController.upload as any);
router.post("/getSimilar", uploadController.getSimilar as any)


export default router;