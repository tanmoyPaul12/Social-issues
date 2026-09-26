/**
 * Utility to extract a clean, human-readable error message from backend API error payloads.
 */
export function extractApiErrorMessage(errData: unknown, defaultMsg: string): string {
  if (!errData) return defaultMsg;
  if (typeof errData === "string") return errData;

  if (typeof errData === "object" && errData !== null) {
    const record = errData as Record<string, unknown>;

    if (typeof record.error === "string") return record.error;
    if (typeof record.message === "string") return record.message;

    if (typeof record.error === "object" && record.error !== null) {
      const nested = record.error as Record<string, unknown>;
      if (typeof nested.message === "string") return nested.message;
    }

    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const first = record.errors[0];
      if (typeof first === "string") return first;
      if (typeof first === "object" && first !== null) {
        const errObj = first as Record<string, unknown>;
        if (typeof errObj.message === "string") return errObj.message;
        if (typeof errObj.defaultMessage === "string") return errObj.defaultMessage;
      }
    }
  }

  return defaultMsg;
}
