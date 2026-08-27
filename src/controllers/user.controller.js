import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "./user.controller.js";
export { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"


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
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User already exists")
    }

    // image?
    const avatarLocalPath = req.files?.avatar[0]?.path

    // avatar?
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

        // upload to cloudinary: avatar?
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
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
    if(createduser){
        throw new apiError(500, "Something went wrong while registring the user")
    }

    // return res
    return res.status(201).json(
        new apiResponse(200, createduser, "User Registered Successfully")
    )





})


export { registerUser }