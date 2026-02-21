import { PaginationMeta } from "@/types/admin";

export const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const buildQueryString = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const extractMeta = (
  payload: Record<string, any>,
  fallback?: Partial<PaginationMeta>
): PaginationMeta | undefined => {
  const meta = payload.meta || payload.pagination || payload.page;
  if (!meta) return fallback ? { page: 1, per_page: 20, total: 0, pages: 0, ...fallback } : undefined;

  return {
    page: toNumber(meta.page, fallback?.page ?? 1),
    per_page: toNumber(meta.per_page ?? meta.perPage, fallback?.per_page ?? 20),
    total: toNumber(meta.total, fallback?.total ?? 0),
    pages: toNumber(meta.pages, fallback?.pages ?? 0),
  };
};

export const extractListData = <T>(
  payload: Record<string, any>,
  preferredKeys: string[] = []
): T[] => {
  const candidateKeys = [
    ...preferredKeys,
    "data",
    "results",
    "items",
    "rows",
  ];

  for (const key of candidateKeys) {
    const candidate = payload[key];
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
};

export const extractSingleData = <T>(
  payload: Record<string, any>,
  preferredKeys: string[] = []
): T | undefined => {
  const candidateKeys = [...preferredKeys, "data", "item", "result"];

  for (const key of candidateKeys) {
    const candidate = payload[key];
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate as T;
    }
  }

  return undefined;
};
