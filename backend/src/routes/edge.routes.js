import { Router } from "express";
import { createEdge, updateEdge, deleteEdge } from "../controllers/edge.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.route("/boards/:boardId/edges").post(verifyJWT, createEdge);
router.route("/edges/:id").patch(verifyJWT, updateEdge).delete(verifyJWT, deleteEdge);

export default router;