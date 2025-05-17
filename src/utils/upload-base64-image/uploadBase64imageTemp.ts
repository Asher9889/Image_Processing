// import fs from "fs";
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ApiErrorResponse from '../api-response/apiErrorResponse';
import { StatusCodes } from 'http-status-codes';
import { Request } from "express";

export async function uploadBase64imageTemp(image: string, req: Request) {
    try {
        if (!image) {
            throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Base64 is required")
        }

        // Extract image type and data from base64 string
        const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, 'Invalid base64 format');
        }

        const imageType = matches[1]; // e.g. png or jpeg
        const imageData = matches[2];
        const imageBuffer = Buffer.from(imageData, 'base64');

        const fileName = `${uuidv4()}-${Date.now()}.${imageType}`;

        const filePath = path.join(__dirname, '../../../temp', fileName); // adjust path if needed
        console.log(`filePath is ${filePath}`)
        // Ensure the directory exists
        await fs.writeFile(filePath, imageBuffer);

        const imageUrl = `${req.protocol}://${req.get('host')}/temp/${fileName}`;

        return imageUrl;
    } catch (err) {
        if (err instanceof ApiErrorResponse) {
            throw new ApiErrorResponse(err.statusCode, err.message, err.data, err.stack);
        }
        throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
    }
}

export default uploadBase64imageTemp;