export interface ProductCategoryOption {
  id: number;
  name: string;
  description?: string;
}

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryOption[] = [
  {
    id: 1,
    name: "Fingerlings",
    description: "Fingerlings and aquaculture stock.",
  },
  {
    id: 2,
    name: "Catfish",
    description: "Mature catfish.",
  },
  {
    id: 3,
    name: "Tilapia",
    description: "Mature tilapia.",
  },

  {
    id: 4,
    name: "Farm Equipment",
    description: "Pumps, tanks, aerators, nets, and essential farm tools.",
  },

  {
    id: 5,
    name: "Fish Feed",
    description: "Nutritious feed for fish.",
  },
];

const CATEGORY_ALIASES: Record<string, string> = {
  fingerlings: "Fingerlings",
  fingerling: "Fingerlings",
  fish: "Fish",
  "farm equipment": "Farm Equipment",
  "farm equipments": "Farm Equipment",
  "farm tools": "Farm Equipment",
  tools: "Farm Equipment",
  equipment: "Farm Equipment",
  pumps: "Farm Equipment",
  tanks: "Farm Equipment",
  "farm supplies": "Farm Equipment",
  "fish feed": "Fish Feed",
};

export const normalizeCategoryName = (name?: string) => {
  if (!name) return "";

  const trimmed = name.trim();
  const canonical = CATEGORY_ALIASES[trimmed.toLowerCase()];

  return canonical || trimmed;
};

export const mergeProductCategories = (
  apiCategories: ProductCategoryOption[] = [],
) => {
  const merged = new Map<string, ProductCategoryOption>();

  DEFAULT_PRODUCT_CATEGORIES.forEach((category) => {
    merged.set(category.name.toLowerCase(), category);
  });

  apiCategories.forEach((category, index) => {
    const normalizedName = normalizeCategoryName(category.name);
    const key = normalizedName.toLowerCase();
    const existing = merged.get(key);

    merged.set(key, {
      id:
        typeof category.id === "number"
          ? category.id
          : existing?.id || DEFAULT_PRODUCT_CATEGORIES.length + index + 1,
      name: normalizedName,
      description: category.description || existing?.description,
    });
  });

  return Array.from(merged.values());
};
