import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Tweets } from "../models/tweets.model.js";
import mongoose from "mongoose";


// ✅ Done
// Get all tweets of current user
const getUserTweets = asyncHandler(async (req, res) => {

    // 1. Authentication
    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    // 2. Find user's tweets
    const tweets = await Tweets.find({
        owner: user._id
    }).sort({
        createdAt: -1
    });

    // 3. Return response
    return res.status(200).json(
        new apiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    );
});

// ✅ Done
// Create tweet
const createTweet = asyncHandler(async (req, res) => {

    // 1. Authentication
    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    // 2. Get content
    const { content } = req.body || {};

    // 3. Validate content
    if (!content?.trim()) {
        throw new apiError(
            400,
            "Tweet content is required"
        );
    }

    const trimmedContent = content.trim();

    // 4. Create tweet
    const tweet = await Tweets.create({
        content: trimmedContent,
        owner: user._id
    });

    if (!tweet) {
        throw new apiError(
            500,
            "Failed to create tweet"
        );
    }

    // 5. Return response
    return res.status(201).json(
        new apiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    );
});

// ✅ Done
// Update tweet
const updateTweet = asyncHandler(async (req, res) => {

    // 1. Authentication
    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    // 2. Get tweet ID
    const { tweetId } = req.params;

    // 3. Validate tweet ID
    if (!tweetId) {
        throw new apiError(
            400,
            "Tweet ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(
            400,
            "Invalid tweet ID"
        );
    }

    // 4. Find tweet
    const tweet = await Tweets.findById(tweetId);

    if (!tweet) {
        throw new apiError(
            404,
            "Tweet not found"
        );
    }

    // 5. Check authorization
    if (
        user._id.toString() !==
        tweet.owner.toString()
    ) {
        throw new apiError(
            403,
            "Unauthorized request"
        );
    }

    // 6. Get new content
    const { content } = req.body || {};

    // 7. Validate content
    if (!content?.trim()) {
        throw new apiError(
            400,
            "Tweet content is required"
        );
    }

    const newContent = content.trim();

    // 8. Check if content actually changed
    if (newContent === tweet.content) {
        return res.status(200).json(
            new apiResponse(
                200,
                tweet,
                "No changes were made"
            )
        );
    }

    // 9. Update tweet
    const updatedTweet = await Tweets.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: newContent
            }
        },
        {
            new: true
        }
    );

    if (!updatedTweet) {
        throw new apiError(
            500,
            "Failed to update tweet"
        );
    }

    // 10. Return response
    return res.status(200).json(
        new apiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    );
});

// ✅ Done
// Delete tweet
const deleteTweet = asyncHandler(async (req, res) => {

    // 1. Authentication
    const user = req.user;

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    // 2. Get tweet ID
    const { tweetId } = req.params;

    // 3. Validate tweet ID
    if (!tweetId) {
        throw new apiError(
            400,
            "Tweet ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(
            400,
            "Invalid tweet ID"
        );
    }

    // 4. Find tweet
    const tweet = await Tweets.findById(tweetId);

    if (!tweet) {
        throw new apiError(
            404,
            "Tweet not found"
        );
    }

    // 5. Check authorization
    if (
        user._id.toString() !==
        tweet.owner.toString()
    ) {
        throw new apiError(
            403,
            "Unauthorized request"
        );
    }

    // 6. Delete tweet
    const deletedTweet = await Tweets.findByIdAndDelete(
        tweetId
    );

    if (!deletedTweet) {
        throw new apiError(
            500,
            "Failed to delete tweet"
        );
    }

    // 7. Return response
    return res.status(200).json(
        new apiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    );
});


export {
    getUserTweets,
    createTweet,
    updateTweet,
    deleteTweet
};