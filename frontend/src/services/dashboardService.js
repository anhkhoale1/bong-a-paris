import { apiClient } from './apiClient'

export const dashboardService = {
  summary: () => apiClient('/dashboard/summary')
}
