import express from "express";
import { protect } from "../middleware/auth.js";
import {
  updateProfile,
  changePassword,
  addTrustedContact,
  removeTrustedContact,
} from "../controllers/profileController.js";

const router = express.Router();

router.use(protect); // every route below requires a valid session

router.put("/", updateProfile);
router.put("/change-password", changePassword);
router.post("/trusted-contacts", addTrustedContact);
router.delete("/trusted-contacts/:contactId", removeTrustedContact);

export default router;
