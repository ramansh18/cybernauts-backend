import { Router } from "express";
import { GraphController } from "../controllers/graphController";

const router = Router();

router.get("/", GraphController.getGraph);

export default router;
