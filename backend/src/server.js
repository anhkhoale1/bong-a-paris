import { loadEnv } from "./config/loadEnv.js";
import { createApp } from "./app.js";
import { createDatabasePool } from "./database/client.js";
import { migrateDatabase } from "./database/migrate.js";

loadEnv();

const PORT = Number(process.env.PORT || 3000);
const pool = createDatabasePool();

async function start() {
  await migrateDatabase(pool);
  const app = createApp({ pool });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend đang chạy trên port ${PORT}`);
  });
}

start().catch(async (error) => {
  console.error("Không thể khởi động backend:", error);
  await pool.end().catch(() => {});
  process.exitCode = 1;
});
