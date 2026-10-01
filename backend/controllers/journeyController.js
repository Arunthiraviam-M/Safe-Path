import Journey from "../models/Journey.js";

// @route  POST /api/journeys
export const createJourney = async (req, res, next) => {
  try {
    const journey = await Journey.create({ ...req.body, user: req.user._id });
    res.status(201).json({ journey });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/journeys
export const getMyJourneys = async (req, res, next) => {
  try {
    const journeys = await Journey.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ journeys });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/journeys/:id/status
export const updateJourneyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const journey = await Journey.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );
    if (!journey) return res.status(404).json({ message: "Journey not found" });
    res.status(200).json({ journey });
  } catch (error) {
    next(error);
  }
};
