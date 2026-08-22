export function createProductController(productService) {
  return {
    listCategories: async (_req, res) => {
      const categories = await productService.listCategories();
      res.json({
        success: true,
        message: "Lấy danh sách phân loại thành công",
        data: categories,
      });
    },
    list: async (req, res) => {
      const products = await productService.list(req.query);
      res.json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: products,
      });
    },
    detail: async (req, res) => {
      const product = await productService.getById(req.params.id);
      res.json({
        success: true,
        message: "Lấy sản phẩm thành công",
        data: product,
      });
    },
    create: async (req, res) => {
      const product = await productService.create(req.body);
      res
        .status(201)
        .json({
          success: true,
          message: "Tạo sản phẩm thành công",
          data: product,
        });
    },
    update: async (req, res) => {
      const product = await productService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: product,
      });
    },
    remove: async (req, res) => {
      await productService.delete(req.params.id);
      res.json({
        success: true,
        message: "Xóa sản phẩm thành công",
        data: null,
      });
    },
  };
}
