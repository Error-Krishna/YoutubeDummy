import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Playlists } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";


const createPlaylist = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { name, description } = req.body || {};

    if (!name?.trim()) {
        throw new apiError(400, "Playlist name is required");
    }

    if (!description?.trim()) {
        throw new apiError(400, "Playlist description is required");
    }

    const playlist = await Playlists.create({
        name: name.trim(),
        description: description.trim(),
        owner: user._id
    });

    if (!playlist) {
        throw new apiError(500, "Failed to create playlist");
    }

    return res.status(201).json(
        new apiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    );
});


const getUserPlaylists = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const playlists = await Playlists.find({
        owner: user._id
    })
        .populate("videos", "title thumbnail duration views")
        .sort({
            createdAt: -1
        });

    return res.status(200).json(
        new apiResponse(
            200,
            playlists,
            "User playlists fetched successfully"
        )
    );
});


const getPlaylistById = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { playlistId } = req.params;

    if (!playlistId) {
        throw new apiError(400, "Playlist ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlists.findById(playlistId)
        .populate("videos", "videoFile thumbnail title description duration views owner");

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (
        user._id.toString() !==
        playlist.owner.toString()
    ) {
        throw new apiError(
            403,
            "You are not authorized to access this playlist"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new apiError(
            400,
            "Playlist ID and video ID are required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const playlist = await Playlists.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (
        user._id.toString() !==
        playlist.owner.toString()
    ) {
        throw new apiError(
            403,
            "You are not authorized to modify this playlist"
        );
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    if (playlist.videos.some(
        id => id.toString() === videoId
    )) {
        throw new apiError(
            409,
            "Video already exists in playlist"
        );
    }

    playlist.videos.push(videoId);

    await playlist.save();

    return res.status(200).json(
        new apiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new apiError(
            400,
            "Playlist ID and video ID are required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const playlist = await Playlists.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (
        user._id.toString() !==
        playlist.owner.toString()
    ) {
        throw new apiError(
            403,
            "You are not authorized to modify this playlist"
        );
    }

    const videoExists = playlist.videos.some(
        id => id.toString() === videoId
    );

    if (!videoExists) {
        throw new apiError(
            404,
            "Video not found in playlist"
        );
    }

    playlist.videos = playlist.videos.filter(
        id => id.toString() !== videoId
    );

    await playlist.save();

    return res.status(200).json(
        new apiResponse(
            200,
            playlist,
            "Video removed from playlist successfully"
        )
    );
});


const deletePlaylist = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { playlistId } = req.params;

    if (!playlistId) {
        throw new apiError(400, "Playlist ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlists.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (
        user._id.toString() !==
        playlist.owner.toString()
    ) {
        throw new apiError(
            403,
            "You are not authorized to delete this playlist"
        );
    }

    const deletedPlaylist =
        await Playlists.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new apiError(
            500,
            "Failed to delete playlist"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { playlistId } = req.params;

    if (!playlistId) {
        throw new apiError(400, "Playlist ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlists.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (
        user._id.toString() !==
        playlist.owner.toString()
    ) {
        throw new apiError(
            403,
            "You are not authorized to update this playlist"
        );
    }

    const { name, description } = req.body || {};

    if (!name && !description) {
        throw new apiError(
            400,
            "At least one field is required"
        );
    }

    const updateFields = {};

    if (name !== undefined) {

        if (!name.trim()) {
            throw new apiError(
                400,
                "Playlist name cannot be empty"
            );
        }

        updateFields.name = name.trim();
    }

    if (description !== undefined) {

        if (!description.trim()) {
            throw new apiError(
                400,
                "Playlist description cannot be empty"
            );
        }

        updateFields.description = description.trim();
    }

    if (
        updateFields.name === playlist.name &&
        updateFields.description === playlist.description
    ) {
        return res.status(200).json(
            new apiResponse(
                200,
                playlist,
                "No changes were made"
            )
        );
    }

    const updatedPlaylist =
        await Playlists.findByIdAndUpdate(
            playlistId,
            {
                $set: updateFields
            },
            {
                new: true
            }
        );

    if (!updatedPlaylist) {
        throw new apiError(
            500,
            "Failed to update playlist"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    );
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};