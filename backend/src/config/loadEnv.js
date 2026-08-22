import path from "node:path";
import { config as loadDotenv } from "dotenv";

export function loadEnv() {
  const envFile = process.env.ENV_FILE;
  const baseDirectory = process.env.INIT_CWD || process.cwd();

  if (envFile) {
    loadDotenv({ path: path.resolve(baseDirectory, envFile), override: false });
    return;
  }

  loadDotenv();
}
