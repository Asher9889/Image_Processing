import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiErrorResponse } from "../index"



function checkRouteExists(req:Request, res:Response, next:NextFunction){
    const error = new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Incorrect Route", null);
    next(error);
}

export default checkRouteExists;