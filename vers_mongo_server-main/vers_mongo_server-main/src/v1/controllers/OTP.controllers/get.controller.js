const responseError = require("../../../../errors/responseError");
const User = require("../../../../models/user.model");

const getAllOTPs = async (req, res, next) => {
  try {
    const otpList = await User.aggregate([
      {
        $lookup: {
          from: "otp",
          localField: "_id",
          foreignField: "user_id",
          as: "otp",
          pipeline: [
            {
              $project: {
                otp: 1,
                _id: 1,
                createdAt: 1,
                updatedAt: 1,
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
        $addFields: {
          otp: {
            $cond: {
              if: { $eq: [{ $size: "$otp" }, 0] },
              then: {},
              else: { $arrayElemAt: ["$otp", 0] },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          _id: 1,
          mobile: 1,
          otp: 1,
        },
      },
    ]);
    return res.status(200).json({ data: otpList });
  } catch (error) {
    console.log(error);
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { getAllOTPs };
