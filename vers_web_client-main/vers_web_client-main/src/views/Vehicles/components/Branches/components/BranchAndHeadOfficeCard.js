import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedVehicleIndex } from "../../../store/stateSlice";

const BranchAndHeadOfficeCard = () => {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(0);
  const details = useSelector(
    (state) => state.vehicle.data.vehicleDetailsAndDuplicates.vehicleDetails
  );

  useEffect(() => {
    // Dispatch the initial index (0) when the component mounts
    dispatch(setSelectedVehicleIndex(0));
  }, [dispatch]);

  const handleRowClick = (index) => {
    setSelectedRow(index);
    dispatch(setSelectedVehicleIndex(index));
  };

  return (
    <div className="w-full h-full rounded-sm">
      <div className="h-10 bg-blue-500 flex justify-between items-center p-1 rounded-t-sm"></div>
      <div className="w-full h-full overflow-scroll">
        {details?.branches?.map((item, index) => {
          const isSelected = selectedRow === index;
          return (
            <div
              className={`w-full p-2 ps-3 pe-3 cursor-default ${
                isSelected
                  ? "bg-indigo-200"
                  : "[&:nth-child(even)]:bg-gray-200 hover:bg-gray-100 "
              }`}
              onClick={() => handleRowClick(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-md text-black font-semibold">
                  {item?.head_offices?.[0].name}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  {details?.vehicles?.length > 0
                    ? dayjs(
                        details?.vehicles?.filter(
                          (vehicle) => vehicle.branch_id === item?._id
                        )[0]?.createdAt
                      ).format("DD/MM/YYYY")
                    : ""}
                </p>
              </div>
              <h2 className="text-sm font-medium text-gray-600">{item.name}</h2>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BranchAndHeadOfficeCard;
