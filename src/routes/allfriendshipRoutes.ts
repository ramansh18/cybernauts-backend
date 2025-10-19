import { Router } from "express";
import { FriendshipController } from "../controllers/friendshipController";

const router = Router();

router.get("/",FriendshipController.getAllFriends);

export default router;