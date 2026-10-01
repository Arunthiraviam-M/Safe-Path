import express from "express";
import { protect } from "../middleware/auth.js";
import { updateLocation, getLatestLocation } from "../controllers/locationController.js";

const router = express.Router();

router.use(protect);

router.post("/", updateLocation);
router.get("/latest", getLatestLocation);

export default router;
