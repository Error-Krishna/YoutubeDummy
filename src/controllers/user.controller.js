import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false
        });

        return {
            accessToken,
            refreshToken
        };
    } catch (error) {
        if (error instanceof apiError) {
            throw error;
        }

        throw new apiError(
            500,
            "Something went wrong while generating refresh and access tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    const {
        fullname,
        email,
        username,
        password
    } = req.body || {};

    // Validation - fields required
    if (
        [fullname, email, username, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new apiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    });

    if (existedUser) {
        throw new apiError(409, "User already exists");
    }

    // Get uploaded image paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // Avatar is required
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required");
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new apiError(
            500,
            "Something went wrong while uploading avatar"
        );
    }

    // Upload cover image if provided
    let coverImage = null;

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // Create user
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase()
    });

    // Remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new apiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    // Return response
    return res.status(201).json(
        new apiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // Get login details
    const {
        email,
        username,
        password
    } = req.body || {};

    // Username or email is required
    if (!(username || email)) {
        throw new apiError(
            400,
            "Username or email is required"
        );
    }

    // Password is required
    if (!password) {
        throw new apiError(
            400,
            "Password is required"
        );
    }

    // Find user using username or email
    const user = await User.findOne({
        $or: [
            ...(username ? [{ username: username.toLowerCase() }] : []),
            ...(email ? [{ email: email.toLowerCase() }] : [])
        ]
    });

    if (!user) {
        throw new apiError(
            404,
            "User does not exist"
        );
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(
            401,
            "Invalid user credentials"
        );
    }

    // Generate access and refresh tokens
    const {
        accessToken,
        refreshToken
    } = await generateAccessAndRefreshTokens(user._id);

    // Remove password and refresh token from response
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true
    };

    // Send response with cookies
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // Remove refresh token from database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    // Clear authentication cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new apiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(
                401,
                "Refresh token is expired or used"
            );
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const {
            accessToken,
            refreshToken: newRefreshToken
        } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new apiError(
            401,
            error?.message || "Invalid refresh token"
        );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {
        oldPassword,
        newPassword,
        confirmPassword
    } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new apiError(
            400,
            "All password fields are required"
        );
    }

    if (newPassword !== confirmPassword) {
        throw new apiError(
            400,
            "Confirm password must be the same as new password"
        );
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old password");
    }

    user.password = newPassword;

    await user.save({
        validateBeforeSave: false
    });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {},
                "Password changed successfully"
            )
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {
        fullname,
        email
    } = req.body;

    if (!(fullname || email)) {
        throw new apiError(
            400,
            "At least one field is required"
        );
    }

    const updateFields = {};

    if (fullname) {
        updateFields.fullname = fullname;
    }

    if (email) {
        updateFields.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: updateFields
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "Account details updated successfully"
            )
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new apiError(
            400,
            "Avatar file is missing"
        );
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new apiError(
            500,
            "Error while uploading avatar"
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "Avatar updated successfully"
            )
        );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new apiError(
            400,
            "Cover image file is missing"
        );
    }

    const coverImage =
        await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
        throw new apiError(
            500,
            "Error while uploading cover image"
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "Cover image updated successfully"
            )
        );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params
    if(!username?.trim()){
        throw new apiError(400, "UserName is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers. subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])

    if (!channel?.length) {
        throw new apiError(404, "Chsnnel Does not exists")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, cjannel[0], "User channel fetched successfully")
    )
});
const getWatchHistory = asyncHandler(async (req, res) => {
     const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [

                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
     ])

     return res
     .status(200)
     .json(
        apiResponse(200, user[0].watchHistory, "Watch History Fetched Successfully")
     )
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};