import fs from "fs";
import path from "path";
import { AppConfig } from "./schema";

const CONFIG_PATH =
  process.env.APP_CONFIG_PATH ||
  path.resolve(process.cwd(), "config/runtime-config.json");

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found at ${CONFIG_PATH}`);
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as AppConfig;

  if (!parsed.backend) {
    throw new Error("Invalid config: backend not defined");
  }

  cachedConfig = parsed;
  return parsed;
}
