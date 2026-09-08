import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

router.post(
    "/",
    verifyJWT,
    createPlaylist
);

router.get(
    "/",
    verifyJWT,
    getUserPlaylists
);

router.get(
    "/:playlistId",
    verifyJWT,
    getPlaylistById
);

router.post(
    "/:playlistId/videos/:videoId",
    verifyJWT,
    addVideoToPlaylist
);

router.delete(
    "/:playlistId/videos/:videoId",
    verifyJWT,
    removeVideoFromPlaylist
);

router.patch(
    "/:playlistId",
    verifyJWT,
    updatePlaylist
);

router.delete(
    "/:playlistId",
    verifyJWT,
    deletePlaylist
);

export default router;