import mongoose from "mongoose";

const safePlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "police_station",
        "hospital",
        "fire_station",
        "emergency_service",
        "shopping_mall",
        "well_lit_public_place",
        "railway_station",
        "bus_stand",
        "pharmacy",
        "petrol_station",
        "government_office",
        "store_24x7",
      ],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String },
    openStatus: { type: String, enum: ["open", "closed", "unknown"], default: "unknown" },
  },
  { timestamps: true }
);

safePlaceSchema.index({ location: "2dsphere" });

export default mongoose.model("SafePlace", safePlaceSchema);
