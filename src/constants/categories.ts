export interface ProductCategoryOption {
  id: number;
  name: string;
  description?: string;
}

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryOption[] = [
  { id: 1, name: "Fish", description: "Fingerlings, mature fish, and aquaculture stock" },
  { id: 2, name: "Live Stock", description: "Farm animals for meat or breeding" },
  { id: 3, name: "Vegetables", description: "Fresh farm vegetables" },
  { id: 4, name: "Fruits", description: "Fresh seasonal fruits" },
  {
    id: 5,
    name: "Farm Equipment",
    description: "Pumps, tanks, aerators, nets, and essential farm tools",
  },
];

const CATEGORY_ALIASES: Record<string, string> = {
  fish: "Fish",
  "live stock": "Live Stock",
  livestock: "Live Stock",
  vegetable: "Vegetables",
  vegetables: "Vegetables",
  fruit: "Fruits",
  fruits: "Fruits",
  "farm equipment": "Farm Equipment",
  "farm equipments": "Farm Equipment",
  "farm tools": "Farm Equipment",
  tools: "Farm Equipment",
  equipment: "Farm Equipment",
  pumps: "Farm Equipment",
  tanks: "Farm Equipment",
  "farm supplies": "Farm Equipment",
};

export const normalizeCategoryName = (name?: string) => {
  if (!name) return "";

  const trimmed = name.trim();
  const canonical = CATEGORY_ALIASES[trimmed.toLowerCase()];

  return canonical || trimmed;
};

export const mergeProductCategories = (
  apiCategories: ProductCategoryOption[] = []
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
