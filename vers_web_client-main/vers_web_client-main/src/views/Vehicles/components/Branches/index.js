import React from "react";
import BranchAndHeadOfficeCard from "./components/BranchAndHeadOfficeCard";
import { useSelector } from 'react-redux';

const BranchDetails = () => {
  const loading = useSelector(
    (state) => state.vehicle.data.vehicleDetailsAndDuplicates.loading
  );
  return !loading && <BranchAndHeadOfficeCard />;
};

export default BranchDetails;
