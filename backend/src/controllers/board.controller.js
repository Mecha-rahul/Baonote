import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Board } from "../models/board.model.js";
import { Item } from "../models/item.model.js";
import { Edge } from "../models/edge.model.js";

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

const getBoardById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid board id");
  }

  const board = await Board.findOne({ _id: id, owner: req.user._id }).lean();
  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  const [items, edges] = await Promise.all([
    Item.find({ board: board._id }).lean(),
    Edge.find({ board: board._id }).lean(),
  ]);

  const cards = items.map(({ _id, type, x, y, w, h, z, content }) => ({
    id: _id, type, x, y, w, h, z, content,
  }));

  const arrows = edges.map(({ _id, fromId, toId, style }) => ({
    id: _id, fromId, toId, style,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { board, cards, edges: arrows }, "Board fetched"));
});

const updateBoard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid board id");
  }

  const { title, order, parentBoard } = req.body;
  const updates = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      throw new ApiError(400, "Invalid title");
    }
    if (title.trim().length > 100) {
      throw new ApiError(400, "Title cannot exceed 100 characters");
    }
    updates.title = title.trim();
  }

  if (order !== undefined) {
    if (!Number.isFinite(order)) {
      throw new ApiError(400, "Invalid order");
    }
    updates.order = order;
  }

  if (parentBoard !== undefined) {
    if (
      parentBoard !== null &&
      (typeof parentBoard !== "string" || !mongoose.isValidObjectId(parentBoard))
    ) {
      throw new ApiError(400, "Invalid parent board id");
    }
    updates.parentBoard = parentBoard; 
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const board = await Board.findOne({ _id: id, owner: req.user._id });
  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  if (typeof parentBoard === "string") {
    const newParent = await Board.findOne({
      _id: parentBoard,
      owner: req.user._id,
    }).select("_id parentBoard");

    if (!newParent) {
      throw new ApiError(404, "Parent board not found");
    }

    let current = newParent;
    while (current) {
      if (current._id.equals(board._id)) {
        throw new ApiError(400, "A board cannot be moved inside itself");
      }
      if (!current.parentBoard) break; 
      current = await Board.findOne({
        _id: current.parentBoard,
        owner: req.user._id,
      }).select("_id parentBoard");
    }
  }

  Object.assign(board, updates);
  await board.save();

  return res
    .status(200)
    .json(new ApiResponse(200, board, "Board updated"));

});

const deleteBoard = asyncHandler(async ( req , res ) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid board id");
  }
  const board = await Board.findOne({ _id: id, owner: req.user._id });
  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  const allBoards = await Board.find({ owner: req.user._id })
    .select("_id parentBoard")
    .lean();

  const ids = [board._id];
  for (let i = 0; i < ids.length; i++) {
    const parentId = String(ids[i]);
    for (const b of allBoards) {
      if (b.parentBoard && String(b.parentBoard) === parentId) {
        ids.push(b._id);
      }
    }
  }

  await Edge.deleteMany({ board: { $in: ids } });
  await Item.deleteMany({ board: { $in: ids } });
  await Board.deleteMany({ _id: { $in: ids }, owner: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, { deletedBoards: ids.length }, "Board deleted"));
});
export { createBoard , getBoards , getBoardById , updateBoard , deleteBoard};
