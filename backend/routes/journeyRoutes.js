import express from "express";
import { protect } from "../middleware/auth.js";
import { createJourney, getMyJourneys, updateJourneyStatus } from "../controllers/journeyController.js";

const router = express.Router();

router.use(protect);

router.post("/", createJourney);
router.get("/", getMyJourneys);
router.put("/:id/status", updateJourneyStatus);

export default router;
