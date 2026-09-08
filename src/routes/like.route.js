import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
} from "../controllers/like.controller.js";

const router = Router();


router.get(
    "/videos",
    verifyJWT,
    getLikedVideos
);


router.post(
    "/video/:videoId",
    verifyJWT,
    toggleVideoLike
);


router.post(
    "/comment/:commentId",
    verifyJWT,
    toggleCommentLike
);


router.post(
    "/tweet/:tweetId",
    verifyJWT,
    toggleTweetLike
);


export default router;