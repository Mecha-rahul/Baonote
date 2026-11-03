import { Router } from "express" ;
import {createBoard , getBoards , getBoardById , updateBoard , deleteBoard} from "../controllers/board.controller.js"
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createBoard);
router.route("/").get(getBoards);
router.route("/:id").get(verifyJWT ,  getBoardById);
router.route("/:id").patch(verifyJWT , updateBoard);
router.route("/:id").delete(verifyJWT , deleteBoard);

export default router;