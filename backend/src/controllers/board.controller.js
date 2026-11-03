import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Board } from "../models/board.model.js";

const createBoard = asyncHandler(async (req, res) => {
  const { parentBoard = null } = req.body;
  const title = req.body.title;

  if (typeof title !== "string" || !title.trim()) {
    throw new ApiError(400, "A valid title is required");
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length > 100) {
    throw new ApiError(400, "Title cannot exceed 100 characters");
  }

  const owner = req.user._id;

  if (parentBoard !== null) {
    if (
      typeof parentBoard !== "string" ||
      !mongoose.Types.ObjectId.isValid(parentBoard)
    ) {
      throw new ApiError(400, "Invalid parent board ID");
    }

    const parentExists = await Board.findOne({
      _id: parentBoard,
      owner,
    });

    if (!parentExists) {
      throw new ApiError(404, "Parent board not found");
    }
  }

  const lastBoard = await Board.findOne({
    owner,
    parentBoard,
  }).sort({ order: -1 });

  const order = lastBoard ? lastBoard.order + 1 : 0;

  let board;

  try {
    board = await Board.create({
      title: trimmedTitle,
      parentBoard,
      owner,
      order,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Board already exists");
    }
    throw error;
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        board,
        "Board created successfully"
      )
    );
});

const getBoards = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  const boards = await Board.find({
    owner: owner
  }).sort({ order: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        boards,
        "Boards Fetched Successfully"
      )
    );
});

const getBoardId = asyncHandler(async (req, res) => {
  const req_id = req.body._id
  
});

export { createBoard , getBoards , getBoardId };
