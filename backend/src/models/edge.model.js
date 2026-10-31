import mongoose, { Schema } from "mongoose";

const edgeSchema = new Schema(
  {
    _id: { type: String, required: true }, // UUID created by the frontend
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },

    fromId: { type: String, required: true },
    toId: { type: String, required: true },

    style: {
      shape: {
        type: String,
        enum: ["straight", "arc", "curve", "elbow"],
        default: "straight",
      },
      color: {
        type: String,
        enum: ["default", "red", "yellow", "blue"],
        default: "default",
      },
      width: { type: Number, min: 1, max: 12, default: 2 },
      dash: {
        type: String,
        enum: ["solid", "dashed", "dotted"],
        default: "solid",
      },
      startArrow: { type: String, enum: ["none", "arrow"], default: "none" },
      endArrow: { type: String, enum: ["none", "arrow"], default: "arrow" },
    },
  },
  { timestamps: true }
);


edgeSchema.pre("validate", async function () {
  if (this.fromId === this.toId) {
    this.invalidate("toId", "an arrow cannot connect a card to itself");
  }
});

export const Edge = mongoose.model("Edge", edgeSchema);