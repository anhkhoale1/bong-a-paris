import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export class JsonFileStore {
  constructor(filePath, seedData = []) {
    this.filePath = filePath;
    this.seedData = structuredClone(seedData);
    this.queue = Promise.resolve();
    this.initialization = null;
  }

  async ensureFile() {
    if (!this.initialization) this.initialization = this.initializeFile();
    return this.initialization;
  }

  async initializeFile() {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await readFile(this.filePath, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await this.writeFile(this.seedData);
    }
  }

  async readFile() {
    await this.ensureFile();
    const content = await readFile(this.filePath, "utf8");
    const data = JSON.parse(content);
    if (!Array.isArray(data))
      throw new Error(`Dữ liệu trong ${this.filePath} không hợp lệ.`);
    return data;
  }

  async writeFile(data) {
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(
      temporaryPath,
      `${JSON.stringify(data, null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryPath, this.filePath);
  }

  async read() {
    await this.queue;
    return structuredClone(await this.readFile());
  }

  async mutate(mutator) {
    const operation = this.queue.then(async () => {
      const current = await this.readFile();
      const result = await mutator(current);
      await this.writeFile(current);
      return structuredClone(result);
    });

    this.queue = operation.catch(() => {});
    return operation;
  }
}
