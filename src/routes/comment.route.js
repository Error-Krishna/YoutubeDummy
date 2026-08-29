import { Router } from "express"
import { 
    addComments,
    deleteComments,
    getAllVideoComments,
    updateComments,
} from "../controllers/comment.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT)

router.route("/:videoId").get(getAllVideoComments).post(addComments)
router.route("/c/:commentId").delete(deleteComments).patch(updateComments)

export default router