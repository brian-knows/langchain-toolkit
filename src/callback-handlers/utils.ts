import { Run } from "@langchain/core/dist/tracers/base";

export const tryJsonStringify = (obj: unknown, fallback: string) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return fallback;
  }
};

export const elapsed = (run: Run): string => {
  if (!run.end_time) return "";
  const elapsed = run.end_time - run.start_time;
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  }
  return `${(elapsed / 1000).toFixed(2)}s`;
};

export const formatKVMapItem = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return value;
  }

  return tryJsonStringify(value, value.toString());
};
