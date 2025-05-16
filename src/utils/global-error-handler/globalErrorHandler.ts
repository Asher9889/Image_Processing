import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import ApiErrorResponse from "../api-response/apiErrorResponse";
import { StatusCodes } from "http-status-codes";

function globalErrorHandler(err:any, req:Request, res:Response, next:NextFunction){
    if(err instanceof ApiErrorResponse){
        console.log(err)
        const statusCode = err.statusCode;
        const messgae = err.message;
        const data = err.data;
        const stack = err.stack;
        res.status(statusCode).json(new ApiErrorResponse(statusCode, messgae, data, stack));
    }else{
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"Internal Server Error", null));
    }
}

export default globalErrorHandler;