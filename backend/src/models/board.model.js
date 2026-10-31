import mongoose, { Schema } from "mongoose";

const boardSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentBoard: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      default: null, 
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "Untitled",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


boardSchema.index({ owner: 1, parentBoard: 1 });

export const Board = mongoose.model("Board", boardSchema);