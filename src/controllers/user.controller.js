import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
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
    console.log(email);
    
    if (!(username && email)) {
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
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new apiError(401, "Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.anv.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new apiError(401, "Invalid Refresh Token")
        }
    
        if (incomingRefreshToken!==user?.refreshToken) {
            throw new apiError(410, "Refrsh Token is Expired or used")       
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToekn", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }

})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};