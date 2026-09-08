import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Likes } from "../models/likes.model.js";
import { Video } from "../models/video.model.js";
import { Comments } from "../models/comment.model.js";
import { Tweets } from "../models/tweets.model.js";
import mongoose from "mongoose";

// ✅ Done
const getLikedVideos = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const likes = await Likes.find({
        likedBy: user._id,
        video: { $exists: true, $ne: null }
    }).select("video");

    const videoIds = likes.map(like => like.video);

    const videos = await Video.find({
        _id: { $in: videoIds }
    });

    return res.status(200).json(
        new apiResponse(
            200,
            videos,
            "Liked videos fetched successfully"
        )
    );
});

// ✅ Done
const toggleCommentLike = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { commentId } = req.params;

    if (!commentId) {
        throw new apiError(400, "Comment ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }

    const comment = await Comments.findById(commentId);

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    const existingLike = await Likes.findOne({
        comment: commentId,
        likedBy: user._id
    });

    if (existingLike) {

        await Likes.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Comment unliked successfully"
            )
        );
    }

    const like = await Likes.create({
        comment: commentId,
        likedBy: user._id
    });

    if (!like) {
        throw new apiError(
            500,
            "Failed to like comment"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            like,
            "Comment liked successfully"
        )
    );
});

// ✅ Done
const toggleTweetLike = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { tweetId } = req.params;

    if (!tweetId) {
        throw new apiError(400, "Tweet ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweets.findById(tweetId);

    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }

    const existingLike = await Likes.findOne({
        tweet: tweetId,
        likedBy: user._id
    });

    if (existingLike) {

        await Likes.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Tweet unliked successfully"
            )
        );
    }

    const like = await Likes.create({
        tweet: tweetId,
        likedBy: user._id
    });

    if (!like) {
        throw new apiError(
            500,
            "Failed to like tweet"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            like,
            "Tweet liked successfully"
        )
    );
});

// ✅ Done
const toggleVideoLike = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError(400, "Video ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    const existingLike = await Likes.findOne({
        video: videoId,
        likedBy: user._id
    });

    if (existingLike) {

        await Likes.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Video unliked successfully"
            )
        );
    }

    const like = await Likes.create({
        video: videoId,
        likedBy: user._id
    });

    if (!like) {
        throw new apiError(
            500,
            "Failed to like video"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            like,
            "Video liked successfully"
        )
    );
});


export {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
};