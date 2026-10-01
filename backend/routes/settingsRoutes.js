import express from "express";
import { protect } from "../middleware/auth.js";
import { getSettings, updateSettings, logoutAllDevices } from "../controllers/settingsController.js";

const router = express.Router();

router.use(protect);

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/logout-all-devices", logoutAllDevices);

export default router;
