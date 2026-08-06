import { apiClient } from "@/api/client";
import { IS_MOCK_MODE } from "@/config/mock";
import type {
  AdminProject,
  AdminProjectCategory,
  CreateProjectCategoryPayload,
  CreateProjectPayload,
  UpdateProjectCategoryPayload,
  UpdateProjectPayload,
} from "@/types/api/projects";

const USE_MOCK = IS_MOCK_MODE;
const ADMIN = "/admin";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function unwrapRecord(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const obj = payload as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    return obj.data as Record<string, unknown>;
  }
  return obj;
}

function unwrapList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
  return [];
}

export function toProjectSlug(text: string): string {
  const slug = text
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 255);
  return slug || `project-${Date.now()}`;
}

function mapCategory(item: Record<string, unknown>): AdminProjectCategory {
  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? item.name ?? ""),
    slug: String(item.slug ?? ""),
    created_at: item.created_at ? String(item.created_at) : undefined,
  };
}

function mapProject(item: Record<string, unknown>): AdminProject {
  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    slug: String(item.slug ?? ""),
    description: item.description ? String(item.description) : undefined,
    employer: item.employer ? String(item.employer) : undefined,
    location: item.location ? String(item.location) : undefined,
    footage:
      item.footage === null || item.footage === undefined
        ? undefined
        : Number(item.footage),
    implementation_year:
      item.implementation_year === null || item.implementation_year === undefined
        ? undefined
        : Number(item.implementation_year),
    image: item.image ? String(item.image) : undefined,
    category_id: item.category_id ? String(item.category_id) : undefined,
    category_title: item.category_title ? String(item.category_title) : undefined,
    created_at: item.created_at ? String(item.created_at) : undefined,
    updated_at: item.updated_at ? String(item.updated_at) : undefined,
  };
}

let mockCategories: AdminProjectCategory[] = [
  {
    id: "pcat-1",
    title: "مسکونی",
    slug: "residential",
    created_at: new Date().toISOString(),
  },
  {
    id: "pcat-2",
    title: "تجاری",
    slug: "commercial",
    created_at: new Date().toISOString(),
  },
];

let mockProjects: AdminProject[] = [
  {
    id: "proj-1",
    title: "پروژه نمونه برج آسمان",
    slug: "aseman-tower",
    description: "اجرای کامل نما و کف‌سازی",
    employer: "شرکت ساختمانی آسمان",
    location: "تهران",
    footage: 12000,
    implementation_year: 1403,
    category_id: "pcat-1",
    category_title: "مسکونی",
    created_at: new Date().toISOString(),
  },
];

/** GET /admin/projects */
export async function getAdminProjects(params?: {
  q?: string;
  category_id?: string;
}): Promise<AdminProject[]> {
  if (USE_MOCK) {
    await delay();
    let rows = [...mockProjects];
    if (params?.category_id) {
      rows = rows.filter((p) => p.category_id === params.category_id);
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.employer ?? "").toLowerCase().includes(q) ||
          (p.location ?? "").toLowerCase().includes(q),
      );
    }
    return rows;
  }

  const query: Record<string, unknown> = { page: 1, per_page: 100 };
  if (params?.q) query.q = params.q;
  if (params?.category_id) query.category_id = params.category_id;

  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/projects`, {
    params: query,
  });
  return unwrapList(data).map(mapProject);
}

/** GET /admin/projects/{id} */
export async function getAdminProject(id: string): Promise<AdminProject> {
  if (USE_MOCK) {
    await delay();
    const found = mockProjects.find((p) => p.id === id);
    if (!found) throw new Error("Project not found");
    return found;
  }
  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/projects/${id}`);
  const raw = unwrapRecord(data);
  if (!raw.id) throw new Error("Project not found");
  return mapProject(raw);
}

/** POST /admin/projects */
export async function createAdminProject(
  payload: CreateProjectPayload,
): Promise<AdminProject> {
  if (USE_MOCK) {
    await delay(400);
    const category = mockCategories.find((c) => c.id === payload.category_id);
    const created: AdminProject = {
      id: `proj-${Date.now()}`,
      ...payload,
      category_title: category?.title,
      created_at: new Date().toISOString(),
    };
    mockProjects.unshift(created);
    return created;
  }
  const { data } = await apiClient.post<Record<string, unknown>>(`${ADMIN}/projects`, payload);
  return mapProject(unwrapRecord(data));
}

/** PUT /admin/projects/{id} */
export async function updateAdminProject(
  id: string,
  payload: UpdateProjectPayload,
): Promise<AdminProject> {
  if (USE_MOCK) {
    await delay(400);
    const idx = mockProjects.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Project not found");
    const category = mockCategories.find((c) => c.id === payload.category_id);
    mockProjects[idx] = {
      ...mockProjects[idx],
      ...payload,
      category_title: category?.title ?? mockProjects[idx].category_title,
      updated_at: new Date().toISOString(),
    };
    return mockProjects[idx];
  }
  const { data } = await apiClient.put<Record<string, unknown>>(
    `${ADMIN}/projects/${id}`,
    payload,
  );
  return mapProject(unwrapRecord(data));
}

/** DELETE /admin/projects/{id} */
export async function deleteAdminProject(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    mockProjects = mockProjects.filter((p) => p.id !== id);
    return;
  }
  await apiClient.delete(`${ADMIN}/projects/${id}`);
}

/** GET /admin/projects/categories */
export async function getAdminProjectCategories(): Promise<AdminProjectCategory[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockCategories];
  }
  const { data } = await apiClient.get<unknown>(`${ADMIN}/projects/categories`);
  return unwrapList(data).map(mapCategory);
}

/** POST /admin/projects/categories */
export async function createAdminProjectCategory(
  payload: CreateProjectCategoryPayload,
): Promise<AdminProjectCategory> {
  if (USE_MOCK) {
    await delay();
    const created: AdminProjectCategory = {
      id: `pcat-${Date.now()}`,
      title: payload.title,
      slug: payload.slug,
      created_at: new Date().toISOString(),
    };
    mockCategories.push(created);
    return created;
  }
  const { data } = await apiClient.post<Record<string, unknown>>(
    `${ADMIN}/projects/categories`,
    payload,
  );
  return mapCategory(unwrapRecord(data));
}

/** PUT /admin/projects/categories/{id} */
export async function updateAdminProjectCategory(
  id: string,
  payload: UpdateProjectCategoryPayload,
): Promise<AdminProjectCategory> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Category not found");
    mockCategories[idx] = { ...mockCategories[idx], ...payload };
    return mockCategories[idx];
  }
  const { data } = await apiClient.put<Record<string, unknown>>(
    `${ADMIN}/projects/categories/${id}`,
    payload,
  );
  return mapCategory(unwrapRecord(data));
}

/** DELETE /admin/projects/categories/{id} */
export async function deleteAdminProjectCategory(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    mockCategories = mockCategories.filter((c) => c.id !== id);
    return;
  }
  await apiClient.delete(`${ADMIN}/projects/categories/${id}`);
}
