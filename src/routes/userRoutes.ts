import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

// User CRUD
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.post("/:userId/link",UserController.linkFriend);
router.delete("/:userId/unlink",UserController.unlinkFriend);


export default router;
