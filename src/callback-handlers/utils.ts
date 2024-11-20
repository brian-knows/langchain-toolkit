import { Run } from "@langchain/core/tracers/base";

/**
 * @dev tries to json stringify an object, if it fails, it returns the fallback string.
 * @param {unknown} obj - the object to stringify.
 * @param {string} fallback - the fallback string in case it fails.
 * @returns {string} - the stringified object or the fallback string.
 */
export const tryJsonStringify = (obj: unknown, fallback: string): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return fallback;
  }
};

/**
 * @dev returns the elapsed time of a run.
 * @param {Run} run - current LLM run object.
 * @returns {string} elapsed time in ms or s.
 */
export const elapsed = (run: Run): string => {
  if (!run.end_time) return "";
  const elapsed = run.end_time - run.start_time;
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  }
  return `${(elapsed / 1000).toFixed(2)}s`;
};

/**
 * @dev formats a key-value map item.
 * @param {unknown} value - value to be formatted.
 * @returns {string | undefined | null} - formatted value.
 */
export const formatKVMapItem = (value: unknown): string | undefined | null => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return value;
  }

  return tryJsonStringify(value, value.toString());
};
