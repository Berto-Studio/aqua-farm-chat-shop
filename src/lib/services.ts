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
  title: string;
  description: string;
  icon: ServiceIconKey;
  features: string[];
  pricing: Record<ServiceTier, ServicePricingOption>;
}

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
