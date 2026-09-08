import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";


const toggleSubscription = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, "Channel ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    if (user._id.toString() === channelId) {
        throw new apiError(
            400,
            "You cannot subscribe to yourself"
        );
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new apiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: user._id,
        channel: channelId
    });

    if (existingSubscription) {

        await Subscription.findByIdAndDelete(
            existingSubscription._id
        );

        return res.status(200).json(
            new apiResponse(
                200,
                {},
                "Unsubscribed successfully"
            )
        );
    }

    const subscription = await Subscription.create({
        subscriber: user._id,
        channel: channelId
    });

    if (!subscription) {
        throw new apiError(
            500,
            "Failed to subscribe"
        );
    }

    return res.status(200).json(
        new apiResponse(
            200,
            subscription,
            "Subscribed successfully"
        )
    );
});


const getUserSubscriptions = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const subscriptions = await Subscription.find({
        subscriber: user._id
    })
        .populate(
            "channel",
            "fullname username avatar"
        )
        .sort({
            createdAt: -1
        });

    return res.status(200).json(
        new apiResponse(
            200,
            subscriptions,
            "User subscriptions fetched successfully"
        )
    );
});


const checkSubscription = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, "Channel ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    const subscription = await Subscription.findOne({
        subscriber: user._id,
        channel: channelId
    });

    return res.status(200).json(
        new apiResponse(
            200,
            {
                isSubscribed: !!subscription
            },
            "Subscription status fetched successfully"
        )
    );
});


export {
    toggleSubscription,
    getUserSubscriptions,
    checkSubscription
};