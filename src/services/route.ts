import { Router } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import Auth from "./auth/auth.route";
import Certificate from "./certificate/certificate.router";

const router = Router();

router.use("/auth", Auth);

router.use("/certificate", Certificate);

// Temporary seed endpoint - remove after use
router.get("/seed-admin", async (req, res) => {
  try {
    const User = mongoose.model("user");
    const existing = await User.findOne({ email: "admin@wagagai.com" });
    if (existing) {
      return res.json({ message: "Admin already exists" });
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync("Admin@1234", salt, 100000, 64, "sha512").toString("hex");
    await User.create({
      name: "Admin",
      email: "admin@wagagai.com",
      password: `${salt}:${hash}`,
      isActive: true,
    });
    res.json({ message: "Admin created!", email: "admin@wagagai.com" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
