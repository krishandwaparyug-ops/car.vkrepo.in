import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import CustomContextMenu from "./ContextMenu";
const style = {
  height: "inherit",
  width: "calc(100% - 2px)",
  position: "relative",
  fontWeight: 600,
};

const OnlyNumAndCharAndTrim = (value) => {
  if (!value) return value;
  return value
    ?.toString()
    ?.replace(/[^a-zA-Z0-9\s]/g, "")
    ?.replace(/\s+/g, " ")
    ?.trim();
};

const checkValidHeaderValue = (value, headerOptions = []) => {
  let headerStatus = { key: value, status: false };
  for (let i = 0; i < headerOptions.length; i++) {
    if (
      Object.values(headerOptions[i])[0]?.includes(
        OnlyNumAndCharAndTrim(value)?.toLowerCase()?.split(" ").join("")
      )
    ) {
      headerStatus = { key: Object.keys(headerOptions[i])[0], status: true };
      break;
    }
  }
  return headerStatus;
};

const normalizeSearchToken = (value = "") => {
  return value?.toString()?.toLowerCase()?.replace(/[^a-z0-9]/g, "");
};

const fieldDisplayNameMap = {
  "rc no": "VehicleNo",
  "chassis no": "ChasisNo",
  "mek and model": "Model",
  "engine no": "EngineNo",
  "contract no": "AgreementNo",
  "customer name": "CustomerName",
  "customer contact nos": "CustomerContactNos",
  "customer address": "CustomerAddress",
  region: "Region",
  area: "Area",
  bkt: "Bucket",
  gv: "GV",
  od: "OD",
  branch: "BranchNameImptd",
  level1: "Level1",
  level1con: "Level1ContactNos",
  level2: "Level2",
  level2con: "Level2ContactNos",
  level3: "Level3",
  level3con: "Level3ContactNos",
  level4: "Level4",
  level4con: "Level4ContactNos",
  ses9: "Sec9Available",
  ses17: "Sec17Available",
  tbr: "TBRFlag",
  seasoning: "Seasoning",
  "sender mail id 1": "SenderMailId1",
  "sender mail id 2": "SenderMailId2",
  "ex name": "ExecutiveName",
  poss: "POS",
  toss: "TOSS",
  remark: "Remark",
  "is released": "IsReleased",
};

const getDisplayName = (key = "") => {
  return fieldDisplayNameMap[key] || key;
};

// Dialog that lists all universal column options
const HeaderPickerDialog = ({ headerOptions, header, onSelect, onClose, searchText, setSearchText }) => {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const normalizedSearchText = normalizeSearchToken(searchText);

  const filtered = headerOptions.filter((val) => {
    const key = Object.keys(val)[0];
    const aliases = Array.isArray(Object.values(val)[0]) ? Object.values(val)[0] : [];
    if (!normalizedSearchText) return true;

    const candidates = [key, getDisplayName(key), ...aliases];
    return candidates.some((candidate) =>
      normalizeSearchToken(candidate).includes(normalizedSearchText)
    );
  });

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.35)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          minWidth: 320, maxWidth: 400, width: "90%", padding: "20px 20px 12px 20px",
          display: "flex", flexDirection: "column", maxHeight: "80vh",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: "#1c3a63" }}>
          Select Column Field
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name (e.g., AgreementNo)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            border: "1px solid #c7d8f0", borderRadius: 6, padding: "6px 10px",
            fontSize: 13, marginBottom: 10, outline: "none", width: "100%",
          }}
        />
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* Ignore / clear option */}
          <div
            onClick={() => { onSelect(""); }}
            style={{
              padding: "7px 10px", borderRadius: 5, cursor: "pointer",
              fontSize: 13, color: "#888", marginBottom: 2,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4fb"}
            onMouseLeave={(e) => e.currentTarget.style.background = ""}
          >
            — Ignore this column —
          </div>
          {filtered.map((val, idx) => {
            const key = Object.keys(val)[0];
            const label = getDisplayName(key);
            const alreadyUsed = header.includes(key);
            return (
              <div
                key={idx}
                onClick={() => { if (!alreadyUsed) onSelect(key); }}
                style={{
                  padding: "7px 10px", borderRadius: 5,
                  cursor: alreadyUsed ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 500,
                  color: alreadyUsed ? "#bbb" : "#1c3a63",
                  marginBottom: 2,
                  background: alreadyUsed ? "#f9f9f9" : "",
                }}
                onMouseEnter={(e) => { if (!alreadyUsed) e.currentTarget.style.background = "#e8f0fc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = alreadyUsed ? "#f9f9f9" : ""; }}
              >
                {label}
                {alreadyUsed ? " ✓" : ""}
                {normalizeSearchToken(label) !== normalizeSearchToken(key) && (
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                    {key.toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ color: "#aaa", fontSize: 13, padding: "8px 10px" }}>No results</div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 12, background: "#f0f4fb", border: "none", borderRadius: 6,
            padding: "7px 0", cursor: "pointer", fontSize: 13, color: "#1c3a63", fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const ExcelHeader = (props) => {
  const {
    onDataChange,
    onDeleteData,
    value,
    rowIndex,
    colIndex,
    header = [],
    headerOptions = [],
    defaultFileHeader = [],
    verifiedValidData = [],
    isVerifyClicked = false,
  } = props;

  const [updatedValue, setUpdatedValue] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const selectedLabel = updatedValue ? getDisplayName(updatedValue) : "";

  const isValid = checkValidHeaderValue(updatedValue, headerOptions).status;
  const isDisabled = false;

  const options = [
    {
      name: "Delete Column",
      onclick: (props) => { onDeleteData?.({ ...props, type: "column" }); },
      disabled: false,
    },
    {
      name: "Deselect Header",
      onclick: (props) => { onDeleteData?.({ ...props, type: "column" }); },
      disabled: true,
    },
  ];

  useEffect(() => {
    onDataChange?.({ rowIndex, colIndex, updatedValue });
  }, [updatedValue]);

  const handleSelect = (key) => {
    setUpdatedValue(key);
    setDialogOpen(false);
    setSearchText("");
  };

  return (
    <div style={{ minWidth: "200px", maxWidth: "200px", height: "25px" }}>
      <CustomContextMenu options={options} colIndex={colIndex} rowIndex={rowIndex}>
        <button
          disabled={isDisabled}
          onClick={() => { if (!isDisabled) { setSearchText(""); setDialogOpen(true); } }}
          style={{
            ...style,
            background: isValid ? "yellow" : (isVerifyClicked && !updatedValue) ? "#ffe0e0" : "#f5f5f5",
            border: (isVerifyClicked && !updatedValue) ? "1.5px solid #e53e3e" : "1px solid #ccc",
            cursor: isDisabled ? "default" : "pointer",
            textAlign: "left",
            fontSize: 13,
            padding: "0 6px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={selectedLabel || defaultFileHeader?.[colIndex]?.toString().toUpperCase() || "Click to select"}
        >
          {selectedLabel || (
            <span style={{ color: "#aaa" }}>
              {defaultFileHeader?.[colIndex]?.toString().toUpperCase() || "Select..."}
            </span>
          )}
        </button>
      </CustomContextMenu>

      {dialogOpen && ReactDOM.createPortal(
        <HeaderPickerDialog
          headerOptions={headerOptions}
          header={header}
          onSelect={handleSelect}
          onClose={() => { setDialogOpen(false); setSearchText(""); }}
          searchText={searchText}
          setSearchText={setSearchText}
        />,
        document.body
      )}
    </div>
  );
};
export default ExcelHeader;
