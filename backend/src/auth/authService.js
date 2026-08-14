import { timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'

const TOKEN_DURATION = '12h'

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export class AuthService {
  constructor({ adminEmail, adminPassword, jwtSecret }) {
    this.adminEmail = String(adminEmail || '').trim().toLowerCase()
    this.adminPassword = String(adminPassword || '')
    this.jwtSecret = String(jwtSecret || '')

    if (!this.adminEmail || this.adminPassword.length < 12 || this.jwtSecret.length < 32) {
      throw new Error('Thiếu ADMIN_EMAIL, ADMIN_PASSWORD hoặc JWT_SECRET hợp lệ.')
    }
  }

  login(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const validCredentials = safeEqual(normalizedEmail, this.adminEmail)
      && safeEqual(String(password || ''), this.adminPassword)

    if (!validCredentials) throw new AppError('Email hoặc mật khẩu không đúng.', 401)

    const user = { email: this.adminEmail, role: 'ADMIN' }
    const token = jwt.sign(user, this.jwtSecret, {
      subject: this.adminEmail,
      issuer: 'bong-a-paris',
      expiresIn: TOKEN_DURATION
    })
    return { token, user }
  }

  verify(token) {
    try {
      const payload = jwt.verify(token, this.jwtSecret, { issuer: 'bong-a-paris' })
      return { email: payload.email, role: payload.role }
    } catch {
      throw new AppError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.', 401)
    }
  }
}
