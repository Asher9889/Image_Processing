import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse, ApiSuccessResponse, uploadBase64Image } from "../utils";
import { StatusCodes } from "http-status-codes";
import { Image } from "../models";
import { uploadControllerService } from "../services";


export async function upload(req: Request, res: Response, next: NextFunction):Promise<Response | void> {
    try {
        const { image } = req.body;
        console.log(image)
        if (!image) throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Please provide valid image")
        // const { pipeline } = await import('@xenova/transformers');

        // // Store image in a system;
        // const imageURL = await uploadBase64Image(image, req);
        // console.log(imageURL);

        const response = await uploadControllerService.uploadService(image, req);

        if (!response) {
            throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to save image. try again")
        }
        return res.status(StatusCodes.OK).json(new ApiSuccessResponse(StatusCodes.OK, "Image Saved successfully"))
    } catch (error) {
        next(error);
    }

}

export async function getSimilar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const { image } = req.body;
        const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, 'Invalid base64 format');
        }
        const resp = await uploadControllerService.getSimilarService(image, req);
        if (resp && resp.length === 0) {
            return res.status(StatusCodes.OK).json(new ApiSuccessResponse(StatusCodes.OK, "No Match found"))
        }
        return res.status(StatusCodes.OK).json(new ApiSuccessResponse(StatusCodes.OK, "Data fetched successfully", resp))
    } catch (error) {
        next(error); 
    }
}