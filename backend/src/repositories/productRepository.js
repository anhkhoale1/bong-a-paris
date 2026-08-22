import path from "node:path";
import { fileURLToPath } from "node:url";
import { BaseRepository } from "./baseRepository.js";

const defaultDataDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data",
);

export class ProductRepository extends BaseRepository {
  constructor(dataDirectory = defaultDataDirectory, seedData = []) {
    super(path.join(dataDirectory, "products.json"), seedData || []);
  }
}
