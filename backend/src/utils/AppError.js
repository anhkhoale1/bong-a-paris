export class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

export function validationError(errors) {
  return new AppError('Dữ liệu không hợp lệ', 400, errors)
}
