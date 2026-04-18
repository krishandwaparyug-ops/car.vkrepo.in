const responseError = require("../../../../../errors/responseError");
const Header = require("../../../../../models/file.header.model");

const normalizeAlias = (value = "") => {
  return value
    ?.toString()
    ?.trim()
    ?.toLowerCase()
    ?.replace(/[^a-z0-9]/g, "");
};

const buildAddToSetPayload = (header = {}) => {
  return Object.entries(header).reduce((acc, [field, rawValues]) => {
    const values = Array.isArray(rawValues) ? rawValues : [rawValues];
    const normalizedValues = Array.from(
      new Set(values.map((value) => normalizeAlias(value)).filter(Boolean))
    );

    if (normalizedValues.length < 1) {
      return acc;
    }

    acc[field] =
      normalizedValues.length === 1
        ? normalizedValues[0]
        : { $each: normalizedValues };

    return acc;
  }, {});
};

const updateHeader = async (req, res, next) => {
  try {
    const { header = {} } = req.body;

    if (!header || typeof header !== "object" || Array.isArray(header)) {
      return next(responseError(400, "Invalid header payload"));
    }

    const addToSetPayload = buildAddToSetPayload(header);

    if (Object.keys(addToSetPayload).length < 1) {
      return next(responseError(400, "No valid header aliases provided"));
    }

    await Header.findOneAndUpdate(
      {},
      { $addToSet: addToSetPayload },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Header aliases updated",
      fields: Object.keys(addToSetPayload),
    });
  } catch (error) {
    console.error("[Header] update failed", error?.message || error);
    return next(responseError(500, "Internal server error"));
  }
};

module.exports = { updateHeader };
