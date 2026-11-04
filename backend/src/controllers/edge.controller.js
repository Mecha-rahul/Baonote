import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Board } from "../models/board.model.js";
import { Item } from "../models/item.model.js";
import { Edge } from "../models/edge.model.js";


const STYLE_RULES = {
  shape: ["straight", "arc", "curve", "elbow"],
  color: ["default", "red", "yellow", "blue"],
  dash: ["solid", "dashed", "dotted"],
  startArrow: ["none", "arrow"],
  endArrow: ["none", "arrow"],
};


const validateStyle = (style) => {
  if (typeof style !== "object" || style === null || Array.isArray(style)) {
    throw new ApiError(400, "style must be an object");
  }

  const clean = {};
  for (const [key, allowed] of Object.entries(STYLE_RULES)) {
    if (style[key] !== undefined) {
      if (!allowed.includes(style[key])) {
        throw new ApiError(400, `Invalid style.${key}`);
      }
      clean[key] = style[key];
    }
  }

  if (style.width !== undefined) {
    if (!Number.isFinite(style.width) || style.width < 1 || style.width > 12) {
      throw new ApiError(400, "style.width must be a number from 1 to 12");
    }
    clean.width = style.width;
  }

  return clean;
};

const toEdge = ({ _id, fromId, toId, style }) => ({ id: _id, fromId, toId, style });

const isValidId = (v) => typeof v === "string" && v.trim() && v.length <= 64;

// Edges have no owner field, so ownership is checked through the edge's board
const getOwnedEdge = async (id, userId) => {
  if (!isValidId(id)) throw new ApiError(400, "Invalid edge id");

  const edge = await Edge.findById(id);
  if (!edge) throw new ApiError(404, "Edge not found");

  const board = await Board.findOne({ _id: edge.board, owner: userId }).select("_id");
  if (!board) throw new ApiError(404, "Edge not found");

  return edge;
};

const createEdge = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  if (!mongoose.isValidObjectId(boardId)) {
    throw new ApiError(400, "Invalid board id");
  }

  const board = await Board.findOne({ _id: boardId, owner: req.user._id }).select("_id");
  if (!board) throw new ApiError(404, "Board not found");

  const { id, fromId, toId, style } = req.body;

  if (!isValidId(id)) throw new ApiError(400, "Invalid edge id");
  if (!isValidId(fromId)) throw new ApiError(400, "Invalid from id");
  if (!isValidId(toId)) throw new ApiError(400, "Invalid to id");

  if (fromId === toId) {
    throw new ApiError(400, "An arrow cannot connect a card to itself");
  }

  const cardCount = await Item.countDocuments({
    _id: { $in: [fromId, toId] },
    board: board._id,
  });
  if (cardCount !== 2) {
    throw new ApiError(400, "Both cards must exist on this board");
  }

  const duplicate = await Edge.findOne({
    board: board._id,
    $or: [
      { fromId, toId },
      { fromId: toId, toId: fromId },
    ],
  });
  if (duplicate) {
    throw new ApiError(409, "These cards are already connected");
  }

  const cleanStyle = style !== undefined ? validateStyle(style) : undefined;

  let edge;
  try {
    edge = await Edge.create({
      _id: id,
      board: board._id,
      fromId,
      toId,
      style: cleanStyle, 
    });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Edge already exists");
    throw error;
  }

  return res
    .status(201)
    .json(new ApiResponse(201, toEdge(edge.toObject()), "Edge created"));
});

const updateEdge = asyncHandler(async (req, res) => {
  const edge = await getOwnedEdge(req.params.id, req.user._id);

  const clean = validateStyle(req.body.style); 
  if (Object.keys(clean).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const $set = {};
  for (const [key, value] of Object.entries(clean)) {
    $set[`style.${key}`] = value;
  }

  const updated = await Edge.findByIdAndUpdate(
    edge._id,
    { $set },
    { new: true, runValidators: true }
  ).lean();

  return res.status(200).json(new ApiResponse(200, toEdge(updated), "Edge updated"));
});

const deleteEdge = asyncHandler(async (req, res) => {
  const edge = await getOwnedEdge(req.params.id, req.user._id);

  await Edge.deleteOne({ _id: edge._id });

  return res.status(200).json(new ApiResponse(200, {}, "Edge deleted"));
});

export { createEdge, updateEdge, deleteEdge };