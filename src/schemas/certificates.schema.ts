import { Schema, model } from "mongoose";

const certificateSchema = new Schema(
  {
    serialNo: {
      type: String,
      unique: true,
    },
    metalType: {
      type: String,
    },
    weight: {
      type: String,
    },
    purity: {
      type: String,
    },
    manufactureYear: {
      type: Number,
    },
    batchNo: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const collectionName = "certificate";

const Certificate = model("certificate", certificateSchema, collectionName);

export default Certificate;
