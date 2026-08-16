import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'

export function createProductRoutes(controller) {
  const router = Router()
  router.get('/categories', asyncHandler(controller.listCategories))
  router.get('/', asyncHandler(controller.list))
  router.get('/:id', asyncHandler(controller.detail))
  router.post('/', asyncHandler(controller.create))
  router.put('/:id', asyncHandler(controller.update))
  router.delete('/:id', asyncHandler(controller.remove))
  return router
}
