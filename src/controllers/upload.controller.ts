import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse, ApiSuccessResponse, uploadBase64Image } from "../utils";
import { StatusCodes } from "http-status-codes";
import { Image } from "../models";
import { uploadControllerService } from "../services";
import sql from "mssql";
import connectMSSQL from "../db/connectMSSQL";

export async function upload(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const { image, UserID, DeviceID } = req.body;
        if (!image || !UserID || !DeviceID) throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Please provide valid input")
        // const { pipeline } = await import('@xenova/transformers');

        // // Store image in a system;
        // const imageURL = await uploadBase64Image(image, req);
        // console.log(imageURL);

        const response = await uploadControllerService.uploadService(image, req);




        if (!response) {
            throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to save image. try again")
        }
        return res.status(StatusCodes.OK).json(new ApiSuccessResponse(StatusCodes.OK, "User & Image Saved successfully"))
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

export async function markAttendance(req: Request, res: Response, next: NextFunction) {
    const {
        DeviceID,
        UserID,
        AttState,
        VerifyMode,
        WorkCode,
        AttDateTime,
        CTemp,
        FTemp,
        MaskStatus,
        IsAbnomal,
        LImage,
        TImage,
        io_workcode,
        verify_mode,
        io_mode,
        upload,
        MachineCardNo,
        IsActive,
        ParallelCheck,
        RecordSerial,
        PurPose,
        Latitude,
        Longitude

    } = req.body;

    function getISTDate() {
        const dateUTC = new Date();
      
        // IST offset = 330 minutes (5 hours 30 minutes)
        const istOffset = 330 * 60000; 
        return new Date(dateUTC.getTime() + istOffset);
      }

    if (!DeviceID || typeof DeviceID === "string" && DeviceID.trim() === "") {
        throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Please provide valid DeviceID")
    }

    if (!UserID || typeof UserID === "string" && UserID.trim() === "") {
        throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Please provide valid UserID")
    }
    if (!io_mode  || typeof io_mode === "string" && io_mode.trim() === "") {
        throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Please provide valid io_mode")
    }

    try {
        const pool = await connectMSSQL();
        if (!pool) {
            throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "DB connection failed. Aborting insert.");

        }

        const request = pool.request();

        request
            .input('DeviceID', sql.VarChar(50), DeviceID)
            .input('UserID', sql.VarChar(50), UserID)
            .input('AttState', sql.VarChar(50), AttState || null)
            .input('VerifyMode', sql.VarChar(50), VerifyMode || "Mobile")
            .input('WorkCode', sql.VarChar(50), WorkCode || null)
            .input('AttDateTime', sql.DateTime, getISTDate())
            .input('UpdateedOn', sql.DateTime, getISTDate())
            .input('CTemp', sql.VarChar(50), CTemp || null)
            .input('FTemp', sql.VarChar(50), FTemp || null)
            .input('MaskStatus', sql.VarChar(50), MaskStatus || null)
            .input('IsAbnomal', sql.VarChar(50), IsAbnomal || null)
            .input('LImage', sql.VarBinary(sql.MAX), LImage || null)
            .input('TImage', sql.VarBinary(sql.MAX), TImage || null)
            .input('io_workcode', sql.VarChar(50), io_workcode || null)
            .input('verify_mode', sql.VarChar(50), verify_mode || null)
            .input('io_mode', sql.VarChar(50), io_mode || null)
            .input('upload', sql.Int, upload || 0)
            .input('MachineCardNo', sql.VarChar(50), MachineCardNo || null)
            .input('IsActive', sql.VarChar(50), IsActive || null)
            .input('ParallelCheck', sql.VarChar(50), ParallelCheck || null)
            .input('RecordSerial', sql.VarChar(50), RecordSerial || null)
            .input('PurPose', sql.VarChar(50), PurPose || null)
            .input('Latitude', sql.VarChar(50), Latitude || null)
            .input('Longitude', sql.VarChar(50), Longitude || null);

        await request.query(`
        INSERT INTO [iDMS].[dbo].[UserAttendance] (
          DeviceID, UserID, AttState, VerifyMode, WorkCode, AttDateTime, UpdateedOn,
          CTemp, FTemp, MaskStatus, IsAbnomal, LImage, TImage,
          io_workcode, verify_mode, io_mode, upload, MachineCardNo, IsActive,
          ParallelCheck, RecordSerial, PurPose, Latitude, Longitude
        )
        VALUES (
          @DeviceID, @UserID, @AttState, @VerifyMode, @WorkCode, @AttDateTime, @UpdateedOn,
          @CTemp, @FTemp, @MaskStatus, @IsAbnomal, @LImage, @TImage,
          @io_workcode, @verify_mode, @io_mode, @upload, @MachineCardNo, @IsActive,
          @ParallelCheck, @RecordSerial, @PurPose, @Latitude, @Longitude
        )
      `);

        return res.status(StatusCodes.OK).json(new ApiSuccessResponse(StatusCodes.OK, "Attendance marked successfully"));

    } catch (err:any) {
        if(err instanceof ApiErrorResponse){
            return next(err)
        }else{
            return next(new ApiErrorResponse(StatusCodes.BAD_REQUEST, err.message))
        }
    }
}