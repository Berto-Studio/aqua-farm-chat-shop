import { normalizeCategoryName } from "@/constants/categories";
import { Product } from "@/types/product";

export type ProductContentSection = {
  title: string;
  items: string[];
};

const getLifeStageLabel = (product: Product) => {
  if (product.animal_stage === 0) return "Young";
  if (product.animal_stage === 1) return "Mature";
  return "General";
};

const getQuantityLabel = (product: Product) => {
  const quantity = Number(product.quantity) || 0;
  if (quantity <= 0) return "Currently out of stock";
  return `${quantity} unit${quantity === 1 ? "" : "s"} currently available`;
};

const getUnitLabel = (product: Product) =>
  String(product.weight_per_unit || product.weightPerUnit || "1");

export const getProductDetailsSections = (
  product: Product
): ProductContentSection[] => {
  const category = normalizeCategoryName(product.category);
  const unitLabel = getUnitLabel(product);
  const quantityLabel = getQuantityLabel(product);
  const lifeStageLabel = getLifeStageLabel(product);

  switch (category) {
    case "Fish":
      return [
        {
          title: "Stock Overview",
          items: [
            `Category: ${category}`,
            `Life stage: ${lifeStageLabel}`,
            `Packaging or unit size: ${unitLabel}`,
            `Availability: ${quantityLabel}`,
          ],
        },
        {
          title: "Handling Notes",
          items: [
            "Suitable for pond, tank, and recirculating aquaculture setups.",
            "Use clean holding water and low-stress transfer during stocking or harvest.",
            "Plan receiving, aeration, and containment before delivery day.",
          ],
        },
      ];
    case "Live Stock":
      return [
        {
          title: "Animal Overview",
          items: [
            `Category: ${category}`,
            `Growth stage: ${lifeStageLabel}`,
            `Sale unit: ${unitLabel}`,
            `Availability: ${quantityLabel}`,
          ],
        },
        {
          title: "Housing And Handling",
          items: [
            "Best managed with secure housing, clean water access, and proper ventilation.",
            "Reduce transport stress by preparing pens or shelter before arrival.",
            "Group animals by size and monitor feed intake during adjustment.",
          ],
        },
      ];
    case "Vegetables":
      return [
        {
          title: "Produce Overview",
          items: [
            `Category: ${category}`,
            `Pack size or unit: ${unitLabel}`,
            `Freshness profile: Harvest-ready produce`,
            `Availability: ${quantityLabel}`,
          ],
        },
        {
          title: "Quality Notes",
          items: [
            "Selected for freshness, visual quality, and day-to-day kitchen or retail use.",
            "Best kept cool and handled gently to reduce bruising or moisture loss.",
            "Use clean storage containers and avoid stacking delicate produce too high.",
          ],
        },
      ];
    case "Fruits":
      return [
        {
          title: "Fruit Overview",
          items: [
            `Category: ${category}`,
            `Pack size or unit: ${unitLabel}`,
            `Ripeness profile: Fresh market produce`,
            `Availability: ${quantityLabel}`,
          ],
        },
        {
          title: "Quality Notes",
          items: [
            "Suitable for home use, resale, juice preparation, or light processing.",
            "Handle with care to preserve skin quality and extend shelf appeal.",
            "Separate fully ripe fruit from firmer stock to manage shelf life better.",
          ],
        },
      ];
    case "Farm Equipment":
      return [
        {
          title: "Equipment Overview",
          items: [
            `Category: ${category}`,
            `Unit or package size: ${unitLabel}`,
            `Use case: Daily farm operations and support tasks`,
            `Availability: ${quantityLabel}`,
          ],
        },
        {
          title: "Operation Notes",
          items: [
            "Suitable for routine farm work, maintenance, and production support.",
            "Inspect parts and fit before field use or installation.",
            "Store in a clean, dry location when not in use to extend service life.",
          ],
        },
      ];
    default:
      return [
        {
          title: "Product Overview",
          items: [
            `Category: ${category || "General"}`,
            `Unit size: ${unitLabel}`,
            `Availability: ${quantityLabel}`,
            "Refer to the description for the most accurate item-specific information.",
          ],
        },
      ];
  }
};

export const getProductCareGuideSections = (
  product: Product
): ProductContentSection[] => {
  const category = normalizeCategoryName(product.category);

  switch (category) {
    case "Fish":
      return [
        {
          title: "Water Management",
          items: [
            "Keep water clean, oxygenated, and temperature-stable before introducing stock.",
            "Acclimate fish gradually to new water to reduce shock.",
            "Watch feeding response and remove excess feed to protect water quality.",
          ],
        },
        {
          title: "Daily Monitoring",
          items: [
            "Observe movement, surfacing, and appetite at regular intervals.",
            "Reduce crowding during grading, transfer, or harvest preparation.",
            "Maintain clean nets, tanks, and holding equipment between batches.",
          ],
        },
      ];
    case "Live Stock":
      return [
        {
          title: "Feeding And Shelter",
          items: [
            "Provide balanced feed, dependable water access, and clean resting space.",
            "Keep housing dry, ventilated, and protected from harsh weather.",
            "Adjust feeding plans according to growth stage and farm goals.",
          ],
        },
        {
          title: "Routine Care",
          items: [
            "Inspect animals daily for signs of stress, injury, or reduced appetite.",
            "Clean feeding and watering points consistently to limit disease risk.",
            "Separate weak or newly delivered stock during the adjustment period if needed.",
          ],
        },
      ];
    case "Vegetables":
      return [
        {
          title: "Storage Guide",
          items: [
            "Keep vegetables cool, shaded, and dry until use or resale.",
            "Avoid crushing leafy or tender produce under heavier items.",
            "Use breathable crates or clean containers to maintain freshness.",
          ],
        },
        {
          title: "Handling Tips",
          items: [
            "Wash only when needed for immediate use to avoid excess moisture during storage.",
            "Trim damaged portions early to prevent spoilage from spreading.",
            "Rotate older stock forward first for best freshness management.",
          ],
        },
      ];
    case "Fruits":
      return [
        {
          title: "Storage Guide",
          items: [
            "Sort fruit by ripeness so softer batches are used first.",
            "Store in a cool area with airflow and away from direct sun.",
            "Keep delicate fruits in shallow layers to reduce pressure damage.",
          ],
        },
        {
          title: "Handling Tips",
          items: [
            "Handle gently during washing, packing, and display.",
            "Remove bruised fruit early to protect nearby stock.",
            "Use clean baskets or trays to preserve appearance and hygiene.",
          ],
        },
      ];
    case "Farm Equipment":
      return [
        {
          title: "Setup And Safety",
          items: [
            "Inspect fittings, power connections, or moving parts before first use.",
            "Follow safe operating practices and keep equipment on stable surfaces.",
            "Test equipment briefly after setup to confirm expected performance.",
          ],
        },
        {
          title: "Maintenance",
          items: [
            "Clean after use and remove buildup that can reduce efficiency.",
            "Store in a dry place and protect electrical or metal parts from moisture.",
            "Replace worn components promptly to avoid larger failures during operation.",
          ],
        },
      ];
    default:
      return [
        {
          title: "General Care",
          items: [
            "Handle this product according to its category and intended use.",
            "Store it in clean conditions and check it regularly after delivery.",
            "Refer to supplier guidance for any special usage or maintenance needs.",
          ],
        },
      ];
  }
};
