import { useEffect, useMemo } from "react";
import DetailsTable from "./components/DetailsTable";
import { useSelector } from "react-redux";
import { getVehicleDetailsAndDuplicates } from "../../store/dataSlice";
import { useDispatch } from "react-redux";

const VehicleDetails = () => {
  const dispatch = useDispatch();
  const details = useSelector(
    (state) => state.vehicle.data.vehicleDetailsAndDuplicates.vehicleDetails
  );
  const loading = useSelector(
    (state) => state.vehicle.data.vehicleDetailsAndDuplicates.loading
  );
  const selectedVehicleIndex = useSelector(
    (state) => state.vehicle.state.selectedVehicleIndex
  );
  const selectedVehicle = useSelector(
    (state) => state.vehicle.state.selectedVehicle
  );
  const type = useSelector((state) => state.vehicle.state.searchQuery.type);
  const filterData = useMemo(() => {
    let vehicle = "";
    let branch;
    vehicle = details?.vehicles?.filter(
      (vehicle) =>
        vehicle.branch_id === details.branches[selectedVehicleIndex]?._id
    )?.[0];
    branch = details?.branches?.filter(
      (branch) => branch?._id === details.branches[selectedVehicleIndex]?._id
    )?.[0];
    return { branch, vehicle };
  }, [details, selectedVehicleIndex]);

  const fetchVehicleDetails = async (selectedVehicle) => {
    dispatch(getVehicleDetailsAndDuplicates({ query: selectedVehicle, type }));
  };

  useEffect(() => {
    if (selectedVehicle) fetchVehicleDetails(selectedVehicle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle]);
  return (
    !loading && (
      <DetailsTable data={filterData.vehicle} branch={filterData.branch} />
    )
  );
};

export default VehicleDetails;
