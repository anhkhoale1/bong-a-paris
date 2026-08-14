import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { AuthService } from './auth/authService.js'
import { createAuthController } from './controllers/authController.js'
import { createDashboardController } from './controllers/dashboardController.js'
import { createOrderController } from './controllers/orderController.js'
import { createProductController } from './controllers/productController.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { createAuthenticate } from './middleware/authenticate.js'
import { OrderRepository } from './repositories/orderRepository.js'
import { PostgresOrderRepository } from './repositories/postgres/orderRepository.js'
import { PostgresProductRepository } from './repositories/postgres/productRepository.js'
import { ProductRepository } from './repositories/productRepository.js'
import { createAuthRoutes } from './routes/authRoutes.js'
import { createDashboardRoutes } from './routes/dashboardRoutes.js'
import { createOrderRoutes } from './routes/orderRoutes.js'
import { createProductRoutes } from './routes/productRoutes.js'
import { OrderService } from './services/orderService.js'
import { ProductService } from './services/productService.js'

export function createApp({ pool, dataDirectory, seedData, authConfig } = {}) {
  const productRepository = pool
    ? new PostgresProductRepository(pool)
    : new ProductRepository(dataDirectory, seedData?.products)
  const orderRepository = pool
    ? new PostgresOrderRepository(pool)
    : new OrderRepository(dataDirectory, seedData?.orders)
  const productService = new ProductService(productRepository)
  const orderService = new OrderService(orderRepository, productRepository)
  const authService = new AuthService(authConfig || {
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    jwtSecret: process.env.JWT_SECRET
  })
  const authenticate = createAuthenticate(authService)
  const app = express()

  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Backend đang hoạt động', data: { status: 'ok' } })
  })
  app.use('/api/auth', createAuthRoutes(createAuthController(authService), authenticate))
  app.use('/api', authenticate)
  app.use('/api/products', createProductRoutes(createProductController(productService)))
  app.use('/api/orders', createOrderRoutes(createOrderController(orderService)))
  app.use('/api/dashboard', createDashboardRoutes(createDashboardController(orderService, productService)))
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
