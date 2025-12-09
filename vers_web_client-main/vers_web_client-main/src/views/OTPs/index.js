import React, { useEffect, useMemo, useState } from "react";
import OTPsTable from "./components/OTPsTable";
import { injectReducer } from "../../store";
import OTPReducer from "./store";
import { useDispatch, useSelector } from "react-redux";
import { getOTPList } from "./store/dataSlice";
import OTPTableSearch from "./components/TableSearch";
import PasswordForm from "./components/PasswordForm";
import DeviceRequest from "../DeviceRequest";

injectReducer("otp", OTPReducer);

const OTPs = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const loading = useSelector((state) => state.otp.data.OTP.loading);
  const data = useSelector((state) => state.otp.data.OTP.OTPs);

  const fetchAllUserWithOTPs = () => {
    dispatch(getOTPList());
  };

  useEffect(() => {
    if (data.length === 0) {
      fetchAllUserWithOTPs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterUsers = useMemo(() => {
    return data?.filter(
      (users) =>
        users?.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        users?.mobile
          ?.toString()
          .toLowerCase()
          .startsWith(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  return (
    <div className="grid grid-cols-12 gap-2 pe-2 ps-2 h-[85vh]">
      <div className="grid col-span-6 h-full">
        <div className="w-full h-full rounded-sm">
          <OTPTableSearch
            setSearchQuery={setSearchQuery}
            onRefresh={fetchAllUserWithOTPs}
            loading={loading}
          />
          <OTPsTable data={filterUsers} />
        </div>
      </div>
      <div className="grid col-span-6 h-full">
        <DeviceRequest />
      </div>
      <PasswordForm />
    </div>
  );
};

export default OTPs;
