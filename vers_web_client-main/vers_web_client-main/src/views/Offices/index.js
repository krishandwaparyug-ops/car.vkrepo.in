import React, { memo, useEffect } from "react";
import HeadOffice from "./components/HeadOffice";
import Branch from "./components/Branch";
import { injectReducer } from "../../store";
import OfficeReducer from "./store";
import { useDispatch, useSelector } from "react-redux";
import { allBranch, allHeadOffice } from "./store/dataSlice";

injectReducer("office", OfficeReducer);

const Offices = () => {
  const dispatch = useDispatch();

  const headOffice =
    useSelector((state) => state.office.data.headOfficeState.headOffice) || [];
  const branch =
    useSelector((state) => state.office.data.branchState.branch) || [];

  useEffect(() => {
    if (branch.length === 0) {
      dispatch(allBranch());
    }
    if (headOffice.length === 0) {
      dispatch(allHeadOffice());
    }
  }, []);

  return (
    <div className="grid grid-cols-12 gap-2 pe-2 ps-2 h-96">
      <div className="col-span-5 h-[85vh]">
        <HeadOffice />
      </div>
      <div className="col-span-7 h-[85vh]">
        <Branch />
      </div>
    </div>
  );
};

export default memo(Offices);
