import ApiService from "./ApiService";

// Head Office Services
// ******************************************
export async function apiNewHeadOffice(data) {
  return ApiService.fetchData({
    url: "/v1/head-office/registration",
    method: "post",
    data,
  });
}
export async function apiAllHeadOffice(data) {
  return ApiService.fetchData({
    url: "/v1/head-office/all",
    method: "post",
    data,
  });
}

export async function apiUpdateHeadOffice(data) {
  return ApiService.fetchData({
    url: "/v1/head-office/update",
    method: "put",
    data,
  });
}
export async function apiDeleteHeadOffice(data) {
  return ApiService.fetchData({
    url: "/v1/head-office/delete",
    method: "delete",
    data,
  });
}
// ******************************************

// Branch Services
// ******************************************
export async function apiNewBranch(data) {
  return ApiService.fetchData({
    url: "/v1/branch/registration",
    method: "post",
    data,
  });
}
export async function apiAllBranch(data) {
  return ApiService.fetchData({
    url: "/v1/branch/all",
    method: "post",
    data,
  });
}

export async function apiUpdateBranch(data) {
  return ApiService.fetchData({
    url: "/v1/branch/update",
    method: "put",
    data,
  });
}
export async function apiDeleteBranch(data) {
  return ApiService.fetchData({
    url: "/v1/branch/delete",
    method: "delete",
    data,
  });
}
export async function apiDeleteBranchRecords(data) {
  return ApiService.fetchData({
    url: "/v1/branch/delete/records",
    method: "delete",
    data,
  });
}
// ******************************************
