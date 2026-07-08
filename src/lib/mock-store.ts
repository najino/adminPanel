import { mockContextSections, mockStoreStyle } from "@/lib/mock-data";

type ContextStore = Record<string, unknown>;

const contextStore: ContextStore = structuredClone(mockContextSections);
let storeStyle = structuredClone(mockStoreStyle);

export function getMockContextSection(section: string) {
  return {
    section,
    data: contextStore[section] ?? {},
  };
}

export function setMockContextSection(section: string, data: unknown) {
  contextStore[section] = data;
  return { section, data };
}

export function getMockStoreStyle() {
  return storeStyle;
}

export function setMockStoreStyle(payload: Record<string, unknown>) {
  storeStyle = { ...storeStyle, ...payload };
  return storeStyle;
}
