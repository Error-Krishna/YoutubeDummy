import { Router } from "express"
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js"
import { 
    deleteVideo, 
    publishAVideo,
    getVideoById,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
const router = Router();

router.post(
    "/upload",
    (req, res, next) => {
        console.log("🔥 REQUEST REACHED VIDEO ROUTE");
        next()
    },
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);
router.delete("/:videoId", verifyJWT, deleteVideo)
router.get("/:videoId",optionalVerifyJWT,getVideoById)
router.post("/:videoId", verifyJWT, togglePublishStatus)
router.patch(
    "/:videoId",
    verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount: 1
        },
        {
            name:"thumbnail",
            maxCount: 1
        },
    ]),
    updateVideo
);



export default router