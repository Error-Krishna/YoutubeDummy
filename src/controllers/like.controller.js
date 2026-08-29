import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const getLikedVideos = asyncHandler(async (requestAnimationFrame, res) => {

});
const toggleCommentLike = asyncHandler(async (requestAnimationFrame, res) => {

});
const toggleTweetLike = asyncHandler(async (requestAnimationFrame, res) => {

});
const toggleVideoLike = asyncHandler(async (requestAnimationFrame, res) => {

});
export {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
}
