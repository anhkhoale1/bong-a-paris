import { apiClient, queryString } from "./apiClient";

export const orderService = {
  list: (params) => apiClient(`/orders${queryString(params)}`),
  get: (id) => apiClient(`/orders/${id}`),
  create: (payload) =>
    apiClient("/orders", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    apiClient(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateStatus: (id, status) =>
    apiClient(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  remove: (id) => apiClient(`/orders/${id}`, { method: "DELETE" }),
};
