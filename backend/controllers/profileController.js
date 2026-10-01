import User from "../models/User.js";

// @route  PUT /api/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, dateOfBirth, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();
    res.status(200).json({ message: "Profile updated", user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/profile/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/profile/trusted-contacts
export const addTrustedContact = async (req, res, next) => {
  try {
    const { name, relationship, phoneNumber } = req.body;
    const user = await User.findById(req.user._id);
    user.trustedContacts.push({ name, relationship, phoneNumber });
    await user.save();
    res.status(201).json({ message: "Contact added", user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/profile/trusted-contacts/:contactId
export const removeTrustedContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const user = await User.findById(req.user._id);
    user.trustedContacts = user.trustedContacts.filter(
      (c) => c._id.toString() !== contactId
    );
    await user.save();
    res.status(200).json({ message: "Contact removed", user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};
