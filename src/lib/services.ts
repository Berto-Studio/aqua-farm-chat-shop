import {
  GraduationCap,
  Settings,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const FARM_SERVICES_ENDPOINT = "services/";

export const serviceIconKeys = [
  "users",
  "settings",
  "graduationCap",
  "wrench",
] as const;

export type ServiceIconKey = (typeof serviceIconKeys)[number];

export const serviceTierKeys = ["basic", "premium", "enterprise"] as const;

export type ServiceTier = (typeof serviceTierKeys)[number];

export interface ServicePricingOption {
  price: number;
  duration: string;
}

export interface FarmService {
  id?: string | number;
  title: string;
  description: string;
  icon: ServiceIconKey;
  features: string[];
  pricing: Record<ServiceTier, ServicePricingOption>;
}

const slugifyServiceTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getFarmServiceRouteParam = (
  service: Pick<FarmService, "id" | "title">,
) => {
  if (service.id !== undefined && service.id !== null && `${service.id}`.trim()) {
    return String(service.id);
  }

  return slugifyServiceTitle(service.title);
};

export const isFarmServiceMatch = (
  service: Pick<FarmService, "id" | "title">,
  routeParam: string,
) =>
  getFarmServiceRouteParam(service) === routeParam ||
  slugifyServiceTitle(service.title) === routeParam;

export const serviceTierLabels: Record<ServiceTier, string> = {
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
};

export const serviceIconMap: Record<ServiceIconKey, LucideIcon> = {
  users: Users,
  settings: Settings,
  graduationCap: GraduationCap,
  wrench: Wrench,
};

export const serviceIconOptions: Array<{
  value: ServiceIconKey;
  label: string;
}> = [
  { value: "users", label: "Consultation" },
  { value: "settings", label: "Operations" },
  { value: "graduationCap", label: "Training" },
  { value: "wrench", label: "Support" },
];
