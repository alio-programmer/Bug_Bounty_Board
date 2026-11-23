import type { Bug } from "./domain/types";
import type { BugFilters } from "./domain/filters";
import type { CreateBugInput, UpdateBugInput } from "./validation";

interface ApiErrorBody {
  error?: string;
  issues?: Array<{ message?: string }>;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    const issue = body?.issues?.[0]?.message;
    throw new ApiError(
      issue ?? body?.error ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export async function apiCreateBug(input: CreateBugInput): Promise<Bug> {
  const data = await request<{ bug: Bug }>("/api/bugs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.bug;
}

export async function apiUpdateBug(
  id: string,
  patch: UpdateBugInput,
): Promise<Bug> {
  const data = await request<{ bug: Bug }>(`/api/bugs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return data.bug;
}

export async function apiDeleteBug(id: string): Promise<void> {
  await request<{ deleted: boolean }>(`/api/bugs/${id}`, { method: "DELETE" });
}

export async function apiSeedDemo(): Promise<{ inserted: number; total: number }> {
  return request<{ inserted: number; total: number }>("/api/seed", {
    method: "POST",
  });
}

export function filterQueryToApi(filters: BugFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.severity.length)
    params.set("severity", filters.severity.join(","));
  if (filters.effort.length) params.set("effort", filters.effort.join(","));
  if (filters.category.length)
    params.set("category", filters.category.join(","));
  if (filters.status.length) params.set("status", filters.status.join(","));
  if (filters.quadrant.length)
    params.set("quadrant", filters.quadrant.join(","));
  const query = params.toString();
  return query ? `?${query}` : "";
}
