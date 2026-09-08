import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    toggleSubscription,
    getUserSubscriptions,
    checkSubscription
} from "../controllers/subscription.controller.js";

const router = Router();

router.post(
    "/:channelId",
    verifyJWT,
    toggleSubscription
);

router.get(
    "/",
    verifyJWT,
    getUserSubscriptions
);

router.get(
    "/:channelId",
    verifyJWT,
    checkSubscription
);

export default router;
