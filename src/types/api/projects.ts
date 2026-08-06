export interface AdminProjectCategory {
  id: string;
  title: string;
  slug: string;
  created_at?: string;
}

export interface AdminProject {
  id: string;
  title: string;
  slug: string;
  description?: string;
  employer?: string;
  location?: string;
  footage?: number;
  implementation_year?: number;
  image?: string;
  category_id?: string;
  category_title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectPayload {
  title: string;
  slug: string;
  description?: string;
  employer?: string;
  location?: string;
  footage?: number;
  implementation_year?: number;
  image?: string;
  category_id?: string;
}

export type UpdateProjectPayload = CreateProjectPayload;

export interface CreateProjectCategoryPayload {
  title: string;
  slug: string;
}

export type UpdateProjectCategoryPayload = CreateProjectCategoryPayload;
