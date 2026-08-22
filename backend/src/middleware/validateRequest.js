import { validationError } from "../utils/AppError.js";

export function validateRequest(validator) {
  return (req, _res, next) => {
    const errors = validator(req.body || {});
    if (errors.length) return next(validationError(errors));
    next();
  };
}
