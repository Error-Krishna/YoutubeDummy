import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const getAllVideos = asyncHandler(async (requestAnimationFrame, res) => {

});
const publishAVideo = asyncHandler(async (requestAnimationFrame, res) => {

});
const getVideoById = asyncHandler(async (requestAnimationFrame, res) => {

});
const updateVideo = asyncHandler(async (requestAnimationFrame, res) => {

});
const deleteVideo = asyncHandler(async (requestAnimationFrame, res) => {

});
const togglePublishStatus = asyncHandler(async (requestAnimationFrame, res) => {

});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
