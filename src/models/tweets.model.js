import mongoose from "mongoose";

const tweetSchema = mongoose.Schema({
    content:{
        type:String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timeStamps: true})


export const Tweets = mongoose.model("Tweets", playlistSchema)