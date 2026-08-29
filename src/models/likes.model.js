import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments"
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweets"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timeStamps: true})


export const Likes = mongoose.model("Likes", likeSchema)