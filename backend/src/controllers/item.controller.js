import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import validateContent from "../utils/validateContent.js";
import { Board } from "../models/board.model.js";
import { Item } from "../models/item.model.js";
import { Edge } from "../models/edge.model.js";

const ITEM_TYPES = ["note", "todo", "code", "link", "image"];
const isNum = (n) => Number.isFinite(n);

const toCard = ({ _id, type, x, y, w, h, z, content }) => ({
  id: _id, type, x, y, w, h, z, content,
});

const getOwnedItem = async (id, userId) => {
  if (typeof id !== "string" || !id.trim() || id.length > 64) {
    throw new ApiError(400, "Invalid item id");
  }
  const item = await Item.findById(id);
  if (!item) throw new ApiError(404, "Item not found");

  const board = await Board.findOne({ _id: item.board, owner: userId }).select("_id");
  if (!board) throw new ApiError(404, "Item not found");

  return item;
};

const createItem = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  if (!mongoose.isValidObjectId(boardId)) {
    throw new ApiError(400, "Invalid board id");
  }

  const board = await Board.findOne({ _id: boardId, owner: req.user._id }).select("_id");
  if (!board) throw new ApiError(404, "Board not found");

  const { id, type, x, y, w, h, content } = req.body;
  const z = req.body.z ?? 0;

  if (typeof id !== "string" || !id.trim() || id.length > 64) {
    throw new ApiError(400, "Invalid item id");
  }
  if (!ITEM_TYPES.includes(type)) {
    throw new ApiError(400, "Invalid item type");
  }
  if (![x, y, w, h, z].every(isNum)) {
    throw new ApiError(400, "x, y, w, h and z must be numbers");
  }
  if (w <= 0 || h <= 0) {
    throw new ApiError(400, "w and h must be greater than 0");
  }
  validateContent(type, content);

  let item;
  try {
    item = await Item.create({ _id: id, board: board._id, type, x, y, w, h, z, content });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Item already exists");
    throw error;
  }

  return res
    .status(201)
    .json(new ApiResponse(201, toCard(item.toObject()), "Item created"));
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await getOwnedItem(req.params.id, req.user._id);

  const updates = {};
  for (const key of ["x", "y", "w", "h", "z"]) {
    if (req.body[key] !== undefined) {
      if (!isNum(req.body[key])) {
        throw new ApiError(400, `${key} must be a number`);
      }
      updates[key] = req.body[key];
    }
  }
  if (
    (updates.w !== undefined && updates.w <= 0) ||
    (updates.h !== undefined && updates.h <= 0)
  ) {
    throw new ApiError(400, "w and h must be greater than 0");
  }

  if (req.body.content !== undefined) {
    validateContent(item.type, req.body.content); // checked against the item's saved type
    updates.content = req.body.content;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  Object.assign(item, updates);
  if (updates.content !== undefined) item.markModified("content"); // Mixed field
  await item.save();

  return res
    .status(200)
    .json(new ApiResponse(200, toCard(item.toObject()), "Item updated"));
});

const deleteItem = asyncHandler(async (req, res) => {
  const item = await getOwnedItem(req.params.id, req.user._id);

  await Edge.deleteMany({
    board: item.board,
    $or: [{ fromId: item._id }, { toId: item._id }],
  });
  await Item.deleteOne({ _id: item._id });

  return res.status(200).json(new ApiResponse(200, {}, "Item deleted"));
});

export { createItem, updateItem, deleteItem };