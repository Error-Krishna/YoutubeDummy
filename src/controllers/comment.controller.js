import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Comments } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

// ✅ Done
const getAllVideoComments = asyncHandler(async (req, res) => {

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

    const comments = await Comments.find({
        video: videoId
    })
        .populate("owner", "fullname username avatar")
        .sort({
            createdAt: -1
        });

    return res.status(200).json(
        new apiResponse(
            200,
            comments,
            "Video comments fetched successfully"
        )
    );
});

// ✅ Done
const addComments = asyncHandler(async (req, res) => {

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

    const { content } = req.body || {};

    if (!content?.trim()) {
        throw new apiError(
            400,
            "Comment content is required"
        );
    }

    const comment = await Comments.create({
        content: content.trim(),
        video: videoId,
        owner: user._id
    });

    if (!comment) {
        throw new apiError(
            500,
            "Failed to add comment"
        );
    }

    const populatedComment = await Comments.findById(
        comment._id
    ).populate(
        "owner",
        "fullname username avatar"
    );

    return res.status(201).json(
        new apiResponse(
            201,
            populatedComment,
            "Comment added successfully"
        )
    );
});

// ✅ Done
const updateComments = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { commentId } = req.params;

    if (!commentId) {
        throw new apiError(
            400,
            "Comment ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(
            400,
            "Invalid comment ID"
        );
    }

    const comment = await Comments.findById(commentId);

    if (!comment) {
        throw new apiError(
            404,
            "Comment not found"
        );
    }

    if (
        user._id.toString() !==
        comment.owner.toString()
    ) {
        throw new apiError(
            403,
            "You are not authorized to update this comment"
        );
    }

    const { content } = req.body || {};

    if (!content?.trim()) {
        throw new apiError(
            400,
            "Comment content is required"
        );
    }

    const newContent = content.trim();

    if (newContent === comment.content) {
        return res.status(200).json(
            new apiResponse(
                200,
                comment,
                "No changes were made"
            )
        );
    }

    const updatedComment =
        await Comments.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content: newContent
                }
            },
            {
                new: true
            }
        ).populate(
            "owner",
            "fullname username avatar"
        );

    if (!updatedComment) {
        throw new apiError(
            500,
            "Failed to update comment"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    );
});

// ✅ Done
const deleteComments = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { commentId } = req.params;

    if (!commentId) {
        throw new apiError(
            400,
            "Comment ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(
            400,
            "Invalid comment ID"
        );
    }

    const comment = await Comments.findById(commentId);

    if (!comment) {
        throw new apiError(
            404,
            "Comment not found"
        );
    }

    if (
        user._id.toString() !==
        comment.owner.toString()
    ) {
        throw new apiError(
            403,
            "You are not authorized to delete this comment"
        );
    }

    const deletedComment =
        await Comments.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new apiError(
            500,
            "Failed to delete comment"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    );
});


export {
    getAllVideoComments,
    addComments,
    updateComments,
    deleteComments
};