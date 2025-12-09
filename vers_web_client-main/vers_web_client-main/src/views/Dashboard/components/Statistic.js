import React from "react";

const Statistic = (props) => {
  const { title = "", count = 0, bg_color = "bg-gray-100" } = props;
  return (
    <div
      className={`border p-4 w-full h-30 ${bg_color} flex flex-col items-start justify-center rounded-md`}
    >
      <h2 className="text-xl text-gray-800 mb-2 font-medium">{title}</h2>
      <h1 className="font-semibold text-3xl text-gray-900 ">{count}</h1>
    </div>
  );
};

export default Statistic;
