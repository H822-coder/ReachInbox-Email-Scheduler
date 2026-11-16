

import express from "express";
import {
  scheduleEmail,
  getEmails,
} from "../controllers/emailController.js";

const router = express.Router();

router.post("/schedule", scheduleEmail);
router.get("/", getEmails);

export default router;

