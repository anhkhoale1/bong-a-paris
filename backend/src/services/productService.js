import { randomUUID } from "node:crypto";
import { AppError, validationError } from "../utils/AppError.js";
import { matchesSearchText, normalizeSearchText } from "../utils/searchText.js";

function validateProduct(input) {
  const payload = input && typeof input === "object" ? input : {};
  const errors = [];
  if (!String(payload.productCategoryName || "").trim()) {
    errors.push({
      field: "productCategoryName",
      message: "Phân loại mặt hàng không được để trống",
    });
  }
  if (!String(payload.name || "").trim()) {
    errors.push({ field: "name", message: "Tên sản phẩm không được để trống" });
  }

  for (const field of ["defaultPurchasePrice", "defaultSalePrice"]) {
    const value = Number(payload[field]);
    if (!Number.isFinite(value) || value < 0) {
      errors.push({ field, message: "Giá phải là số lớn hơn hoặc bằng 0" });
    }
  }
  return errors;
}

function normalizeProduct(input, current = {}, category = null) {
  const payload = input && typeof input === "object" ? input : {};
  const now = new Date().toISOString();
  return {
    id: current.id || `PRD-${randomUUID().slice(0, 8).toUpperCase()}`,
    productCategoryId: category?.id || null,
    productCategoryName: category?.name || "",
    name: String(payload.name).trim(),
    description: String(payload.description || "").trim(),
    defaultPurchasePrice: Number(payload.defaultPurchasePrice),
    defaultSalePrice: Number(payload.defaultSalePrice),
    purchaseLocation: String(payload.purchaseLocation || "").trim(),
    createdAt: current.createdAt || now,
    updatedAt: now,
  };
}

function mapDerivedCategories(products) {
  const categories = [];
  const seenNames = new Set();

  for (const product of products) {
    const name = String(product.productCategoryName || "").trim();
    if (!name) continue;
    const key = normalizeSearchText(name);
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    categories.push({
      id: String(product.productCategoryId || `CATEGORY:${key}`),
      name,
    });
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async list({
    search = "",
    purchaseLocation = "",
    productCategoryName = "",
  } = {}) {
    const normalizedCategory = normalizeSearchText(productCategoryName);
    const products = await this.productRepository.findAll();

    return products
      .filter((product) => matchesSearchText(product.name, search))
      .filter((product) =>
        matchesSearchText(product.purchaseLocation, purchaseLocation),
      )
      .filter(
        (product) =>
          !normalizedCategory ||
          normalizeSearchText(product.productCategoryName).includes(
            normalizedCategory,
          ),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async listCategories() {
    if (typeof this.productRepository.listCategories === "function") {
      return this.productRepository.listCategories();
    }

    const products = await this.productRepository.findAll();
    return mapDerivedCategories(products);
  }

  async resolveCategory(payload, current = {}) {
    const categoryName = String(
      payload.productCategoryName || current.productCategoryName || "",
    ).trim();
    if (!categoryName) return null;

    if (typeof this.productRepository.upsertCategoryByName === "function") {
      return this.productRepository.upsertCategoryByName(categoryName);
    }

    const products = await this.productRepository.findAll();
    const existing = products.find(
      (product) =>
        normalizeSearchText(product.productCategoryName) ===
        normalizeSearchText(categoryName),
    );
    return {
      id:
        existing?.productCategoryId ||
        current.productCategoryId ||
        `CAT-${randomUUID().slice(0, 8).toUpperCase()}`,
      name: existing?.productCategoryName || categoryName,
    };
  }

  async getById(id) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError("Không tìm thấy sản phẩm.", 404);
    return product;
  }

  async create(payload) {
    const errors = validateProduct(payload);
    if (errors.length) throw validationError(errors);
    const category = await this.resolveCategory(payload);
    return this.productRepository.create(
      normalizeProduct(payload, {}, category),
    );
  }

  async update(id, payload) {
    const current = await this.getById(id);
    const errors = validateProduct(payload);
    if (errors.length) throw validationError(errors);
    const category = await this.resolveCategory(payload, current);
    return this.productRepository.update(
      id,
      normalizeProduct(payload, current, category),
    );
  }

  async delete(id) {
    await this.getById(id);
    await this.productRepository.delete(id);
  }
}
