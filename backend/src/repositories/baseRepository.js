import { JsonFileStore } from "../utils/jsonFileStore.js";

export class BaseRepository {
  constructor(filePath, seedData) {
    this.store = new JsonFileStore(filePath, seedData);
  }

  findAll() {
    return this.store.read();
  }

  async findById(id) {
    const records = await this.store.read();
    return records.find((record) => record.id === id) || null;
  }

  create(record) {
    return this.store.mutate((records) => {
      records.push(record);
      return record;
    });
  }

  update(id, record) {
    return this.store.mutate((records) => {
      const index = records.findIndex((entry) => entry.id === id);
      if (index === -1) return null;
      records[index] = record;
      return record;
    });
  }

  delete(id) {
    return this.store.mutate((records) => {
      const index = records.findIndex((entry) => entry.id === id);
      if (index === -1) return false;
      records.splice(index, 1);
      return true;
    });
  }
}
