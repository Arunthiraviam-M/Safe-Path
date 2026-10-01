import SafePlace from "../models/SafePlace.js";

// @route  GET /api/safe-places?lng=..&lat=..&radius=..&category=..
// radius is in meters, defaults to 3000 (3km)
export const getNearbySafePlaces = async (req, res, next) => {
  try {
    const { lng, lat, radius = 3000, category } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: "lng and lat query params are required" });
    }

    const query = {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius),
        },
      },
    };
    if (category) query.category = category;

    const places = await SafePlace.find(query).limit(50);
    res.status(200).json({ count: places.length, places });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/safe-places  (admin/seed use)
export const createSafePlace = async (req, res, next) => {
  try {
    const place = await SafePlace.create(req.body);
    res.status(201).json({ place });
  } catch (error) {
    next(error);
  }
};
