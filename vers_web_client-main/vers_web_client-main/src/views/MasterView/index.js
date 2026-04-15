import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";
import { apiAllBranch, apiAllHeadOffice } from "../../services/OfficeServices";
import { apiAllFileInfo } from "../../services/FileInfoService";

const normalizeText = (value = "") =>
  value
    ?.toString()
    ?.toLowerCase()
    ?.replace(/[^a-z0-9]/g, "");

const notify = (type = "error", message = "") => toast[type](message);

const MasterView = () => {
  const [loading, setLoading] = useState(false);
  const [headOffices, setHeadOffices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [fileInfo, setFileInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const [headOfficeRes, branchRes, fileInfoRes] = await Promise.all([
        apiAllHeadOffice({}),
        apiAllBranch({}),
        apiAllFileInfo({}),
      ]);

      setHeadOffices(headOfficeRes?.data?.data || []);
      setBranches(branchRes?.data?.data || []);
      setFileInfo(fileInfoRes?.data?.data || []);
      setLastRefreshedAt(new Date());
    } catch (error) {
      notify("error", "Unable to load master overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const branchByHeadOffice = useMemo(() => {
    return headOffices.map((headOffice) => {
      const relatedBranches = branches.filter(
        (branch) => branch.head_office_id?.toString() === headOffice._id
      );
      const totalRecords = relatedBranches.reduce(
        (sum, branch) => sum + Number(branch?.records || 0),
        0
      );
      const lastUpdatedAt = relatedBranches
        .map((branch) => new Date(branch.updatedAt).getTime())
        .filter(Boolean)
        .sort((a, b) => b - a)?.[0];

      return {
        ...headOffice,
        branchCount: relatedBranches.length,
        totalRecords,
        lastUpdatedAt: lastUpdatedAt ? new Date(lastUpdatedAt) : null,
      };
    });
  }, [headOffices, branches]);

  const branchLookupByName = useMemo(() => {
    return branches.map((branch) => ({
      branch,
      normalized: normalizeText(branch?.name),
    }));
  }, [branches]);

  const fileRows = useMemo(() => {
    return fileInfo.map((file) => {
      const normalizedFileName = normalizeText(file?.file_name);

      const matches = branchLookupByName.filter((candidate) => {
        if (!candidate.normalized || !normalizedFileName) return false;
        return normalizedFileName.includes(candidate.normalized);
      });

      const matchedBranch = matches.length === 1 ? matches[0].branch : null;

      return {
        ...file,
        relatedBranchName: matchedBranch?.name || "NOT DETECTED",
        relatedBranchRecords: matchedBranch?.records || 0,
        relatedHeadOfficeId: matchedBranch?.head_office_id || null,
      };
    });
  }, [fileInfo, branchLookupByName]);

  const totalBranchRecords = useMemo(() => {
    return branches.reduce((sum, branch) => sum + Number(branch?.records || 0), 0);
  }, [branches]);

  const filteredBranchRows = useMemo(() => {
    if (!searchQuery.trim()) return branches;
    const q = searchQuery.toLowerCase().trim();
    return branches.filter((branch) => {
      return (
        branch?.name?.toLowerCase().includes(q) ||
        String(branch?.records || 0).includes(q)
      );
    });
  }, [branches, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#d9e5f6] bg-gradient-to-r from-[#f4f8ff] to-[#ffffff] p-4 shadow-[0_14px_28px_rgba(17,34,64,0.1)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#183c69]">Master View All</h1>
            <p className="text-sm text-[#4c6a90]">
              Unified control panel for branches, excel uploads, records and timestamps.
            </p>
            <p className="text-xs text-[#6788b0] mt-1">
              Last refreshed: {lastRefreshedAt ? dayjs(lastRefreshedAt).format("DD/MM/YYYY hh:mm A") : "-"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branches..."
              className="h-10 min-w-[220px] rounded-lg border border-[#c9d8ef] px-3 text-sm outline-none"
            />
            <button
              className="h-10 rounded-lg bg-[#1f6feb] px-4 text-sm font-semibold text-white hover:bg-[#1658bc] flex items-center"
              onClick={fetchMasterData}
            >
              {loading ? <CgSpinner className="animate-spin mr-1" /> : null}
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#d9e5f6] bg-white p-4 shadow-[0_10px_20px_rgba(17,34,64,0.07)]">
          <p className="text-xs uppercase tracking-wide text-[#5b7aa1]">Head Offices</p>
          <p className="text-3xl font-bold text-[#183c69]">{headOffices.length}</p>
        </div>
        <div className="rounded-xl border border-[#d9e5f6] bg-white p-4 shadow-[0_10px_20px_rgba(17,34,64,0.07)]">
          <p className="text-xs uppercase tracking-wide text-[#5b7aa1]">Branches</p>
          <p className="text-3xl font-bold text-[#183c69]">{branches.length}</p>
        </div>
        <div className="rounded-xl border border-[#d9e5f6] bg-white p-4 shadow-[0_10px_20px_rgba(17,34,64,0.07)]">
          <p className="text-xs uppercase tracking-wide text-[#5b7aa1]">Total Vehicle Records</p>
          <p className="text-3xl font-bold text-[#183c69]">{totalBranchRecords}</p>
        </div>
        <div className="rounded-xl border border-[#d9e5f6] bg-white p-4 shadow-[0_10px_20px_rgba(17,34,64,0.07)]">
          <p className="text-xs uppercase tracking-wide text-[#5b7aa1]">Recent Excel Sheets</p>
          <p className="text-3xl font-bold text-[#183c69]">{fileInfo.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#d9e5f6] bg-white p-4 shadow-[0_12px_26px_rgba(17,34,64,0.08)]">
        <h2 className="text-lg font-semibold text-[#1d3f72] mb-3">Head Office Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#eef4ff] text-[#22466f]">
                <th className="border border-[#d2dff2] p-2 text-left">Head Office</th>
                <th className="border border-[#d2dff2] p-2 text-center">Branches</th>
                <th className="border border-[#d2dff2] p-2 text-center">Total Records</th>
                <th className="border border-[#d2dff2] p-2 text-center">Created</th>
                <th className="border border-[#d2dff2] p-2 text-center">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {branchByHeadOffice.length ? (
                branchByHeadOffice.map((row) => (
                  <tr key={row._id} className="odd:bg-white even:bg-[#f8fbff]">
                    <td className="border border-[#d2dff2] p-2 font-semibold text-[#22466f]">{row?.name || "-"}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{row?.branchCount || 0}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{row?.totalRecords || 0}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{row?.createdAt ? dayjs(row.createdAt).format("DD/MM/YYYY hh:mm A") : "-"}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{row?.lastUpdatedAt ? dayjs(row.lastUpdatedAt).format("DD/MM/YYYY hh:mm A") : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-[#d2dff2] p-6 text-center text-[#5a7aa3]">
                    No head office records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#d9e5f6] bg-white p-4 shadow-[0_12px_26px_rgba(17,34,64,0.08)]">
        <h2 className="text-lg font-semibold text-[#1d3f72] mb-3">Branch Records & Timestamps</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#eef4ff] text-[#22466f]">
                <th className="border border-[#d2dff2] p-2 text-left">Branch</th>
                <th className="border border-[#d2dff2] p-2 text-center">Records</th>
                <th className="border border-[#d2dff2] p-2 text-center">Created</th>
                <th className="border border-[#d2dff2] p-2 text-center">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranchRows.length ? (
                filteredBranchRows.map((branch) => (
                  <tr key={branch._id} className="odd:bg-white even:bg-[#f8fbff]">
                    <td className="border border-[#d2dff2] p-2 font-semibold text-[#22466f]">{branch?.name || "-"}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{branch?.records || 0}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{branch?.createdAt ? dayjs(branch.createdAt).format("DD/MM/YYYY hh:mm A") : "-"}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{branch?.updatedAt ? dayjs(branch.updatedAt).format("DD/MM/YYYY hh:mm A") : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="border border-[#d2dff2] p-6 text-center text-[#5a7aa3]">
                    No branches matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#d9e5f6] bg-white p-4 shadow-[0_12px_26px_rgba(17,34,64,0.08)]">
        <h2 className="text-lg font-semibold text-[#1d3f72] mb-3">Excel Sheet Insights</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#eef4ff] text-[#22466f]">
                <th className="border border-[#d2dff2] p-2 text-left">Excel Sheet</th>
                <th className="border border-[#d2dff2] p-2 text-center">Uploaded By</th>
                <th className="border border-[#d2dff2] p-2 text-center">Detected Branch</th>
                <th className="border border-[#d2dff2] p-2 text-center">Branch Records</th>
                <th className="border border-[#d2dff2] p-2 text-center">Created</th>
              </tr>
            </thead>
            <tbody>
              {fileRows.length ? (
                fileRows.map((file) => (
                  <tr key={file._id} className="odd:bg-white even:bg-[#f8fbff]">
                    <td className="border border-[#d2dff2] p-2 font-semibold text-[#22466f]">{file?.file_name || "-"}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{file?.uploaded_by || "-"}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{file?.relatedBranchName || "NOT DETECTED"}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{file?.relatedBranchRecords || 0}</td>
                    <td className="border border-[#d2dff2] p-2 text-center">{file?.createdAt ? dayjs(file.createdAt).format("DD/MM/YYYY hh:mm A") : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-[#d2dff2] p-6 text-center text-[#5a7aa3]">
                    No excel sheet information found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterView;
