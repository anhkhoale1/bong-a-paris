export function createDashboardController(orderService, productService) {
  return {
    summary: async (_req, res) => {
      const totalProducts = (await productService.list()).length
      const summary = await orderService.dashboardSummary(totalProducts)
      res.json({ success: true, message: 'Lấy thống kê thành công', data: summary })
    }
  }
}
