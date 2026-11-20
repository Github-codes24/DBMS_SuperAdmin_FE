import api from "../../api/axiosClient";

export const getPlatformSettings = async () => {
  const response = await api.get("/settings/me");
  return response.data;
};

export const getSecuritySettings = async () => {
  const response = await api.get("/settings/me");
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