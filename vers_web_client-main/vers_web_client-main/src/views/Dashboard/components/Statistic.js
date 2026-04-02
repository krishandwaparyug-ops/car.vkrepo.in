import React from "react";

const Statistic = (props) => {
  const { title = "", count = 0, bg_color = "bg-gray-100" } = props;
  return (
    <div className={`stat-card p-4 w-full min-h-[118px] ${bg_color} flex flex-col items-start justify-center rounded-xl`}>
      <h2 className="text-base text-[#38567f] mb-1 font-semibold uppercase tracking-wide">{title}</h2>
      <h1 className="font-extrabold text-3xl text-[#122845]">{count}</h1>
    </div>
  );
};

export default Statistic;
