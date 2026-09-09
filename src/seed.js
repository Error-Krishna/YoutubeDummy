import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { User } from "./models/user.model.js";
import { Video } from "./models/video.model.js";
import { Comments } from "./models/comment.model.js";
import { Likes } from "./models/likes.model.js";
import { Tweets } from "./models/tweets.model.js";
import { Subscription } from "./models/subscription.model.js";
import { Playlists } from "./models/playlist.model.js";
import { DB_NAME } from "./constants.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
}

const videoUrls = [
    "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
    "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
    "https://storage.googleapis.com/coverr-main/mp4/Big_Buck_Bunny.mp4",
];

const thumbnailUrls = [
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1280",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1280",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1280",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280",
];

const avatarUrls = Array.from(
    { length: 20 },
    (_, i) => `https://i.pravatar.cc/300?img=${i + 1}`
);

const names = [
    "Aarav Sharma",
    "Vihaan Patel",
    "Aditya Kumar",
    "Arjun Mehta",
    "Rohan Verma",
    "Kabir Singh",
    "Ishaan Gupta",
    "Krishna Kapoor",
    "Dev Malhotra",
    "Aryan Joshi",
    "Ananya Sharma",
    "Diya Patel",
    "Meera Kapoor",
    "Sara Khan",
    "Aisha Verma",
    "Riya Mehta",
    "Kiara Singh",
    "Tanya Gupta",
    "Myra Joshi",
    "Avni Malhotra",
];

const videoTitles = [
    "Building a Full Stack Application",
    "My Developer Setup in 2026",
    "Learn JavaScript From Scratch",
    "React Project Tutorial",
    "Node.js Backend Tutorial",
    "MongoDB Explained Simply",
    "NestJS Complete Beginner Guide",
    "How I Structure My Backend",
    "REST API Design Explained",
    "JWT Authentication Tutorial",
    "Docker for Developers",
    "Git and GitHub Workflow",
    "VS Code Productivity Tips",
    "TypeScript Beginner Tutorial",
    "Understanding Async JavaScript",
    "Express.js Crash Course",
    "Mongoose Deep Dive",
    "How Databases Actually Work",
    "Frontend Developer Roadmap",
    "Backend Developer Roadmap",
    "How I Built My Portfolio",
    "Coding Project Ideas",
    "Things I Wish I Knew Before Coding",
    "How to Debug JavaScript",
    "Software Engineering Principles",
];

const commentTexts = [
    "This was really helpful!",
    "Great explanation 🔥",
    "Can you make a part 2?",
    "Very easy to understand.",
    "This solved my problem.",
    "Amazing tutorial!",
    "Thanks for sharing.",
    "The explanation at the end was excellent.",
    "I learned something new today.",
    "Really useful content.",
];

const tweetTexts = [
    "Just finished working on my backend project 🚀",
    "Learning something new every day.",
    "Consistency beats motivation.",
    "Finally understood how JWT authentication works!",
    "Building projects is the best way to learn.",
    "Another day, another bug fixed 😂",
    "Backend development is getting interesting.",
    "Today I learned something really cool.",
    "Small progress is still progress.",
    "Time to build something instead of watching tutorials.",
];

const randomItem = (array) =>
    array[Math.floor(Math.random() * array.length)];

const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (array) =>
    [...array].sort(() => Math.random() - 0.5);

async function seed() {
    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);

    console.log("Connected to MongoDB");

    console.log("Clearing existing dummy data...");

    await Promise.all([
        Likes.deleteMany({}),
        Comments.deleteMany({}),
        Tweets.deleteMany({}),
        Subscription.deleteMany({}),
        Playlists.deleteMany({}),
        Video.deleteMany({}),
        User.deleteMany({}),
    ]);

    console.log("Old dummy data removed.");

    // --------------------------------------------------
    // USERS
    // --------------------------------------------------

    const passwordHash = await bcrypt.hash("Password@123", 10);

    const users = [];

    for (let i = 0; i < 20; i++) {
        const fullname = names[i];

        const username = fullname
            .toLowerCase()
            .replace(/\\s+/g, "")
            .replace(/[^a-z0-9]/g, "");

        users.push({
            fullname,
            username: `${username}${i + 1}`,
            email: `dummyuser${i + 1}@example.com`,
            password: passwordHash,
            avatar: avatarUrls[i % avatarUrls.length],
            coverImage: thumbnailUrls[i % thumbnailUrls.length],
        });
    }

    const createdUsers = await User.insertMany(users);

    console.log(`Created ${createdUsers.length} users`);

    // --------------------------------------------------
    // VIDEOS
    // --------------------------------------------------

    const videos = [];

    for (let i = 0; i < 50; i++) {
        const owner = randomItem(createdUsers);

        videos.push({
            videoFile: videoUrls[i % videoUrls.length],
            videoPublicId: `dummy-video-${i + 1}`,
            thumbnail: thumbnailUrls[i % thumbnailUrls.length],
            thumbnailPublicId: `dummy-thumbnail-${i + 1}`,

            title: `${randomItem(videoTitles)} #${i + 1}`,

            description:
                "This is dummy video data generated for frontend and backend testing. It contains realistic information for testing video cards, video pages, search, sorting, pagination and user channels.",

            duration: randomNumber(30, 1800),

            views: randomNumber(0, 100000),

            isPublished: Math.random() > 0.15,

            owner: owner._id,
        });
    }

    const createdVideos = await Video.insertMany(videos);

    console.log(`Created ${createdVideos.length} videos`);

    // --------------------------------------------------
    // COMMENTS
    // --------------------------------------------------

    const comments = [];

    for (let i = 0; i < 200; i++) {
        comments.push({
            content: randomItem(commentTexts),
            video: randomItem(createdVideos)._id,
            owner: randomItem(createdUsers)._id,
        });
    }

    const createdComments = await Comments.insertMany(comments);

    console.log(`Created ${createdComments.length} comments`);

    // --------------------------------------------------
    // TWEETS
    // --------------------------------------------------

    const tweets = [];

    for (let i = 0; i < 100; i++) {
        tweets.push({
            content: randomItem(tweetTexts),
            owner: randomItem(createdUsers)._id,
        });
    }

    const createdTweets = await Tweets.insertMany(tweets);

    console.log(`Created ${createdTweets.length} tweets`);

    // --------------------------------------------------
    // SUBSCRIPTIONS
    // --------------------------------------------------

    const subscriptionSet = new Set();
    const subscriptions = [];

    while (subscriptions.length < 100) {
        const subscriber = randomItem(createdUsers);
        const channel = randomItem(createdUsers);

        if (subscriber._id.equals(channel._id)) {
            continue;
        }

        const key = `${subscriber._id}-${channel._id}`;

        if (subscriptionSet.has(key)) {
            continue;
        }

        subscriptionSet.add(key);

        subscriptions.push({
            subscriber: subscriber._id,
            channel: channel._id,
        });
    }

    await Subscription.insertMany(subscriptions);

    console.log(`Created ${subscriptions.length} subscriptions`);

    // --------------------------------------------------
    // LIKES
    // --------------------------------------------------

    const likeSet = new Set();
    const likes = [];

    while (likes.length < 300) {
        const user = randomItem(createdUsers);
        const video = randomItem(createdVideos);

        const key = `${user._id}-${video._id}`;

        if (likeSet.has(key)) {
            continue;
        }

        likeSet.add(key);

        likes.push({
            likedBy: user._id,
            video: video._id,
        });
    }

    await Likes.insertMany(likes);

    console.log(`Created ${likes.length} video likes`);

    // Comment likes
    const commentLikeSet = new Set();
    const commentLikes = [];

    while (commentLikes.length < 200) {
        const user = randomItem(createdUsers);
        const comment = randomItem(createdComments);

        const key = `${user._id}-${comment._id}`;

        if (commentLikeSet.has(key)) {
            continue;
        }

        commentLikeSet.add(key);

        commentLikes.push({
            likedBy: user._id,
            comment: comment._id,
        });
    }

    await Likes.insertMany(commentLikes);

    console.log(`Created ${commentLikes.length} comment likes`);

    // Tweet likes
    const tweetLikeSet = new Set();
    const tweetLikes = [];

    while (tweetLikes.length < 150) {
        const user = randomItem(createdUsers);
        const tweet = randomItem(createdTweets);

        const key = `${user._id}-${tweet._id}`;

        if (tweetLikeSet.has(key)) {
            continue;
        }

        tweetLikeSet.add(key);

        tweetLikes.push({
            likedBy: user._id,
            tweet: tweet._id,
        });
    }

    await Likes.insertMany(tweetLikes);

    console.log(`Created ${tweetLikes.length} tweet likes`);

    // --------------------------------------------------
    // PLAYLISTS
    // --------------------------------------------------

    const playlists = [];

    for (let i = 0; i < 30; i++) {
        const owner = randomItem(createdUsers);

        const shuffledVideos = shuffle(createdVideos)
            .slice(0, randomNumber(3, 10))
            .map((video) => video._id);

        playlists.push({
            name: `My Playlist ${i + 1}`,
            description:
                "Dummy playlist created for frontend testing.",
            owner: owner._id,
            videos: shuffledVideos,
        });
    }

    await Playlists.insertMany(playlists);

    console.log(`Created ${playlists.length} playlists`);

    // --------------------------------------------------
    // WATCH HISTORY
    // --------------------------------------------------

    for (const user of createdUsers) {
        const history = shuffle(createdVideos)
            .slice(0, randomNumber(5, 15))
            .map((video) => video._id);

        await User.findByIdAndUpdate(user._id, {
            $set: {
                watchHistory: history,
            },
        });
    }

    console.log("Watch history populated.");

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    console.log("");
    console.log("======================================");
    console.log("🎉 DATABASE SEED COMPLETE");
    console.log("======================================");
    console.log(`Users:         ${createdUsers.length}`);
    console.log(`Videos:        ${createdVideos.length}`);
    console.log(`Comments:      ${createdComments.length}`);
    console.log(`Tweets:        ${createdTweets.length}`);
    console.log(`Subscriptions: ${subscriptions.length}`);
    console.log(`Video likes:   ${likes.length}`);
    console.log(`Comment likes: ${commentLikes.length}`);
    console.log(`Tweet likes:   ${tweetLikes.length}`);
    console.log(`Playlists:     ${playlists.length}`);
    console.log("Watch history: populated");
    console.log("======================================");
    console.log("");
    console.log("Test login:");
    console.log("Email:    dummyuser1@example.com");
    console.log("Password: Password@123");
    console.log("");

    await mongoose.disconnect();
}

seed().catch(async (error) => {
    console.error("");
    console.error("❌ SEED FAILED");
    console.error(error);
    console.error("");

    await mongoose.disconnect();
    process.exit(1);
});
