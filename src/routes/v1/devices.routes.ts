import express from "express";

const router = express.Router();

router.post("/", (req, res, next) => {
    console.log("Register");
})

export default router;