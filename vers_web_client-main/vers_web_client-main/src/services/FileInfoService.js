import ApiService from "./ApiService";

export async function apiAllFileInfo(data) {
  return ApiService.fetchData({
    url: "/v1/file/info/all",
    method: "get"
  });
}
