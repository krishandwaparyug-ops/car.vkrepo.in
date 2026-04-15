const responseError = require("../../../../errors/responseError");
const FileInfo = require("../../../../models/file.info.model");

const getAllFileInfoByAdmin = async (req, res, next) => {
  try {
    const fileInfos = await FileInfo.aggregate([
      {
        $lookup: {
          from: "webhook_banks",
          localField: "bankId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                bank_name: 1,
              },
            },
          ],
          as: "bankDetails",
        },
      },
      {
        $unwind: {
          path: "$bankDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          bankDetails: { $ifNull: ["$bankDetails", []] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    return res.status(200).json({ total: fileInfos.length, data: fileInfos });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { getAllFileInfoByAdmin };
