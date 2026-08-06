import { ApiError } from "@/api/client";

export type ApiErrorParts = {
  status?: number;
  code?: string;
  message: string;
  details: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Parse ErrorResponse / flat message shapes from the API. */
export function getApiErrorParts(err: unknown): ApiErrorParts {
  if (err instanceof ApiError) {
    const fromData = parseErrorPayload(err.data);
    return {
      status: err.status,
      code: fromData.code,
      message: fromData.message || err.message || "",
      details: fromData.details,
    };
  }
  if (err instanceof Error) {
    return { message: err.message, details: [] };
  }
  return { message: "", details: [] };
}

function parseErrorPayload(data: unknown): {
  code?: string;
  message: string;
  details: string[];
} {
  if (!isRecord(data)) return { message: "", details: [] };

  const body = isRecord(data.error) ? data.error : data;
  const code = body.code != null ? String(body.code) : undefined;
  const message = body.message != null ? String(body.message) : "";

  const details: string[] = [];
  if (isRecord(body.details)) {
    for (const [field, value] of Object.entries(body.details)) {
      if (value == null || value === "") continue;
      details.push(`${field}: ${String(value)}`);
    }
  } else if (Array.isArray(body.errors)) {
    for (const item of body.errors) {
      if (typeof item === "string") details.push(item);
      else if (isRecord(item) && item.message != null) details.push(String(item.message));
    }
  } else if (isRecord(body.errors)) {
    for (const [field, value] of Object.entries(body.errors)) {
      if (Array.isArray(value)) details.push(`${field}: ${value.map(String).join(", ")}`);
      else if (value != null) details.push(`${field}: ${String(value)}`);
    }
  }

  return { code, message, details };
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

const KNOWN_MESSAGE_KEYS: Array<{ match: RegExp; key: string }> = [
  { match: /already exists|duplicate|unique/i, key: "duplicate" },
  { match: /validation failed|request validation/i, key: "validation" },
  { match: /not found/i, key: "notFound" },
  { match: /unauthorized|unauthenticated|invalid token/i, key: "unauthorized" },
  { match: /forbidden|permission|access denied/i, key: "forbidden" },
  { match: /slug/i, key: "invalidSlug" },
  { match: /name.*required|required.*name/i, key: "nameRequired" },
  { match: /network|timeout|ECONNABORTED|Failed to fetch/i, key: "network" },
];

/**
 * Build a localized toast title + optional description for an API error.
 * `t` should resolve keys under `common.apiErrors.*`.
 */
export function describeApiError(
  err: unknown,
  t: Translate,
  fallbackKey = "unexpected",
): { title: string; description?: string } {
  const parts = getApiErrorParts(err);

  const byCode = parts.code
    ? safeT(t, `codes.${parts.code}`) || safeT(t, `codes.${parts.code.toUpperCase()}`)
    : undefined;

  const byStatus =
    parts.status === 400 || parts.status === 422
      ? t("validation")
      : parts.status === 401
        ? t("unauthorized")
        : parts.status === 403
          ? t("forbidden")
          : parts.status === 404
            ? t("notFound")
            : parts.status === 409
              ? t("duplicate")
              : parts.status && parts.status >= 500
                ? t("server")
                : undefined;

  const byMessage = translateKnownMessage(parts.message, t);

  const title = byCode || byMessage || byStatus || t(fallbackKey);

  const detailLines = [
    ...parts.details,
    // Include raw message only when it adds info beyond the title
    parts.message &&
    parts.message !== title &&
    !byMessage &&
    !/^an unexpected error occurred$/i.test(parts.message)
      ? parts.message
      : null,
  ].filter((line): line is string => Boolean(line));

  const uniqueDetails = [...new Set(detailLines)].filter((line) => line !== title);

  return {
    title,
    description: uniqueDetails.length > 0 ? uniqueDetails.join(" · ") : undefined,
  };
}

function translateKnownMessage(message: string, t: Translate): string | undefined {
  if (!message) return undefined;
  for (const { match, key } of KNOWN_MESSAGE_KEYS) {
    if (match.test(message)) return t(key);
  }
  return undefined;
}

function safeT(t: Translate, key: string): string | undefined {
  try {
    const value = t(key);
    // next-intl returns the key path when missing in some setups
    if (!value || value === key || value.endsWith(`.${key}`)) return undefined;
    return value;
  } catch {
    return undefined;
  }
}

/** Convenience: single string for places that only accept one message. */
export function formatApiErrorMessage(
  err: unknown,
  t: Translate,
  fallbackKey = "unexpected",
): string {
  const { title, description } = describeApiError(err, t, fallbackKey);
  return description ? `${title}: ${description}` : title;
}
