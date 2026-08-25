import { Router } from "express";
import { getCropPosts, createCropPost, respondToCropPost } from "../controllers/cropPost.controller.js";

const router = Router();
router.get("/", getCropPosts);
router.post("/", createCropPost);
router.post("/:id/response", respondToCropPost);
export default router;
