import React, { useEffect, useMemo, useState } from "react";
import DeviceRequestTable from "./components/DeviceRequestTable";
import { injectReducer } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { getAllDeviceRequest } from "./store/dataSlice";
import DeviceRequestTableSearch from "./components/TableSearch";
import DeviceRequestReducer from "./store";

injectReducer("device_request", DeviceRequestReducer);

const DeviceRequest = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const loading = useSelector(
    (state) => state.device_request.data.device.loading
  );
  const data = useSelector((state) => state.device_request.data.device.requests);

  const fetchAllUserDeviceRequest = () => {
    dispatch(getAllDeviceRequest());
  };

  useEffect(() => {
    if (data.length === 0) {
      fetchAllUserDeviceRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterUsers = useMemo(() => {
    return data?.filter(
      (users) =>
        users?.name?.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        users?.mobile
          ?.toString()
          .toLowerCase()
          .startsWith(searchQuery.toLowerCase()) ||
        users?.requestDeviceId
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        users?.deviceId
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  return (
    <div className="w-full h-full rounded-md panel p-2">
      <DeviceRequestTableSearch
        setSearchQuery={setSearchQuery}
        onRefresh={fetchAllUserDeviceRequest}
        loading={loading}
      />
      <DeviceRequestTable data={filterUsers} />
    </div>
  );
};

export default DeviceRequest;
