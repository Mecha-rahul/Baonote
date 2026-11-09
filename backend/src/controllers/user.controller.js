import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

// Refresh cookie is only sent to /api/auth/* (smaller exposure than "/")
const refreshCookieOptions = {
  ...cookieOptions,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");


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
  const refreshToken = user.generateRefreshToken()

  // store only the hash, so a DB leak does not leak usable refresh tokens
  await User.updateOne({ _id: user._id }, { refreshToken: hashToken(refreshToken) })

  const loggedInUser = await User.findById(user._id)

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
  // invalidate the refresh token server-side so it cannot be reused
  await User.updateOne({ _id: req.user._id }, { $unset: { refreshToken: 1 } })

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", { ...cookieOptions, path: "/api/auth" })
    .json(new ApiResponse(200, {}, "Logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken
  if (!incomingToken) throw new ApiError(401, "No refresh token")

  let decoded
  try {
    decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET)
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token")
  }

  const user = await User.findById(decoded._id).select("+refreshToken")
  if (!user || !user.refreshToken || user.refreshToken !== hashToken(incomingToken)) {
    throw new ApiError(401, "Refresh token is no longer valid")
  }

  const accessToken = user.generateAccessToken()

  // IMPORTANT: verifyJWT reads the cookie BEFORE the Authorization header,
  // so the cookie must be replaced too, or the old expired one wins.
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"))
})

export { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken };