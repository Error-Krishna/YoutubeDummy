import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "./user.controller.js";
export { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const generateAccessAndRefreshTokens = async(userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating refresh and access tokens")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // ALGO

    // get user details from frontend 
    // validation - not empty
    // if exists? : username , email
    // image?
    // avatar?
        // upload to cloudinary: avatar?
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res



    // get user details from frontend 
    const {fullname, email, username, password}= req.body
    console.log("Data recieved:", fullname, email, username, password);

    // validation - not empty
    if (
        [fullname, email, username, password].some((field)=>field?.trim() === "")
    ) {
        throw new apiError(400, "All Fields are Required")
    }

    // if exists? : username , email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User already exists")
    }

    // image?
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    console.log("Avatar local path:", avatarLocalPath)
    
    
    // avatar?
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    console.log("Cover image local path:", coverImageLocalPath)

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

        // upload to cloudinary: avatar?
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("Avatar Cloudinary result:", avatar)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("Cover Cloudinary result:", coverImage)
    if(!avatar){
        throw new apiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // check for user creation
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

     // remove password and refresh token field from response
    if(!createduser){
        throw new apiError(500, "Something went wrong while registring the user")
    }

    // return res
    return res.status(201).json(
        new apiResponse(200, createduser, "User Registered Successfully")
    )





})


const loginUser = asyncHandler(async (req, res) => {
    // ALGO

    // req body -> data
    // username || email -> based accesed
    // find the user 
    // password check
    // generate and return access token and refrsh token 
    // send secure cookies(tokens)



    // req body -> data
    const {email, username, password} = req.body

    // username || email -> based accesed
    if(!username || !email){
        throw new apiError(400, "Username or email is Required")
    }

    // find the user 
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new apiError(404, "User doesnot exist")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new apiError(401, "Invalid user credentials")
    }

    // generate and return access token and refrsh token 
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // send secure cookies(tokens)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )


})

const logoutUser = asyncHandler(async (req, res) => {
    // ALGO
    // 

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
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken, options")
    .json(new apiResponse(200, {}, "User Logged Out"))
})  

export { 
    registerUser,
    loginUser,
    logoutUser
}