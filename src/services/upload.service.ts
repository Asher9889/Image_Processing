import { Request } from 'express';
import { ApiErrorResponse, cosineSimilarity, uploadBase64Image, uploadBase64imageTemp } from '../utils';
import { Image } from '../models';
import { Image as ImageJS } from "image-js";
import { StatusCodes } from 'http-status-codes';

export async function uploadService(base64: string, req: Request) {
   try {
      const { pipeline } = await import('@xenova/transformers');

      // Store image in a system;
      const imageURL = await uploadBase64Image(base64, req);
      console.log(imageURL);



      const image_feature_extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
      // const url = 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cats.png';
      const res = await image_feature_extractor(imageURL);

      console.log("Features is", res)

      const imgObj = new Image({
         imagePath: imageURL,
         vector: Array.from(res.data),
         vectorType: res.type
      })
      const data = await imgObj.save();
      if (!data._id) {
         throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to save image. try again")
      }
      return true;
   } catch (error) {
      throw error;
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
      if (!resp) {
         throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to process the image');
      }
      // now fetch all the vectors stored in the db.
      const allImagesVector = await Image.find({}, { vector: 1, imagePath: 1 });

      

      const results = allImagesVector.map((doc) => {
         const similarity = cosineSimilarity(Array.from(resp.data), doc.vector);
         return { _id: doc._id, imagePath: doc.imagePath, similarity };
      });

      console.log("result is", results)

      results.sort((a, b) => b.similarity - a.similarity);
      const mostMatching = results.slice(0, 1);



      console.log("from similar service", mostMatching);
      return mostMatching;
   } catch (error) {
      console.log(error);
   }
}