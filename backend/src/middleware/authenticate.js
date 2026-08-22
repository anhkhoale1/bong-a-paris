import { AppError } from "../utils/AppError.js";

export function createAuthenticate(authService) {
  return (req, _res, next) => {
    const [scheme, token] = String(req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(new AppError("Bạn cần đăng nhập để tiếp tục.", 401));
    }

    try {
      req.user = authService.verify(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}
