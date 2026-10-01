import express from "express";
import { protect } from "../middleware/auth.js";
import { getNearbySafePlaces, createSafePlace } from "../controllers/safePlaceController.js";

const router = express.Router();

router.get("/", protect, getNearbySafePlaces);
router.post("/", protect, createSafePlace);

export default router;
