import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    getUserTweets,
    createTweet,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";

const router = Router();


// Get current user's tweets
router.get(
    "/",
    verifyJWT,
    getUserTweets
);


// Create tweet
router.post(
    "/",
    verifyJWT,
    createTweet
);


// Update tweet
router.patch(
    "/:tweetId",
    verifyJWT,
    updateTweet
);


// Delete tweet
router.delete(
    "/:tweetId",
    verifyJWT,
    deleteTweet
);


export default router;