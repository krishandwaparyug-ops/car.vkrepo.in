import InfiniteScroll from "react-infinite-scroller";
import { setSelectedVehicle } from "../../../store/stateSlice";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
const SearchTable = (props) => {
  const type = useSelector((state) => state.vehicle.state.searchQuery.type);
  const pageIndex = useSelector(
    (state) => state.vehicle.state.searchQuery.pageIndex
  );
  const query = useSelector((state) => state.vehicle.state.searchQuery.query);
  const data = useSelector((state) => state.vehicle.state.searchQuery.data);
  const branchId = useSelector(
    (state) => state.vehicle.state.searchQuery.branchId
  );
  const dispatch = useDispatch();
  const { fetchData, hasMore } = props;

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const loadFunc = () => {
    fetchData?.(pageIndex, query, type, branchId);
  };

  const uniqueData = useMemo(() => {
    return data?.filter((obj, index, self) => {
      return self.findIndex((o) => o.rc_no === obj.rc_no) === index;
    });
  }, [data]);

  return (
    <div className="w-full h-full overflow-scroll">
      <InfiniteScroll
        loadMore={loadFunc}
        hasMore={hasMore}
        initialLoad={false}
        threshold={1000}
        useWindow={false}
        loader={
          data.length > 0 && hasMore ? (
            <div className="p-2 text-center">Loading...</div>
          ) : null
        }
      >
        <table className="w-full uppercase border-collapse">
          <thead className="h-10 relative">
            <tr className="h-full sticky top-0 bg-slate-200 cursor-default select-none text-center text-md">
              <th className="border font-semibold border-gray-400 text-md">
                rc no
              </th>
              <th className="border font-semibold border-gray-400 text-md">
                chassis no
              </th>
              <th className="border font-semibold border-gray-400 text-md">
                mek & model
              </th>
            </tr>
          </thead>
          <tbody>
            {uniqueData?.map((vehicle, index) => {
              const isSelected = index === selectedRowIndex;

              return (
                <tr
                  className={`text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md ${
                    isSelected ? "!bg-indigo-200" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    dispatch(
                      setSelectedVehicle(
                        type === "rc_no"
                          ? vehicle?.rc_no || ""
                          : vehicle?.chassis_no || ""
                      )
                    );
                    setSelectedRowIndex(index);
                  }}
                >
                  <td className="border border-gray-400 ps-2 pe-2">
                    {vehicle?.rc_no || "-"}
                  </td>
                  <td className="border border-gray-400 ps-2 pe-2">
                    {vehicle?.chassis_no || "-"}
                  </td>
                  <td className="border border-gray-400 ps-2 pe-2">
                    {vehicle?.mek_and_model || "-"}
                  </td>
                </tr>
              );
            })}
            {data?.length === 0 ? (
              <tr className="text-left cursor-default select-none h-8 text-md text-gray-800">
                <td
                  colSpan="4"
                  className="border text-center text-md border-gray-400 ps-2 pe-2 "
                >
                  Vehicles not found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};
export default SearchTable;
