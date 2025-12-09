import ApiService from "./ApiService";

// OTPs Services
// ******************************************
export async function apiGetAllOTPs(data) {
  return ApiService.fetchData({
    url: "/v1/otp",
    data,
  });
}
export async function apiNewOTPGenerate(data) {
  return ApiService.fetchData({
    url: "/v1/otp/generate",
    method: 'post',
    data,
  });
}