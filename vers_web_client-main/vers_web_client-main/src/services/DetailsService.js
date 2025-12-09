import ApiService from "./ApiService";

export async function apiAllDetails(data) {
  return ApiService.fetchData({
    url: "/v1/details/all",
    method: "post",
    data,
  });
}

export async function apiAllLastLocations(data) {
  return ApiService.fetchData({
    url: "/v1/details/last/location",
    method: "post",
    data,
  });
}
