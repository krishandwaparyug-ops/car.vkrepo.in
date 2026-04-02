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
    <div className="page-grid grid-cols-1 xl:grid-cols-12 min-h-[80vh]">
      <div className="panel xl:col-span-5 h-[85vh] p-2">
        <HeadOffice />
      </div>
      <div className="panel xl:col-span-7 h-[85vh] p-2">
        <Branch />
      </div>
    </div>
  );
};

export default memo(Offices);
