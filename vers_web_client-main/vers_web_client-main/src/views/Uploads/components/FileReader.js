import React from "react";
import Papa from "papaparse";

const FileReader = (props) => {
  const {
    setFileData,
    setDefaultFileHeader,
    setVerifiedValidData,
    setLoading,
  } = props;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setFileData?.([]);
    setVerifiedValidData?.([]);
    setLoading?.(true);

    const worker = new Worker(
      URL.createObjectURL(
        new Blob([
          `
      importScripts("https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js");
      self.addEventListener('message', (e) => {
          const ab = new FileReaderSync().readAsArrayBuffer(e.data);
            const workbook = XLSX.read(ab, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const excelData = XLSX.utils.sheet_to_csv(worksheet);
            postMessage(excelData);
      }, false);
        `,
        ])
      )
    );
    worker.postMessage(file);
    worker.onmessage = async (event) => {
      const excelData = event.data;
      Papa.parse(excelData, {
        header: false,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (data) => {
          setLoading?.(false);
          setFileData?.(data?.data);
          setDefaultFileHeader?.(
            data?.data?.[0]?.map((value) =>
              value
                ?.toString()
                .toLowerCase()
                ?.replace(/[^a-zA-Z0-9\s]/g, "")
                ?.replace(/\s+/g, " ")
                ?.trim()
            )
          );
        },
      });
    };
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
