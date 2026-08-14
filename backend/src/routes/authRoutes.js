import { rateLimit } from 'express-rate-limit'
import { Router } from 'express'
import { validateRequest } from '../middleware/validateRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const validateLogin = validateRequest(body => {
  const errors = []
  if (!String(body.email || '').trim()) errors.push({ field: 'email', message: 'Email không được để trống' })
  if (!String(body.password || '')) errors.push({ field: 'password', message: 'Mật khẩu không được để trống' })
  return errors
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.', errors: [] }
})

export function createAuthRoutes(controller, authenticate) {
  const router = Router()
  router.post('/login', loginLimiter, validateLogin, asyncHandler(controller.login))
  router.get('/me', authenticate, asyncHandler(controller.me))
  return router
}

