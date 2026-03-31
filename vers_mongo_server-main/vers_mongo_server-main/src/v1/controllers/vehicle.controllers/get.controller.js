const responseError = require("../../../../errors/responseError");
const Vehicle = require("../../../../models/vehicle.model");
const Branch = require("../../../../models/branch.model");
const checkObjectId = require("../../utils/checkObjectId");
const mongoose = require("mongoose");
const fs = require("fs");
const { Transform } = require("json2csv");
const { pipeline } = require("stream");

// GET VEHICLES BY ADMIN ON SEARCH
const getVehiclesByAdminOnSearch = async (req, res, next) => {
  try {
    const {
      pageIndex,
      pageSize,
      searchTerm,
      type = "rc_no",
      branchId,
    } = req.body;

    if (!["rc_no", "chassis_no"].includes(type))
      return next(responseError(406, "Invalid type"));

    const page = parseInt(pageIndex) || 1;
    const limit = parseInt(pageSize) || 50;

    let searchType = "last_four_digit_rc";
    if (type === "chassis_no") searchType = "last_four_digit_chassis";

    const matchQuery = {
      [searchType]: String(parseInt(searchTerm)),
    };

    if (branchId) {
      matchQuery.branch_id = new mongoose.Types.ObjectId(branchId);
    }

    const vehicles = await Vehicle.find(matchQuery)
      .select("_id rc_no mek_and_model chassis_no")
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({ data: vehicles });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

// GET VEHICLES BY USER ON SEARCH
const getVehiclesByUserOnSearch = async (req, res, next) => {
  try {
    const { query = "", type = "rc_no", pageIndex, pageSize } = req.body;

    if (!["rc_no", "chassis_no"].includes(type))
      return next(responseError(406, "Invalid type"));

    const page = parseInt(pageIndex) || 1;
    const limit = parseInt(pageSize) || 10;

    let searchType = "last_four_digit_rc";
    if (type === "chassis_no") searchType = "last_four_digit_chassis";

    const vehicles = await Vehicle.find({
      [searchType]: String(parseInt(query)),
    })
      .select("_id rc_no chassis_no mek_and_model")
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({ data: vehicles });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

// GET VEHICLE DETAILS BY ADMIN BY RC NUMBER OR CHASSIS NUMBER
const getDuplicateRecordsByRcNumberOrChassisNo = async (req, res, next) => {
  try {
    const { type = "rc_no", query = "" } = req.body;

    if (!["rc_no", "chassis_no"].includes(type)) {
      return next(responseError(406, "Invalid type"));
    }

    const normalizedQuery = String(query || "")?.trim()?.toUpperCase();

    if (!normalizedQuery) {
      return res.status(200).json({ data: {} });
    }

    const vehicles = await Vehicle.find({ [type]: normalizedQuery })
      .sort({ createdAt: -1 })
      .lean();

    if (vehicles.length === 0) {
      return res.status(200).json({ data: {} });
    }

    const uniqueBranchIds = [
      ...new Set(
        vehicles
          .map((item) => item?.branch_id?.toString())
          .filter(Boolean)
      ),
    ];

    // UI uses one vehicle row per branch, so keep only the latest one per branch.
    const latestVehicleByBranch = new Map();
    for (const item of vehicles) {
      const key = item?.branch_id?.toString();
      if (!key || latestVehicleByBranch.has(key)) {
        continue;
      }
      latestVehicleByBranch.set(key, item);
    }
    const vehiclesForResponse = Array.from(latestVehicleByBranch.values());

    const branchObjectIds = uniqueBranchIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const branches = await Branch.aggregate([
      {
        $match: {
          _id: { $in: branchObjectIds },
        },
      },
      {
        $lookup: {
          from: "head_offices",
          localField: "head_office_id",
          foreignField: "_id",
          as: "head_offices",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                branches: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          contact_one: 1,
          contact_two: 1,
          contact_three: 1,
          records: 1,
          updatedAt: 1,
          head_offices: 1,
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    return res.status(200).json({
      data: {
        _id: { [type]: normalizedQuery },
        branch_id: uniqueBranchIds,
        data_count: vehicles.length,
        branch_count: uniqueBranchIds.length,
        duplicates: [],
        branches,
        vehicles: vehiclesForResponse,
      },
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

// GET VEHICLE DETAILS BY ADMIN BY VEHICLE ID
const getVehicleDetailsByUserFromVehicleId = async (req, res, next) => {
  try {
    const { _id } = req.body;
    if (!checkObjectId(_id)) return next(responseError(406, "Invalid ID"));
    const branchId = req?.user?.branchId || [];
    const vehicle = await Vehicle.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
          branch_id: { $nin: branchId },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branch_id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                contact_one: 1,
                contact_two: 1,
                contact_three: 1,
              },
            },
          ],
          as: "localBranch",
        },
      },
      {
        $unwind: "$localBranch",
      },
      {
        $project: {
          _id: 1,
          contract_no: 1,
          financer: 1,
          rc_no: 1,
          chassis_no: 1,
          engine_no: 1,
          mek_and_model: 1,
          area: 1,
          region: 1,
          branch: 1,
          customer_name: 1,
          od: 1,
          gv: 1,
          ses9: 1,
          ses17: 1,
          tbr: 1,
          poss: 1,
          bkt: 1,
          localBranch: 1,
        },
      },
    ]);

    if (vehicle.length === 0) {
      return next(responseError(404, "Vehicle not found"));
    }
    req.vehicle = vehicle?.[0];
    return next();
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

const downloadVehicleByBranchId = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const fields = [
      "contract_no",
      "financer",
      "rc_no",
      "chassis_no",
      "engine_no",
      "mek_and_model",
      "area",
      "region",
      "branch",
      "customer_name",
      "ex_name",
      "level1",
      "level2",
      "level3",
      "level4",
      "level1con",
      "level2con",
      "level3con",
      "level4con",
      "od",
      "gv",
      "ses9",
      "ses17",
      "tbr",
      "poss",
      "bkt",
      "createdAt",
      "updatedAt",
    ];
    const opts = { fields };
    const transformOpts = {
      objectMode: true,
      highWaterMark: 16384,
      encoding: "utf-8",
    };
    const json2csv = new Transform(opts, transformOpts);
    const data = Vehicle.find({ branch_id: branchId }).cursor();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
    pipeline(data, json2csv, res, (err) => {
      if (err) {
        return next(responseError(500, "Something went wrong"));
      }
    });
  } catch (error) {
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = {
  getVehiclesByAdminOnSearch,
  getVehiclesByUserOnSearch,
  getDuplicateRecordsByRcNumberOrChassisNo,
  getVehicleDetailsByUserFromVehicleId,
  downloadVehicleByBranchId,
};
