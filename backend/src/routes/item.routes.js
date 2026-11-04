import { Router } from "express";
import { createItem, updateItem, deleteItem } from "../controllers/item.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.route("/boards/:boardId/items").post(verifyJWT, createItem);
router.route("/items/:id").patch(verifyJWT, updateItem).delete(verifyJWT, deleteItem);

export default router;