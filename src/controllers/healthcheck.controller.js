import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

// ✅ Done
const healthCheck = asyncHandler(async (req, res) => {
    const dbStateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };

    const dbState = dbStateMap[mongoose.connection.readyState] || "unknown";

    return res.status(200).json(
        new apiResponse(
            200,
            {
                status: "OK",
                database: dbState,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            },
            "Service is healthy"
        )
    );
});

export {
    healthCheck
}
