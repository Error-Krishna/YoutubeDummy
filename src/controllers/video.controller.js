import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary
} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";


// 🟡 TODO
const getAllVideos = asyncHandler(async (req, res) => {

});


// ✅ Done
const publishAVideo = asyncHandler(async (req, res) => {

    // 1. Get authenticated user
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new apiError(404, "User not found");
    }

    // 2. Receive text fields
    const { title, description } = req.body;

    // 3. Validate text fields
    if (!title?.trim() || !description?.trim()) {
        throw new apiError(
            400,
            "Title and description are required"
        );
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // 4. Receive uploaded files
    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    // 5. Validate files
    if (!videoFile || !thumbnailFile) {
        throw new apiError(
            400,
            "Video and thumbnail are required"
        );
    }

    const videoLocalPath = videoFile.path;
    const thumbnailLocalPath = thumbnailFile.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new apiError(
            400,
            "Uploaded files are invalid"
        );
    }

    // Track Cloudinary uploads for cleanup
    let videoUploadResult = null;
    let thumbnailUploadResult = null;

    try {

        // 6. Upload video
        videoUploadResult = await uploadOnCloudinary(
            videoLocalPath
        );

        if (!videoUploadResult?.secure_url) {
            throw new apiError(
                500,
                "Failed to upload video"
            );
        }

        // 7. Upload thumbnail
        thumbnailUploadResult = await uploadOnCloudinary(
            thumbnailLocalPath
        );

        if (!thumbnailUploadResult?.secure_url) {
            throw new apiError(
                500,
                "Failed to upload thumbnail"
            );
        }

        // 8. Validate video duration
        if (
            videoUploadResult.duration === undefined ||
            videoUploadResult.duration === null
        ) {
            throw new apiError(
                500,
                "Unable to determine video duration"
            );
        }

        // 9. Create database document
        const video = await Video.create({
            videoFile: videoUploadResult.secure_url,
            videoPublicId: videoUploadResult.public_id,
            thumbnail: thumbnailUploadResult.secure_url,
            thumbnailPublicId: thumbnailUploadResult.public_id,
            title: trimmedTitle,
            description: trimmedDescription,
            duration: videoUploadResult.duration,
            owner: user._id
        });

        if (!video) {
            throw new apiError(
                500,
                "Failed to create video"
            );
        }

        // 10. Return response
        return res.status(201).json(
            new apiResponse(
                201,
                video,
                "Video published successfully"
            )
        );

    } catch (error) {

        // Cleanup uploaded video
        if (videoUploadResult?.public_id) {
            await deleteFromCloudinary(
                videoUploadResult.public_id,
                "video"
            );
        }

        // Cleanup uploaded thumbnail
        if (thumbnailUploadResult?.public_id) {
            await deleteFromCloudinary(
                thumbnailUploadResult.public_id,
                "image"
            );
        }

        throw error;
    }
});


// ✅ Done
const getVideoById = asyncHandler(async (req, res) => {

    // 1. Read videoId from URL
    const { videoId } = req.params;

    // 2. Validate videoId
    if (!videoId) {
        throw new apiError(
            400,
            "Video ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(
            400,
            "Invalid video ID"
        );
    }

    // 3. Find video
    const videoObject = await Video.findById(videoId);

    // 4. Check if video exists
    if (!videoObject) {
        throw new apiError(
            404,
            "Video not found"
        );
    }

    // 5. Check private video authorization
    if (!videoObject.isPublished) {

        // User must be authenticated
        if (!req.user) {
            throw new apiError(
                401,
                "User must be authenticated"
            );
        }

        // User must be the owner
        if (
            req.user._id.toString() !==
            videoObject.owner.toString()
        ) {
            throw new apiError(
                403,
                "You are not authorized to access this video"
            );
        }
    }

    // 6. Return video details
    return res.status(200).json(
        new apiResponse(
            200,
            {
                videoFile: videoObject.videoFile,
                videoPublicId: videoObject.videoPublicId,
                thumbnail: videoObject.thumbnail,
                thumbnailPublicId: videoObject.thumbnailPublicId,
                title: videoObject.title,
                description: videoObject.description,
                duration: videoObject.duration,
                views: videoObject.views,
                isPublished: videoObject.isPublished,
                owner: videoObject.owner
            },
            "Video received by id"
        )
    );
});


// ✅ Done
const updateVideo = asyncHandler(async (req, res) => {

    // 1. Authentication
    const user = req.user;

    if (!user) {
        throw new apiError(
            401,
            "Unauthorized user"
        );
    }

    // 2. Get videoId from URL
    const { videoId } = req.params;

    // 3. Validate videoId
    if (!videoId) {
        throw new apiError(
            400,
            "Video ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(
            400,
            "Invalid video ID"
        );
    }

    // 4. Find video
    const videoObject = await Video.findById(videoId);

    if (!videoObject) {
        throw new apiError(
            404,
            "Video not found"
        );
    }

    // 5. Check authorization
    if (
        user._id.toString() !==
        videoObject.owner.toString()
    ) {
        throw new apiError(
            403,
            "Unauthorized request"
        );
    }

    // 6. Receive updated fields
    const { title, description } = req.body || {};

    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    // 7. Check if anything was provided
    if (
        !title &&
        !description &&
        !videoFile &&
        !thumbnailFile
    ) {
        throw new apiError(
            400,
            "At least one field is required to update"
        );
    }

    const updateFields = {};

    // 8. Check title
    const newTitle = title?.trim();

    if (
        newTitle &&
        newTitle !== videoObject.title
    ) {
        updateFields.title = newTitle;
    }

    // 9. Check description
    const newDescription = description?.trim();

    if (
        newDescription &&
        newDescription !== videoObject.description
    ) {
        updateFields.description = newDescription;
    }

    let videoUploadResult = null;
    let thumbnailUploadResult = null;

    try {

        // 10. Upload new video
        if (videoFile) {

            videoUploadResult =
                await uploadOnCloudinary(
                    videoFile.path
                );

            if (!videoUploadResult?.secure_url) {
                throw new apiError(
                    500,
                    "Failed to upload video"
                );
            }

            // Validate duration
            if (
                videoUploadResult.duration === undefined ||
                videoUploadResult.duration === null
            ) {
                throw new apiError(
                    500,
                    "Unable to determine video duration"
                );
            }

            updateFields.videoFile =
                videoUploadResult.secure_url;

            updateFields.videoPublicId =
                videoUploadResult.public_id;

            updateFields.duration =
                videoUploadResult.duration;
        }

        // 11. Upload new thumbnail
        if (thumbnailFile) {

            thumbnailUploadResult =
                await uploadOnCloudinary(
                    thumbnailFile.path
                );

            if (!thumbnailUploadResult?.secure_url) {
                throw new apiError(
                    500,
                    "Failed to upload thumbnail"
                );
            }

            updateFields.thumbnail =
                thumbnailUploadResult.secure_url;

            updateFields.thumbnailPublicId =
                thumbnailUploadResult.public_id;
        }

        // 12. No actual changes
        if (Object.keys(updateFields).length === 0) {
            return res.status(200).json(
                new apiResponse(
                    200,
                    videoObject,
                    "No changes were made"
                )
            );
        }

        // 13. Update database
        const updatedVideoObject =
            await Video.findByIdAndUpdate(
                videoId,
                {
                    $set: updateFields
                },
                {
                    new: true
                }
            );

        if (!updatedVideoObject) {
            throw new apiError(
                500,
                "Failed to update video"
            );
        }

        // 14. Delete old video
        if (
            videoUploadResult?.public_id &&
            videoObject.videoPublicId
        ) {
            await deleteFromCloudinary(
                videoObject.videoPublicId,
                "video"
            );
        }

        // 15. Delete old thumbnail
        if (
            thumbnailUploadResult?.public_id &&
            videoObject.thumbnailPublicId
        ) {
            await deleteFromCloudinary(
                videoObject.thumbnailPublicId,
                "image"
            );
        }

        // 16. Return response
        return res.status(200).json(
            new apiResponse(
                200,
                updatedVideoObject,
                "Video updated successfully"
            )
        );

    } catch (error) {

        // Cleanup newly uploaded video
        if (videoUploadResult?.public_id) {
            await deleteFromCloudinary(
                videoUploadResult.public_id,
                "video"
            );
        }

        // Cleanup newly uploaded thumbnail
        if (thumbnailUploadResult?.public_id) {
            await deleteFromCloudinary(
                thumbnailUploadResult.public_id,
                "image"
            );
        }

        throw error;
    }
});


// ✅ Done
const deleteVideo = asyncHandler(async (req, res) => {

    // 1. Authentication
    const user = req.user;

    if (!user) {
        throw new apiError(
            401,
            "User not found"
        );
    }

    // 2. Receive videoId
    const { videoId } = req.params;

    // 3. Validate videoId
    if (!videoId) {
        throw new apiError(
            400,
            "Video ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(
            400,
            "Invalid video ID"
        );
    }

    // 4. Find video
    const videoObject = await Video.findById(videoId);

    if (!videoObject) {
        throw new apiError(
            404,
            "Video not found"
        );
    }

    // 5. Check authorization
    if (
        user._id.toString() !==
        videoObject.owner.toString()
    ) {
        throw new apiError(
            403,
            "User does not own the video"
        );
    }

    // 6. Delete video from DB
    const deletedVideo =
        await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new apiError(
            500,
            "Failed to delete video"
        );
    }

    // 7. Delete video from Cloudinary
    if (deletedVideo.videoPublicId) {
        await deleteFromCloudinary(
            deletedVideo.videoPublicId,
            "video"
        );
    }

    // 8. Delete thumbnail from Cloudinary
    if (deletedVideo.thumbnailPublicId) {
        await deleteFromCloudinary(
            deletedVideo.thumbnailPublicId,
            "image"
        );
    }

    // 9. Return response
    return res.status(200).json(
        new apiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    );
});


// ✅ Done
const togglePublishStatus = asyncHandler(async (req, res) => {

    // 1. Authentication
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new apiError(
            404,
            "User not found"
        );
    }

    // 2. Get videoId
    const { videoId } = req.params;

    // 3. Validate videoId
    if (!videoId) {
        throw new apiError(
            400,
            "No videoId was found"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(
            400,
            "Invalid video id"
        );
    }

    // 4. Find video
    const videoObject =
        await Video.findById(videoId);

    if (!videoObject) {
        throw new apiError(
            404,
            "Video was not found"
        );
    }

    // 5. Check authorization
    if (
        user._id.toString() !==
        videoObject.owner.toString()
    ) {
        throw new apiError(
            403,
            "Unauthorized request"
        );
    }

    // 6. Invert publish status
    videoObject.isPublished =
        !videoObject.isPublished;

    // 7. Update DB
    const updatedVideoObject =
        await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished:
                        videoObject.isPublished
                }
            },
            {
                new: true
            }
        );

    if (!updatedVideoObject) {
        throw new apiError(
            500,
            "Failed to update publish status"
        );
    }

    // 8. Return response
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedVideoObject,
                updatedVideoObject.isPublished
                    ? "Video published successfully"
                    : "Video unpublished successfully"
            )
        );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};