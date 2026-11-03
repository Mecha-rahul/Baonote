import { Router } from "express" ;
import {createBoard , getBoards} from "../controllers/board.controller.js"
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createBoard);
router.route("/").get(getBoards);
router.route("/:id").get(getBoardId);
router.route("/:id").patch(updateBoard);
router.route("/:id").delete(deleteBoard);

export default router;