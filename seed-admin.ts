import crypto from "crypto";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = "sha512";

const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST)
    .toString("hex");
  return `${salt}:${hash}`;
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isActive: { type: Boolean, default: false },
  otp: Number,
  otpExpiryTime: Date,
  forgotPassword: String,
  setFrgtPswd: { type: Boolean, default: false },
  avatar: String,
}, { timestamps: true });

const User = mongoose.model("user", userSchema, "user");

const ADMIN_EMAIL = "admin@wagagai.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_NAME = "Admin";

async function seed() {
  await mongoose.connect(process.env.DB_URI!);
  console.log("Connected to database");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin user already exists, updating password and activating...");
    existing.password = hashPassword(ADMIN_PASSWORD);
    existing.isActive = true;
    await existing.save();
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashPassword(ADMIN_PASSWORD),
      isActive: true,
    });
    console.log("Admin user created!");
  }

  console.log(`\nAdmin credentials:`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
