export function createAuthController(authService) {
  return {
    login: (req, res) => {
      const result = authService.login(req.body.email, req.body.password);
      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: result,
      });
    },
    me: (req, res) => {
      res.json({
        success: true,
        message: "Lấy tài khoản thành công",
        data: req.user,
      });
    },
  };
}
