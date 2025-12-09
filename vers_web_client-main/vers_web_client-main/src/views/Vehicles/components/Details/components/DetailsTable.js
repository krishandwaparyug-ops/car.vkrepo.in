import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import { useDispatch } from "react-redux";
import { deleteVehicleById } from "../../../store/dataSlice";
import { toast } from "react-toastify";
import { useState } from "react";
import { CgSpinner } from "react-icons/cg";
const notify = (message, type = "error") => toast[type](message);

const sequence = [
  "financer",
  "contract_no",
  "customer_name",
  "rc_no",
  "mek_and_model",
  "engine_no",
  "chassis_no",
  "branch",
  "region",
  "area",
  "bkt",
  "od",
  "poss",
  "gv",
  "ses9",
  "ses17",
  "tbr",
  "ex_name",
  "level1",
  "level1con",
  "level2",
  "level2con",
  "level3",
  "level3con",
  "level4",
  "level4con",
  "updatedAt",
];

const branchSequence = [
  "name",
  {
    contact_one: ["name", "mobile"],
  },
  {
    contact_two: ["name", "mobile"],
  },
  {
    contact_three: ["name", "mobile"],
  },
  "records",
  "updatedAt",
];

const headOfficeSequence = ["name", "branches", "updatedAt"];

const tableRowGenerator = (key, value) => {
  return (
    <>
      <td className="border uppercase border-gray-400 ps-2 font-semibold text-md pe-2 w-40">
        {key}
      </td>
      <td className="border uppercase border-gray-400 ps-2 pe-2">{value}</td>
    </>
  );
};

const copyToClipboard = (data, type) => {
  const {
    customer_name,
    branch,
    contract_no,
    rc_no,
    mek_and_model,
    chassis_no,
  } = data;
  const newJsonString = `*Respected Sir/Ma'am,*\nLoan No - *${
    !contract_no ? "" : contract_no
  }*\nCustomer Name - *${!customer_name ? "" : customer_name}*\nBranch - *${
    !branch ? "" : branch
  }*\nVehicle No - *${!rc_no ? "" : rc_no}*\nChassis No - *${
    !chassis_no ? "" : chassis_no
  }*\nVehicle Model - *${
    !mek_and_model ? "" : mek_and_model
  }*\nVehicle Location - \nLoad Details - \n\nStatus - *${type}*\nANIKET - *9112200050*\n\n${
    type === "OK For Repo"
      ? `Agent name - \nParking Yard - \nConfirm by - \nRemark - \n`
      : ""
  }Agency name = *V K Enterprises*`;
  navigator.clipboard.writeText(newJsonString);
};

const DetailsTable = (props) => {
  const { data, branch } = props;
  const dispatch = useDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (_id, branchId) => {
    setDeleteLoading(true);
    const action = await dispatch(deleteVehicleById({ _id, branchId }));
    if (action.payload?.status === 200) {
      notify("Vehicle successfully deleted", "success");
    } else {
      notify("Vehicle deleted unsuccessful");
    }
    setDeleteLoading(false);
  };
  return (
    <div className="w-full h-full rounded-sm overflow-hidden">
      <div className="w-full h-full overflow-scroll relative">
        <div className="h-10 bg-blue-500 items-center p-1 rounded-t-sm sticky top-0">
          {data ? (
            <div className="flex justify-end gap-2">
              <button
                className="ps-2 pe-2 h-7 text-md border uppercase rounded-sm border-gray-300 bg-red-500 text-white hover:bg-red-400 cursor-default flex justify-start items-center"
                onClick={() => handleDelete(data?._id)}
              >
                {deleteLoading ? (
                  <CgSpinner
                    className={`${deleteLoading ? "animate-spin" : ""}`}
                  />
                ) : null}
                DELETE
              </button>
              <button
                className="ps-2 pe-2 h-7 text-md border uppercase rounded-sm border-gray-300 bg-green-500 text-white hover:bg-green-400 cursor-default"
                onClick={() => copyToClipboard(data, "OK For Repo")}
              >
                OK REPO
              </button>
            </div>
          ) : null}
        </div>
        <div className="h-10 bg-blue-500 flex justify-center items-center p-1 rounded-t-sm">
          <div className="text-md text-white text-center">Vehicle Details</div>
        </div>
        <table className="w-full uppercase border-collapse">
          <tbody className="table-body">
            {!isEmpty(data)
              ? sequence.map((item) => (
                  <tr
                    className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md"
                    key={item}
                  >
                    {tableRowGenerator(
                      item?.toString().split("_").join(" ").toUpperCase(),
                      item === "updatedAt"
                        ? dayjs(data[item]).format("DD/MM/YYYY hh:mm A") || "-"
                        : data[item]?.toString().toUpperCase() || "-"
                    )}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        <div className="h-10 bg-blue-500 flex justify-center items-center p-1 rounded-t-sm">
          <h2 className="text-md text-white text-center">Branch Details</h2>
        </div>
        <table className="w-full uppercase border-collapse">
          <tbody className="table-body">
            {!isEmpty(branch)
              ? branchSequence.map((item) => {
                  return (
                    <tr
                      className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-10 text-md"
                      key={item}
                    >
                      {typeof item === "string"
                        ? item === "updatedAt"
                          ? tableRowGenerator(
                              item
                                ?.toString()
                                .split("_")
                                .join(" ")
                                .toUpperCase(),
                              dayjs(branch[item]).format("DD/MM/YYYY hh:mm A")
                            )
                          : tableRowGenerator(
                              item?.toString().split("_").join(" "),
                              branch[item]
                            )
                        : tableRowGenerator(
                            Object.keys(item)?.[0].split("_").join(" "),
                            Object.values(item)?.[0]?.map(
                              (element, index, arr) => {
                                if (index === arr.length - 1) {
                                  return branch[Object.keys(item)?.[0]][
                                    element
                                  ];
                                }
                                return `${
                                  branch[Object.keys(item)?.[0]][element]
                                } / `;
                              }
                            )
                          )}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        <div className="h-10 bg-blue-500 flex justify-center items-center p-1 rounded-t-sm">
          <h2 className="text-md text-white text-center">
            Head Office Details
          </h2>
        </div>
        <table className="w-full uppercase border-collapse">
          <tbody className="table-body">
            {!isEmpty(branch)
              ? headOfficeSequence.map((item) => {
                  return (
                    <tr
                      className="text-left cursor-default select-none [&:nth-child(even)]:bg-gray-200 h-8 text-md"
                      key={item}
                    >
                      {item === "updatedAt"
                        ? tableRowGenerator(
                            item?.toString().split("_").join(" ").toUpperCase(),
                            dayjs(branch?.head_offices[0][item]).format(
                              "DD/MM/YYYY hh:mm A"
                            )
                          )
                        : tableRowGenerator(
                            item?.toString().split("_").join(" "),
                            branch?.head_offices[0][item]
                          )}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DetailsTable;
