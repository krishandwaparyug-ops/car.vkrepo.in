import React from "react";

const CountButton = (props) => {
  const { data } = props;
  return (
    <button
      className="text-md pe-3 ps-3 h-full bg-gray-300 cursor-no-drop text-black border-0 rounded-sm upload-count-btn"
      disabled={true}
    >
      {data}
    </button>
  );
};

export default CountButton;
