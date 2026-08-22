export function createOrderController(orderService) {
  return {
    list: async (req, res) => {
      const orders = await orderService.list(req.query);
      res.json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công",
        data: orders,
      });
    },
    detail: async (req, res) => {
      const order = await orderService.getById(req.params.id);
      res.json({
        success: true,
        message: "Lấy đơn hàng thành công",
        data: order,
      });
    },
    create: async (req, res) => {
      const order = await orderService.create(req.body);
      res
        .status(201)
        .json({
          success: true,
          message: "Tạo đơn hàng thành công",
          data: order,
        });
    },
    update: async (req, res) => {
      const order = await orderService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: "Cập nhật đơn hàng thành công",
        data: order,
      });
    },
    updateStatus: async (req, res) => {
      const order = await orderService.updateStatus(
        req.params.id,
        req.body.status,
      );
      res.json({
        success: true,
        message: "Cập nhật trạng thái thành công",
        data: order,
      });
    },
    remove: async (req, res) => {
      await orderService.delete(req.params.id);
      res.json({
        success: true,
        message: "Xóa đơn hàng thành công",
        data: null,
      });
    },
  };
}
