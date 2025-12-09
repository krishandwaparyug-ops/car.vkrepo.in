const dayjs = require("dayjs");
const responseError = require("../../../../errors/responseError");
const Details = require("../../../../models/details.model");
const mongoose = require("mongoose");
const User = require("../../../../models/user.model");

const getAllDetailsByAdmin = async (req, res, next) => {
  try {
    const { user_id, date = new Date(), rc_no } = req.body;
    const filter = {};
    const dateString = new Date(date);
    const startDate = new Date(dateString);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(dateString);
    endDate.setUTCHours(23, 59, 59, 999);
    filter.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
    if (user_id) {
      filter.user_id = new mongoose.Types.ObjectId(user_id);
    }
    if (rc_no) {
      filter.rc_no = rc_no;
    }

    const details = await Details.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_details",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$user_details",
      },
    ]).sort({ createdAt: -1 });
    return res.status(200).json({ data: details });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const getAllUserLastLocation = async (req, res, next) => {
  try {
    const { date = new Date() } = req.body;
    const dateString = new Date(date);
    const startDate = new Date(dateString);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(dateString);
    endDate.setUTCHours(23, 59, 59, 999);
  
    const locations = await User.aggregate([
      {
        $lookup: {
          from: "details",
          localField: "_id",
          foreignField: "user_id",
          as: "location",
          pipeline: [
            {
              $match: {
                createdAt: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
            {
              $project: {
                latitude: 1,
                longitude: 1,
                createdAt: 1,
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: "$location",
      },
      {
        $project: {
          name: 1,
          mobile: 1,
          address: 1,
          _id: 1,
          location: 1,
        },
      },
    ]);
    return res.status(200).json({ data: locations });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { getAllDetailsByAdmin, getAllUserLastLocation };
