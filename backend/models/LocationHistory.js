import mongoose from "mongoose";

const locationHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    sharingActive: { type: Boolean, default: false },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("LocationHistory", locationHistorySchema);
