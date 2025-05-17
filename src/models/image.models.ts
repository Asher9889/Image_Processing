import mongoose, { Document, Schema } from "mongoose";

interface IImage extends Document {
    imagePath: string;
    vector: number[];
    vectorType: string
}

const imageSchema: Schema = new mongoose.Schema({
    imagePath: {
        type: String,
        required: true
    },
    vector: {
        type: [Number],
        required: true,
        validate: {
            validator: (arr: number[]) => arr.every((v) => typeof v == "number"),
            message: "Vector must be an array of numbers",
        }
    },
    vectorType: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt
})

const Image = mongoose.model<IImage>("Image", imageSchema);

export default Image;
