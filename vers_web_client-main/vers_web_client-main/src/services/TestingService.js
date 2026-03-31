import ApiService from "./ApiService";

export async function apiTestUserVehicleSearch(data) {
  return ApiService.fetchData({
    url: "/v1/vehicle/user/pagination",
    method: "post",
    data,
  });
}

export async function apiTestUserVehicleDetails(data) {
  return ApiService.fetchData({
    url: "/v1/vehicle/user/details/id",
    method: "post",
    data,
  });
}

export async function apiTestAdminVehicleSearch(data) {
  return ApiService.fetchData({
    url: "/v1/vehicle/admin/pagination",
    method: "post",
    data,
  });
}
