import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createDashboardRoutes(controller) {
  const router = Router();
  router.get("/summary", asyncHandler(controller.summary));
  return router;
}
