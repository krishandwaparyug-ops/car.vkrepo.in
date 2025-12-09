import ApiService from "./ApiService";

export async function apiGetVehiclesWithPagination(data) {
  return ApiService.fetchData({
    url: "/v1/vehicle/admin/pagination",
    method: "post",
    data,
  });
}

export async function apiGetVehicleDetailsAndDuplicate(data) {
  return ApiService.fetchData({
    url: "/v1/vehicle/admin/details/duplicate",
    method: "post",
    data,
  });
}
export async function apiDeleteVehicleById(data) {
  return ApiService.fetchData({
    url: "/v1/vehicle/admin/records/delete",
    method: "delete",
    data,
  });
}

export async function apiGetVehicleCount(data) {
  return ApiService.fetchData({
    url: "/v1/vehicle/count",
    method: "get",
    data,
  });
}
export async function apiGetHeader(data) {
  return ApiService.fetchData({
    url: "/v1/header",
    method: "get",
    data,
  });
}
export async function apiUpdateHeader(data) {
  return ApiService.fetchData({
    url: "/v1/header/update",
    method: "put",
    data,
  });
}
