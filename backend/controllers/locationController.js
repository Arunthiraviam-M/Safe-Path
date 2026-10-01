import LocationHistory from "../models/LocationHistory.js";

// @route  POST /api/location
// Called by the frontend's LocationShareButton (via browser Geolocation API)
// whenever sharing is toggled on, and periodically while it stays on.
export const updateLocation = async (req, res, next) => {
  try {
    const { lng, lat, sharingActive } = req.body;
    if (lng === undefined || lat === undefined) {
      return res.status(400).json({ message: "lng and lat are required" });
    }

    const entry = await LocationHistory.create({
      user: req.user._id,
      coordinates: [lng, lat],
      sharingActive: !!sharingActive,
    });

    res.status(201).json({ message: "Location updated", location: entry });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/location/latest
export const getLatestLocation = async (req, res, next) => {
  try {
    const entry = await LocationHistory.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ location: entry });
  } catch (error) {
    next(error);
  }
};
