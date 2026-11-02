import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import verifyJWT  from "../middleware/auth.middleware";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body
  const email = req.body.email?.trim().toLowerCase()

  if ([username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "Fill all the required details.")
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.")
  }

  const userExisted = await User.findOne({ email })
  if (userExisted) {
    throw new ApiError(409, "User already exists. Go to Login")
  }

  const user = await User.create({ username, email, password })

  const createdUser = await User.findById(user._id)
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const { password } = req.body

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.")
  }

  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    throw new ApiError(401, "Invalid email or password.")
  }

  const isValid = await user.isPasswordCorrect(password)
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password.")
  }

  const accessToken = user.generateAccessToken()
  const loggedInUser = await User.findById(user._id)

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"))
})

export { registerUser, loginUser, logoutUser, getCurrentUser };