/** When true, all data comes from in-memory mock fixtures (no API calls). */
export const IS_MOCK_MODE =
  process.env.NEXT_PUBLIC_USE_MOCK === undefined ||
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
  process.env.NEXT_PUBLIC_USE_MOCK === "1";
