import { AppError } from '../utils/AppError.js'

export function notFoundHandler(req, _res, next) {
  next(new AppError(`Không tìm thấy API ${req.method} ${req.originalUrl}.`, 404))
}

export function errorHandler(error, _req, res, _next) {
  if (!(error instanceof AppError)) console.error(error)

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON gửi lên không hợp lệ',
      errors: []
    })
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error instanceof AppError ? error.message : 'Lỗi máy chủ.',
    errors: error.errors || []
  })
}
