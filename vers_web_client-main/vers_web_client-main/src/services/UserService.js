import ApiService from "./ApiService";

export async function apiUpdateUserBranchAccess(data) {
  return ApiService.fetchData({
    url: "/v1/user/branch/access",
    method: "put",
    data,
  });
}
export async function apiAllUsers(data) {
  return ApiService.fetchData({
    url: "/v1/user",
    method: "get",
  });
}

export async function apiUpdateUser(data) {
  return ApiService.fetchData({
    url: "/v1/user/details",
    method: "put",
    data,
  });
}
export async function apiUpdateUserPassword(data) {
  return ApiService.fetchData({
    url: "/v1/user/password",
    method: "put",
    data,
  });
}

export async function apiDeleteUser(user_id) {
  return ApiService.fetchData({
    url: `/v1/user/delete/${user_id}`,
    method: "delete",
  });
}

export async function apiDeleteUserDeviceId(user_id) {
  return ApiService.fetchData({
    url: `/v1/user/device/id/delete/${user_id}`,
    method: "delete",
  });
}

// END POINTS FOR USER PLAN
export async function apiAllUserPlan(data) {
  return ApiService.fetchData({
    url: "/v1/plan/all",
    method: "post",
    data,
  });
}
export async function apiNewUserPlan(data) {
  return ApiService.fetchData({
    url: "/v1/plan/registration",
    method: "post",
    data,
  });
}
