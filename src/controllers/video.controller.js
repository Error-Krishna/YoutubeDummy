import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {

});
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
    console.log("VideoFIle: ", videoFile);
    console.log("thumbnailFIle: ", thumbnailFile);
    
    // 5. Validate files exist
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
            videoLocalPath,
            {
                resource_type: "video"
            }
        );

        if (!videoUploadResult?.url) {
            throw new apiError(
                500,
                "Failed to upload video"
            );
        }

        // 7. Upload thumbnail
        thumbnailUploadResult = await uploadOnCloudinary(
            thumbnailLocalPath
        );

        if (!thumbnailUploadResult?.url) {
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
            videoFile: videoUploadResult.url,
            videoPublicId: videoUploadResult.public_id,
            thumbnail: thumbnailUploadResult.url,
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

        // Cleanup Cloudinary uploads if something failed
        if (videoUploadResult?.public_id) {
            try {
                await deleteFromCloudinary(
                    videoUploadResult.public_id,
                    "video"
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to cleanup video:",
                    cleanupError
                );
            }
        }

        if (thumbnailUploadResult?.public_id) {
            try {
                await deleteFromCloudinary(
                    thumbnailUploadResult.public_id
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to cleanup thumbnail:",
                    cleanupError
                );
            }
        }

        throw error;
    }
});
const getVideoById = asyncHandler(async (req, res) => {

});
const updateVideo = asyncHandler(async (req, res) => {

});
const deleteVideo = asyncHandler(async (req, res) => {
    // Authenticate user
    const user = await User.findById(req.user._id);
    // Validate User
    if(!user){
        throw new apiError(404, "User not found");
    }
    // Recieve videoID from user
    const {videoId} = req.params;
    // validate id
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new apiError(400, "Invalid video ID")
    }
    // find video by id
    const videoObject = await Video.findById(videoId);

    if(!videoObject){
        throw new apiError(404, "video not found")
    }
    // verify if the authenticated user owns the video
    if(user._id.toString() !== videoObject.owner.toString()){
        throw new apiError(403, "user doesnot owns the video")
    }
    // remove video and related data from db
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if(!deletedVideo){
        throw new apiError(500, "Failed to Deleted video")
    }
    // clean up the cloudinary
    if (deletedVideo.videoPublicId) {
        try {
            await deleteFromCloudinary(
                deletedVideo.videoPublicId,
                "video"
            );
        } catch (cleanupError) {
            console.error(
                "Failed to cleanup video:",
                cleanupError
            );
        }
    }

    if(deletedVideo.thumbnailPublicId){
        try {
            await deleteFromCloudinary(
                deleteVideo.thumbnailPublicId,
                "image"
            );
        } catch (cleanupError) {
            console.error(
                "Failed to cleanup thumbnail:",
                cleanupError
            );
        }
    }
    // return sucess message
    return res.
    status(200)
    .json(
        new apiResponse(
            200,
            {},
            "Video deleted Successfully"
        )
    )
    

});
const togglePublishStatus = asyncHandler(async (req, res) => {

});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
