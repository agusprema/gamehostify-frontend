/**
 * Lightweight logging utility for browser + Next.js environments.
 * - Uses console in development
 * - Restricts noise in production
 * - Can be extended to send logs to a backend or a service
 */
type Level = "debug" | "info" | "warn" | "error" | "silent";

const env = typeof process !== "undefined" ? process.env.NODE_ENV : "development";

let currentLevel: Level = env === "production" ? "warn" : "debug";

const order: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

function shouldLog(level: Level) {
  return order[level] >= order[currentLevel];
}

function formatMsg(level: Level, args: unknown[]) {
  const time = new Date().toISOString();
  return [
    `[${time}] [${level.toUpperCase()}]`,
    ...args,
  ];
}

export const logger = {
  setLevel(level: Level) {
    currentLevel = level;
  },
  getLevel(): Level {
    return currentLevel;
  },
  debug: (...args: unknown[]) => {
    if (!shouldLog("debug")) return;
    console.debug(...formatMsg("debug", args));
  },
  info: (...args: unknown[]) => {
    if (!shouldLog("info")) return;
    console.info(...formatMsg("info", args));
  },
  warn: (...args: unknown[]) => {
    if (!shouldLog("warn")) return;
    console.warn(...formatMsg("warn", args));
  },
  error: (...args: unknown[]) => {
    if (!shouldLog("error")) return;
    console.error(...formatMsg("error", args));
  },
};

export default logger;

