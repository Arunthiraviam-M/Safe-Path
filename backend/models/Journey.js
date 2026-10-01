import mongoose from "mongoose";

const journeySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    origin: {
      label: String,
      coordinates: { type: [Number] }, // [lng, lat]
    },
    destination: {
      label: String,
      coordinates: { type: [Number] },
    },
    travelMode: {
      type: String,
      enum: ["walking", "bicycle", "two_wheeler", "car", "public_transport"],
      default: "walking",
    },
    safetyScore: { type: Number, min: 0, max: 100 },
    estimatedDistanceKm: { type: Number },
    estimatedTimeMinutes: { type: Number },
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "cancelled"],
      default: "planned",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Journey", journeySchema);
