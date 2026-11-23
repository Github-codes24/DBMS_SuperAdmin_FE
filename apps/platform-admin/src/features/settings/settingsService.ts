import api from "../../api/axiosClient";

export const getMySettings = async () => {
  const response = await api.get("/settings/me");
  return response.data;
};

export const updateMyProfile = async (data: any) => {
  const response = await api.patch("/settings/me/profile", data);
  return response.data;
};

export const updateMyNotifications = async (data:any) => {
  const response = await api.patch("/settings/me/notifications", data);
  return response.data;
};

export const getPlatformSettings = async () => {
  const response = await api.get("/settings/platform");
  return response.data;
};


export const updatePlatformDefaults = async (data:any) => {
  const response = await api.patch("/settings/platform/defaults", data);
  return response.data;
};


export const getSecuritySettings = async () => {
  const response = await api.get("/settings/platform/security");
  return response.data;
};

export const updateSecuritySettings = async (data: any) => {
  const response = await api.patch("/settings/platform/security", data);
  return response.data;
};

export const updateGeneralSettings = async (data: any) => {
  const response = await api.patch("/settings/platform/general", data);
  return response.data;
};

export const updateMaintenanceMode = async (data: any) => {
  const response = await api.patch("/settings/platform/maintenance", data);
  return response.data;
};

export const updateMyPreferences = async (data: any) => {
  const response = await api.patch("/settings/me/preferences", data);
  return response.data;
};