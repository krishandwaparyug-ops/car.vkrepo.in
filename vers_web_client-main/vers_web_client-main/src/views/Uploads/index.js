import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const [step, setStep] = useState(null);
  const navigate = useNavigate();

  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-8">UPLOAD RECORDS</h2>
        <div className="flex gap-8">
          <button
            className="w-72 h-32 rounded-lg shadow bg-gray-100 border border-gray-300 flex flex-col items-center justify-center text-lg font-medium hover:bg-gray-200 transition cursor-pointer"
            onClick={() => window.open("/upload/excel", "_blank")}
          >
            <span className="mb-2 text-3xl">??</span>
            Upload Records (Excel)
          </button>
          <button
            className="w-72 h-32 rounded-lg shadow bg-gray-100 border border-gray-300 flex flex-col items-center justify-center text-lg font-medium hover:bg-gray-200 transition cursor-pointer"
            onClick={() => setStep("manual")}
          >
            <span className="mb-2 text-3xl">??</span>
            Add/Merge Records (Manually)
          </button>
        </div>
      </div>
    );
  }

  if (step === "manual") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-8">Add/Merge Records (Manually)</h2>
        <p>Manual entry form coming soon...</p>
        <button className="mt-8 px-6 py-2 rounded bg-blue-600 text-white font-semibold" onClick={() => setStep(null)}>
          Back
        </button>
      </div>
    );
  }
};

export default Uploads;
