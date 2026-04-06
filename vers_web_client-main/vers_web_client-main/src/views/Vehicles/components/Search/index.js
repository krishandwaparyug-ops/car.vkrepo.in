import { useState } from "react";
import { apiGetVehiclesWithPagination } from "../../../../services/VehicleServices";
import SearchTable from "./components/SearchTable";
import TableSearch from "./components/TableSearch";
import { useSelector, useDispatch } from "react-redux";
import { setData, setPageIndex } from "../../store/stateSlice";
const PAGE_SIZE = 50;

const VehicleSearch = () => {
  const data = useSelector((state) => state.vehicle.state.searchQuery.data);
  const dispatch = useDispatch();
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (pageIndex = 1, query, type, branchId) => {
    const normalizedQuery = String(query || "").trim();

    if (normalizedQuery.length < 2) {
      dispatch(setData([]));
      dispatch(setPageIndex(1));
      setHasMore(false);
      return false;
    }

    try {
      const response = await apiGetVehiclesWithPagination({
        searchTerm: normalizedQuery,
        type: type,
        pageIndex,
        pageSize: PAGE_SIZE,
        branchId,
      });

      if (response.status === 200) {
        const incomingData = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        if (pageIndex === 1) {
          dispatch(setData(incomingData));
        } else {
          dispatch(setData([...(Array.isArray(data) ? data : []), ...incomingData]));
        }

        setHasMore(incomingData.length >= PAGE_SIZE);
        dispatch(setPageIndex(pageIndex + 1));
        return true;
      } else {
        dispatch(setData([]));
        setHasMore(false);
        dispatch(setPageIndex(1));
        return false;
      }
    } catch (error) {
      dispatch(setData([]));
      setHasMore(false);
      dispatch(setPageIndex(1));
      return false;
    }
  };

  return (
    <div className="w-full h-full rounded-sm">
      <TableSearch fetchData={fetchData} />
      <SearchTable
        fetchData={fetchData}
        hasMore={hasMore}
        setHasMore={setHasMore}
        data={data}
      />
    </div>
  );
};

export default VehicleSearch;
