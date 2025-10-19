import { Router } from "express";
import { FriendshipController } from "../controllers/friendshipController";

const router = Router();

// 1️⃣ GET all friendships — static route first
router.get("/", FriendshipController.getAllFriends);

export default router;
