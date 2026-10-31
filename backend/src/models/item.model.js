import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    _id: { type: String, required: true }, // UUID created by the frontend
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["note", "todo", "code", "link", "image"],
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true, min: 1 },
    h: { type: Number, required: true, min: 1 },
    z: { type: Number, default: 0 },
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Item = mongoose.model("Item", itemSchema);