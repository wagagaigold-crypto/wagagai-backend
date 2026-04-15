import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      min: 8,
      max: 16,
    },
    avatar: {
      type: String,
    },
    otp: {
      type: Number,
    },
    otpExpiryTime: {
      type: Date,
    },
    forgotPassword: {
      type: String,
    },
    setFrgtPswd: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    // delete ret.__v;
    delete ret.password;
    delete ret.forgotPassword;
    delete ret.otp;
    delete ret.otpExpiryTime;
    // delete ret.id;
    // delete ret.setFrgtPswd;
  },
});

const collectionName = "user";

const User = model("user", userSchema, collectionName);

export default User;
