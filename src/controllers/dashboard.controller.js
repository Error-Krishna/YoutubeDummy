import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Likes } from "../models/likes.model.js";
import { Comments } from "../models/comment.model.js";


const getChannelStats = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const userId = user._id;

    const videos = await Video.find({
        owner: userId
    }).select("_id views");

    const videoIds = videos.map(video => video._id);

    const totalVideos = videos.length;

    const totalViews = videos.reduce(
        (total, video) => total + (video.views || 0),
        0
    );

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    const totalLikes = await Likes.countDocuments({
        video: {
            $in: videoIds
        }
    });

    const totalComments = await Comments.countDocuments({
        video: {
            $in: videoIds
        }
    });

    return res.status(200).json(
        new apiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes,
                totalComments
            },
            "Channel statistics fetched successfully"
        )
    );
});


const getChannelVideos = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const videos = await Video.find({
        owner: user._id
    })
        .sort({
            createdAt: -1
        });

    return res.status(200).json(
        new apiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    );
});


export {
    getChannelStats,
    getChannelVideos
};