const responseError = require("../../../../errors/responseError");
const Vehicle = require("../../../../models/vehicle.model");
const Branch = require("../../../../models/branch.model");
const checkObjectId = require("../../utils/checkObjectId");
const mongoose = require("mongoose");
const fs = require("fs");
const { Transform } = require("json2csv");
const { pipeline } = require("stream");

const escapeRegExp = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const sanitizeAlphaNum = (value = "") => {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
};

const getLastFourDigits = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return null;
  return String(parseInt(digits.slice(-4), 10) || 0);
};

const buildVehicleSearchQuery = (rawSearch, type) => {
  const searchTerm = String(rawSearch || "").trim();
  if (!searchTerm) return null;

  const sanitized = sanitizeAlphaNum(searchTerm);
  const fullField = type === "chassis_no" ? "chassis_no" : "rc_no";
  const lastFourField =
    type === "chassis_no" ? "last_four_digit_chassis" : "last_four_digit_rc";

  const orConditions = [];

  const lastFour = getLastFourDigits(sanitized || searchTerm);
  if (lastFour !== null) {
    const parsed = parseInt(lastFour, 10);
    orConditions.push({ [lastFourField]: { $in: [lastFour, parsed, String(parsed)] } });
  }

  const upperText = searchTerm.toUpperCase();
  const escapedUpperText = escapeRegExp(upperText);
  if (escapedUpperText) {
    orConditions.push({ [fullField]: { $regex: escapedUpperText, $options: "i" } });
  }

  if (sanitized && sanitized !== upperText) {
    const escapedSanitized = escapeRegExp(sanitized);
    if (escapedSanitized) {
      orConditions.push({ [fullField]: { $regex: escapedSanitized, $options: "i" } });
    }
  }

  if (orConditions.length === 0) return null;
  return { $or: orConditions };
};

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

    const searchQuery = buildVehicleSearchQuery(searchTerm, type);
    if (!searchQuery) {
      return res.status(200).json({ data: [] });
    }

    const andFilters = [searchQuery];

    if (branchId) {
      if (!checkObjectId(branchId)) {
        return next(responseError(406, "Invalid branch Id"));
      }
      const branchObjectId = new mongoose.Types.ObjectId(branchId);
      andFilters.push({
        $or: [{ branch_id: branchObjectId }, { branch_id: branchId }],
      });
    }

    const matchQuery = andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

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

    const searchQuery = buildVehicleSearchQuery(query, type);
    if (!searchQuery) {
      return res.status(200).json({ data: [] });
    }

    const vehicles = await Vehicle.find(searchQuery)
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
    // Query both ObjectId and string forms of branch_id to handle legacy data
    const branchObjId = new mongoose.Types.ObjectId(branchId);
    const data = Vehicle.find({ $or: [{ branch_id: branchObjId }, { branch_id: branchId }] }).cursor();
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
