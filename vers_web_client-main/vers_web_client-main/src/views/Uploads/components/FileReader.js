import React from "react";
import Papa from "papaparse";

let xlsxLoaderPromise = null;

const normalizeHeaderValue = (value) => {
  return value
    ?.toString()
    .toLowerCase()
    ?.replace(/[^a-zA-Z0-9\s]/g, "")
    ?.replace(/\s+/g, " ")
    ?.trim();
};

const getDefaultHeaderFromRows = (rows = []) => {
  const firstRow = Array.isArray(rows?.[0]) ? rows[0] : [];
  return firstRow.map((value) => normalizeHeaderValue(value));
};

const ensureXlsxLoaded = async () => {
  if (typeof window.XLSX !== "undefined") {
    return;
  }

  if (!xlsxLoaderPromise) {
    xlsxLoaderPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[data-xlsx-loader="true"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js";
      script.dataset.xlsxLoader = "true";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  await xlsxLoaderPromise;
};

const FileReader = (props) => {
  const {
    setFileData,
    setDefaultFileHeader,
    setVerifiedValidData,
    setSourceTotalRows,
    setLoading,
    setRawFile,
    setIsVerifyClicked,
  } = props;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setFileData?.([]);
    setVerifiedValidData?.([]);
    setSourceTotalRows?.(0);
    setIsVerifyClicked?.(false);
    setLoading?.(true);
    setRawFile?.(file);

    const fileName = file.name.toLowerCase();

    // Fast CSV parse path on worker thread.
    if (fileName.endsWith(".csv")) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: "greedy",
        dynamicTyping: false,
        worker: true,
        fastMode: true,
        complete: (results) => {
          const rows = Array.isArray(results?.data) ? results.data : [];
          setLoading?.(false);
          setFileData?.(rows);
          setDefaultFileHeader?.(getDefaultHeaderFromRows(rows));
          setSourceTotalRows?.(Math.max(0, rows.length - 1));
        },
        error: (err) => {
          setLoading?.(false);
          setSourceTotalRows?.(0);
          console.error("CSV Parse Error", err);
        },
      });
      return;
    }

    // Fast XLSX parse path: avoid conversion to CSV + second parse.
    const parseExcel = async () => {
      try {
        await ensureXlsxLoaded();
        const ab = await file.arrayBuffer();

        // Yield once so loading UI paints immediately for large files.
        await new Promise((resolve) => setTimeout(resolve, 0));

        const workbook = window.XLSX.read(ab, {
          type: "array",
          dense: true,
          cellText: false,
          cellDates: false,
        });

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error("No worksheet found in file");
        }

        const worksheet = workbook.Sheets[sheetName];
        const rows = window.XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          blankrows: false,
          defval: "",
        });

        const normalizedRows = Array.isArray(rows)
          ? rows.filter((row) => Array.isArray(row) && row.length > 0)
          : [];

        setLoading?.(false);
        setFileData?.(normalizedRows);
        setDefaultFileHeader?.(getDefaultHeaderFromRows(normalizedRows));
        setSourceTotalRows?.(Math.max(0, normalizedRows.length - 1));
      } catch (error) {
        setLoading?.(false);
        setSourceTotalRows?.(0);
        console.error("Excel Parsing Error:", error);
      }
    };

    parseExcel();
  };

  return (
    <input
      className="text-sm h-14"
      accept=".csv, .xlsx, .xlsb"
      type="file"
      onChange={handleFileChange}
    />
  );
};

export default FileReader;
