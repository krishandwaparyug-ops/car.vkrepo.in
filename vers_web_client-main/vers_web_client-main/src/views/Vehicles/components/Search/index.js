import { useState } from "react";
import { apiGetVehiclesWithPagination } from "../../../../services/VehicleServices";
import SearchTable from "./components/SearchTable";
import TableSearch from "./components/TableSearch";
import { useSelector, useDispatch } from "react-redux";
import { setData, setPageIndex, setQuery } from "../../store/stateSlice";
const PAGE_SIZE = 50;

const VehicleSearch = () => {
  const data = useSelector((state) => state.vehicle.state.searchQuery.data);
  const dispatch = useDispatch();
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (pageIndex = 1, query, type, branchId) => {

    try {
      const response = await apiGetVehiclesWithPagination({
        searchTerm: query,
        type: type,
        pageIndex,
        pageSize: PAGE_SIZE,
        branchId,
      });
      if (response.status === 200) {
        if (pageIndex === 1) {
          dispatch(setData(response.data?.data));
          setHasMore(true);
        } else {
          dispatch(setData([...data, ...response.data.data]));
        }
        if (response.data.data?.length < PAGE_SIZE) {
          dispatch(setQuery(""));
          setHasMore(false);
        }
        dispatch(setPageIndex(pageIndex + 1));
      } else {
        dispatch(setQuery(""));
        dispatch(setData([]));
        setHasMore(false);
        dispatch(setPageIndex(1));
      }
      return true;
    } catch (error) {}
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
