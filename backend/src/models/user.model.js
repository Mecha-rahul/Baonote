import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required."],
      select: false, 
    },
    preferences: {
      theme: { type: String,
      enum: ["light", "dark", "system"],
      default: "dark" },
    },

    refreshToken: {
      type: String,
      select: false, 
    },
  },
  { timestamps: true }
);

//to hash the pass before we use it
userSchema.pre("save", async function (next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password , 10)
  next()
})

//tounhash / decrypt the pass
userSchema.methods.isPasswordCorrect  = async function (password){
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};


export const User = mongoose.model("User", userSchema);