import ApiService from "./ApiService";

// Device Request Services
// ******************************************
export async function apiGetAllDeviceRequest() {
  return ApiService.fetchData({
    url: "/v1/user/device/id/get",
    method: "get",
  });
}
export async function apiUpdateDeviceRequest(data) {
  return ApiService.fetchData({
    url: "/v1/user/device/id/update",
    method: "put",
    data,
  });
}
