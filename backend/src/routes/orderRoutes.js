import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createOrderRoutes(controller) {
  const router = Router();
  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.detail));
  router.post("/", asyncHandler(controller.create));
  router.put("/:id", asyncHandler(controller.update));
  router.patch(
    "/:id/status",
    validateRequest((body) =>
      body.status === undefined
        ? [
            {
              field: "status",
              message: "Trạng thái đơn hàng không được để trống",
            },
          ]
        : [],
    ),
    asyncHandler(controller.updateStatus),
  );
  router.delete("/:id", asyncHandler(controller.remove));
  return router;
}
