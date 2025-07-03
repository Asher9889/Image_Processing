import { Request } from 'express';
import { ApiErrorResponse, cosineSimilarity, uploadBase64Image, uploadBase64imageTemp } from '../utils';
import { Image } from '../models';
import { Image as ImageJS } from "image-js";
import { StatusCodes } from 'http-status-codes';
import connectMSSQL from '../db/connectMSSQL';
import sql from "mssql";

export async function uploadService(base64: string, req: Request) {
   try {
      const data = req.body;
      const pool = await connectMSSQL();
      if (!pool) {
         console.error("DB connection failed. Aborting insert.");
         return;
      }
      const { pipeline } = await import('@xenova/transformers');

      // Store image in a system;
      const imageURL = await uploadBase64Image(base64, req); // to device



      const image_feature_extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
      // const url = 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cats.png';
      const res = await image_feature_extractor(imageURL);

      // const result = await pool.request()
      //    .input('DeviceID', sql.VarChar, data.DeviceID)
      //    .input('UserID', sql.VarChar, data.UserID)
      //    .input('Name', sql.VarChar, data.Name)
      //    .input('Pri', sql.Int, data.Pri)
      //    .input('Password', sql.VarChar, data.Password)
      //    .input('Card', sql.VarChar, data.Card)
      //    .input('DeviceGroup', sql.VarChar, data.DeviceGroup)
      //    .input('TimeZone', sql.VarChar, data.TimeZone)
      //    .input('Verify', sql.Int, data.Verify)
      //    .input('AccesstimeFrom', sql.DateTime, data.AccesstimeFrom)
      //    .input('AccessTimeTo', sql.DateTime, data.AccessTimeTo)
      //    .input('UpdatedOn', sql.DateTime, new Date())
      //    .input('UpdateFlag', sql.Int, data.UpdateFlag)
      //    .input('IsDeleted', sql.Bit, data.IsDeleted)
      //    .input('Source', sql.VarChar, data.Source)
      //    .input('CreatedDate', sql.DateTime, new Date())
      //    .input('aliasid', sql.VarChar, data.aliasid)
      //    .input('Card1', sql.VarChar, data.Card1)
      //    .input('Card2', sql.VarChar, data.Card2)
      //    .input('Card3', sql.VarChar, data.Card3)
      //    .input('Card4', sql.VarChar, data.Card4)
      //    .query(`
      //   INSERT INTO [iDMS].[dbo].[Userdetail]
      //   (
      //     DeviceID, UserID, Name, Pri, Password, Card, DeviceGroup,
      //     TimeZone, Verify, AccesstimeFrom, AccessTimeTo, UpdatedOn,
      //     UpdateFlag, IsDeleted, Source, CreatedDate, aliasid,
      //     Card1, Card2, Card3, Card4
      //   )
      //   VALUES
      //   (
      //     @DeviceID, @UserID, @Name, @Pri, @Password, @Card, @DeviceGroup,
      //     @TimeZone, @Verify, @AccesstimeFrom, @AccessTimeTo, @UpdatedOn,
      //     @UpdateFlag, @IsDeleted, @Source, @CreatedDate, @aliasid,
      //     @Card1, @Card2, @Card3, @Card4
      //   )
      // `);

      // console.log('✅ Insert successful:', result.rowsAffected);



      // const imgObj = new Image({
      //    imagePath: imageURL,
      //    vector: Array.from(res.data),
      //    vectorType: res.type
      // })
      // Insert image details
      const vectorJson = JSON.stringify({ vector: Array.from(res.data) });
      await pool.request()
         .input('DeviceID', sql.VarChar(250), data.DeviceID)
         .input('UserID', sql.VarChar(50), data.UserID)
         .input('ImagePath', sql.NVarChar(500), imageURL)
         .input('Vector', sql.NVarChar(sql.MAX), vectorJson)
         .input('VectorType', sql.NVarChar(50), res.type)
         .query(`
        INSERT INTO [iDMS].[dbo].[UserImages]
        (DeviceID, UserID, ImagePath, Vector, VectorType, UpdatedOn)
        VALUES
        (@DeviceID, @UserID, @ImagePath, @Vector, @VectorType, GETDATE())
      `);

      console.log('✅ UserImages insert successful');
      // const data = await imgObj.save();
      // if (!data._id) {
      //    throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to save image. try again")
      // }
      return true;
   } catch (error: any) {
      if (error instanceof ApiErrorResponse) {
         throw error;
      } else {

         throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, error.message);
      }
   }
}

export async function getSimilarService(image: string, req: Request) {
   try {
      const { pipeline } = await import('@xenova/transformers');

      const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
         throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, 'Invalid base64 format');
      }

      const imageType = matches[1]; // e.g. png or jpeg
      const imageData = matches[2];
      const imageBuffer = Buffer.from(imageData, 'base64');

      const imgUrl = await uploadBase64imageTemp(image, req)

      const image_feature_extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
      const resp = await image_feature_extractor(imgUrl); // returns vector
      if (!resp || !resp.data) {
         throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to process the image');
      }

      const inputVector = Array.from(resp.data);

      // Fetch vectors from MSSQL
      const pool = await connectMSSQL();
      if (!pool) {
         console.error("DB connection failed. Aborting insert.");
         return;
      }
      const result = await pool.request().query(`
         SELECT ImageID, UserID, ImagePath, Vector
         FROM [iDMS].[dbo].[UserImages]
      `);

      const images = result.recordset;

      if (images.length === 0) {
         throw new ApiErrorResponse(StatusCodes.NOT_FOUND, "No images found in database");
      }

      // Compute similarity
      const results = images.map((row) => {
         let storedVector: number[] = [];
         try {
            const vectorObj = JSON.parse(row.Vector);
            storedVector = vectorObj.vector;
         } catch (err) {
            console.error(`Error parsing vector for ImageID ${row.ImageID}:`, err);
         }

         const similarity = cosineSimilarity(inputVector, storedVector);
         return {

            ImageID: row.ImageID,
            UserID: row.UserID,
            imagePath: row.ImagePath,
            similarity
         };
      });

      results.sort((a, b) => b.similarity - a.similarity);

      const mostMatching = results.slice(0, 1);
      return mostMatching;
   } catch (error) {
      throw error;
   }
}