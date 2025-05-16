import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "../utils";
import { StatusCodes } from "http-status-codes";
import { Image } from "../models";


// Load CLIP model once
// let featureExtractor: any;
// pipeline("feature-extraction", "Xenova/clip-vit-base-patch32")
//   .then(p => featureExtractor = p)
//   .catch(err => console.error("Model load error", err));

export function upload(req:Request, res:Response, next:NextFunction) {
    const { image } = req.body;
    if(!image) throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Please provide valid image")
    
        // first store image in our system.
    
}