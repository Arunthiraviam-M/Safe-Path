import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const trustedContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    password: { type: String, required: true, select: false },
    profilePhoto: { type: String, default: "" },

    trustedContacts: [trustedContactSchema],

    preferences: {
      defaultTravelMode: {
        type: String,
        enum: ["walking", "bicycle", "two_wheeler", "car", "public_transport"],
        default: "walking",
      },
      darkMode: { type: Boolean, default: true },
      language: { type: String, default: "en" },
      locationSharing: { type: Boolean, default: false },
      emergencyAlerts: { type: Boolean, default: true },
      journeyMonitoring: { type: Boolean, default: true },
      safetyNotifications: { type: Boolean, default: true },
    },

    // --- Session tracking / sliding expiration fields ---
    lastLogin: { type: Date },
    lastActive: { type: Date },
    sessionExpiry: { type: Date },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Hash password before saving, only if it was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.model("User", userSchema);
