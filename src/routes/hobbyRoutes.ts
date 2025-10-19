import { Router } from "express";
import { HobbyController } from "../controllers/hobbyController";

const router = Router();

router.post("/:userId", HobbyController.addHobby);
router.delete("/:userId", HobbyController.removeHobby);
router.get("/",HobbyController.getAllHobbies)
router.post("/",HobbyController.createHobby);
router.delete("/delete/:hobbyId",HobbyController.deleteHobby)
export default router;
