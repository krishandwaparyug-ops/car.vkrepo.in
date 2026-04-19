import React, { useState } from "react";
import { toast } from "react-toastify";
import { validRcRegexType } from "../constants";
import { CgSpinner } from "react-icons/cg";

const notify = (message, type = "error") => toast[type](message);

const CHUNK_SIZE = 20000;

const invalidRcRegexType = [
  {
    valueType: /^[A-Za-z]{2}[0-9]{1}[A-Za-z]{3}[0-9]{3}$/,
    convertType: /^([A-Za-z]{2})([0-9])([A-Za-z]{3})([0-9]{3})$/,
    convertInto: "$10$2$30$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{1}[A-Za-z]{3}[0-9]{4}$/,
    convertType: /^([A-Za-z]{2})([0-9])([A-Za-z]{3})([0-9]{4})$/,
    convertInto: "$10$2$3$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{2}[A-Za-z]{3}[0-9]{3}$/,
    convertType: /^([A-Za-z]{2})([0-9]{2})([A-Za-z]{3})([0-9]{3})$/,
    convertInto: "$1$2$30$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{2}[A-Za-z]{1}[0-9]{3}$/,
    convertType: /^([A-Za-z]{2})([0-9]{2})([A-Za-z])(\d+)$/,
    convertInto: "$1$2$30$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{2}[A-Za-z]{2}[0-9]{3}$/,
    convertType: /^([A-Za-z]{2})([0-9]{2})([A-Za-z]{2})(\d+)$/,
    convertInto: "$1$2$30$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{1}[A-Za-z]{1}[0-9]{3}$/,
    convertType: /^([A-Za-z]{2})([0-9])([A-Za-z])([0-9]{3})$/,
    convertInto: "$10$2$30$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{1}[A-Za-z]{2}[0-9]{3}$/,
    convertType: /^([A-Za-z]{2})([0-9])([A-Za-z]{2})([0-9]{3})$/,
    convertInto: "$10$2$30$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{1}[A-Za-z]{1}[0-9]{4}$/,
    convertType: /^([A-Za-z]{2})([0-9])([A-Za-z])([0-9]{4})$/,
    convertInto: "$10$2$3$4",
  },
  {
    valueType: /^[A-Za-z]{2}[0-9]{1}[A-Za-z]{2}[0-9]{4}$/,
    convertType: /^([A-Za-z]{2})([0-9])([A-Za-z]{2})([0-9]{4})$/,
    convertInto: "$10$2$3$4",
  },
];

const findIndex = (arr, name) => {
  return arr
    ?.map((value) => value?.toString().toLowerCase().split(" ").join("_"))
    ?.indexOf(name);
};

const validRcNumberByRegex = (value) => {
  let status = false;
  for (let i = 0; i < validRcRegexType.length; i++) {
    if (validRcRegexType[i].test(value)) {
      status = true;
      break;
    }
  }
  return status;
};

const validChassisNumber = (value) => {
  if (!value) {
    return false;
  }
  if (value?.toString().length < 4) {
    return false;
  }
  return true;
};

const getOnlyNumAndChar = (value) => {
  if (!value) return value;
  return value
    ?.toString()
    ?.match(/[a-zA-Z0-9]+/g)
    ?.join("");
};

const verifyDataWithRcOrChassis = (
  searchIndex,
  header,
  data,
  type = "rc_no"
) => {
  let start = 0;
  const verifiedValidData = [];
  const verifiedInvalidData = [];
  verifiedInvalidData.push(header);
  const rows = Array.isArray(data) ? data.slice(1) : [];
  const dataLength = rows.length;
  while (start < dataLength) {
    const end = Math.min(start + CHUNK_SIZE, dataLength);
    for (let i = start; i < end; i++) {
      let isValid = false;
      const value = getOnlyNumAndChar(rows[i][searchIndex]);
      isValid =
        type === "rc_no"
          ? validRcNumberByRegex(value)
          : validChassisNumber(value);
      if (isValid) verifiedValidData.push(rows[i]);
      else {
        let isChanged = false;
        for (let j = 0; j < invalidRcRegexType.length; j++) {
          if (invalidRcRegexType[j].valueType.test(value)) {
            const newRc = value?.replace(
              invalidRcRegexType[j].convertType,
              invalidRcRegexType[j].convertInto
            );
            const newRecord = [...rows[i]];
            newRecord[searchIndex] = newRc;
            verifiedInvalidData.push(newRecord);
            isChanged = true;
            break;
          }
        }
        if (!isChanged) {
          verifiedInvalidData.push(rows[i]);
        }
      }
    }
    start = end;
  }
  return { verifiedValidData, verifiedInvalidData };
};

const verifyDataWithRCAndChassis = (rc_index, chassis_index, header, data) => {
  let start = 0;
  const verifiedValidData = [];
  const verifiedInvalidData = [];
  verifiedInvalidData.push(header);
  const rows = Array.isArray(data) ? data.slice(1) : [];
  const dataLength = rows.length;
  while (start < dataLength) {
    const end = Math.min(start + CHUNK_SIZE, dataLength);
    for (let i = start; i < end; i++) {
      let isValid = false;
      isValid =
        validRcNumberByRegex(getOnlyNumAndChar(rows[i][rc_index])) ||
        validChassisNumber(getOnlyNumAndChar(rows[i][chassis_index]));
      if (isValid) verifiedValidData.push(rows[i]);
      else {
        let isChanged = false;
        for (let j = 0; j < invalidRcRegexType.length; j++) {
          if (
            invalidRcRegexType[j].valueType.test(
              getOnlyNumAndChar(rows[i][rc_index])
            )
          ) {
            const newRc = getOnlyNumAndChar(rows[i][rc_index])?.replace(
              invalidRcRegexType[j].convertType,
              invalidRcRegexType[j].convertInto
            );
            const newRecord = [...rows[i]];
            newRecord[rc_index] = newRc;
            verifiedInvalidData.push(newRecord);
            isChanged = true;
            break;
          }
        }
        if (!isChanged) {
          verifiedInvalidData.push(rows[i]);
        }
      }
    }
    start = end;
  }
  return { verifiedValidData, verifiedInvalidData };
};

const VerifyButton = (props) => {
  const {
    data = [],
    verifiedValidData = [],
    sourceTotalRows = 0,
    setFileData,
    setVerifiedValidData,
    setIsVerifyBtnClick,
  } = props;
  const [loading, setLoading] = useState(false);

  const onHandleVerifyData = async (nextVerifiedValidData, nextVerifiedInvalidData) => {
    setVerifiedValidData?.(Array.isArray(nextVerifiedValidData) ? nextVerifiedValidData : []);
    setFileData(Array.isArray(nextVerifiedInvalidData) ? nextVerifiedInvalidData : []);
    setIsVerifyBtnClick?.(true);
  };

  const handleVerify = async () => {
    if (loading) {
      return;
    }

    if (!Array.isArray(data) || data.length < 2) {
      notify("No records found to verify");
      return;
    }

    const header = data?.[0];

    const invalidRows = Array.isArray(data) ? data.slice(1) : [];
    let previousValidRows = Array.isArray(verifiedValidData)
      ? [...verifiedValidData]
      : [];
    const maxRows = Number(sourceTotalRows) > 0 ? Number(sourceTotalRows) : 0;

    if (maxRows > 0 && previousValidRows.length + invalidRows.length > maxRows) {
      const allowedPrevValidRows = Math.max(maxRows - invalidRows.length, 0);
      previousValidRows = previousValidRows.slice(0, allowedPrevValidRows);
    }

    const rowsForVerification = [...previousValidRows, ...invalidRows];
    const verificationDataset = [header, ...rowsForVerification];
    setLoading(true);
    try {
      const rc_index = findIndex(header, "rc_no");
      const chassis_index = findIndex(header, "chassis_no");

      if (rc_index >= 0 && chassis_index >= 0) {
        const { verifiedInvalidData, verifiedValidData } =
          verifyDataWithRCAndChassis(
            rc_index,
            chassis_index,
            header,
            verificationDataset
          );
        await onHandleVerifyData(verifiedValidData, verifiedInvalidData);
      } else if (rc_index >= 0) {
        const { verifiedInvalidData, verifiedValidData } =
          verifyDataWithRcOrChassis(rc_index, header, verificationDataset);
        await onHandleVerifyData(verifiedValidData, verifiedInvalidData);
      } else if (chassis_index >= 0) {
        const { verifiedInvalidData, verifiedValidData } =
          verifyDataWithRcOrChassis(
            chassis_index,
            header,
            verificationDataset,
            "chassis_no"
          );
        await onHandleVerifyData(verifiedValidData, verifiedInvalidData);
      } else {
        notify("RC / Chassis no not found");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="text-md pe-3 ps-3 h-full bg-gray-50 text-black border-0 rounded-sm flex justify-start items-center hover:bg-gray-200 upload-verify-btn"
      onClick={handleVerify}
      disabled={loading}
    >
      {loading ? (
        <CgSpinner
          className={`${loading ? "animate-spin" : ""}`}
        />
      ) : null}
      Verify
    </button>
  );
};

export default VerifyButton;
