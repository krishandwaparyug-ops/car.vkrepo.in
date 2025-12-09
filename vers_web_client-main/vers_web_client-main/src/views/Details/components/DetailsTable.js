import React, { memo } from "react";
import dayjs from "dayjs";
import { CgSpinner } from "react-icons/cg";
import { useSelector } from "react-redux";

const DetailsTable = (props) => {
  const { data } = props;
  const loading = useSelector((state) => state.details.data.loading);

  const handleOnLocation = (latitude, longitude) => {
    const url = `https://www.google.com/maps/place/${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-scroll">
        <table className="w-full uppercase border-collapse">
          <thead className="h-10">
            <tr className="h-full sticky top-0 bg-slate-200 cursor-default select-none text-center text-sm">
              <th className="border border-gray-400 font-semibold text-md">
                name
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                rc no
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                chassis no
              </th>
              {/* <th className="border border-gray-400 font-semibold text-md">
                engine no
              </th> */}
              <th className="border border-gray-400 font-semibold text-md">
                mek and model
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                location
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                latitude
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                longitude
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                search time
              </th>
              <th className="border border-gray-400 font-semibold text-md">
                action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center w-full text-sm">
                  <div className="h-full w-full justify-center items-center flex flex-col">
                    <CgSpinner
                      className={`h-10 w-10 text-blue-500 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                  </div>
                </td>
              </tr>
            ) : data?.length > 0 ? (
              data?.map((details) => {
                return (
                  <tr
                    className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md text-gray-800"
                    key={details?._id}
                  >
                    <td className="border border-gray-400 ps-2 pe-2">
                      {details?.user_details?.name || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2">
                      {details?.rc_no || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2">
                      {details?.chassis_no || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2">
                      {details?.mek_and_model || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2">
                      {details?.location || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2">
                      {details?.latitude || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2">
                      {details?.longitude || "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2 ">
                      {dayjs(details?.createdAt).format("DD/MM/YYYY, hh:mm A") ||
                        "-"}
                    </td>
                    <td className="border border-gray-400 ps-2 pe-2 ">
                      <div>
                        <button
                          onClick={() =>
                            handleOnLocation(
                              details?.latitude,
                              details?.longitude
                            )
                          }
                          className={`ps-2 pe-2 bg-orange-400 h-8 border-0 text-md rounded-sm uppercase font-semibold flex text-white items-center justify-start hover:bg-orange-300`}
                        >
                          Map
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="text-center w-full text-md">
                  Details Not Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default memo(DetailsTable);
