type PaymentMethodSource = {
  payment_method?: string | null;
  payment?: string | null;
};

type PaymentTrackingSource = PaymentMethodSource & {
  id?: string | number | null;
  status?: string | null;
  payment_status?: string | null;
  paymentStatus?: string | null;
  transaction_status?: string | null;
  transactionStatus?: string | null;
  payment_reference?: string | null;
  paymentReference?: string | null;
  transaction_reference?: string | null;
  transactionReference?: string | null;
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Credit/Debit Card",
  credit_card: "Credit/Debit Card",
  debit_card: "Credit/Debit Card",
  mobile: "Mobile Money",
  mobile_money: "Mobile Money",
  momo: "Mobile Money",
  paypal: "PayPal",
  cod: "Physical Payment",
  cash: "Physical Payment",
  cash_on_delivery: "Physical Payment",
  physical: "Physical Payment",
  physical_payment: "Physical Payment",
  pay_on_delivery: "Physical Payment",
  pay_on_pickup: "Physical Payment",
};

const PAYMENT_TRACKING_LABELS: Record<string, string> = {
  pending: "Awaiting Collection",
  awaiting_collection: "Awaiting Collection",
  awaiting_payment: "Awaiting Collection",
  unpaid: "Awaiting Collection",
  paid: "Paid",
  completed: "Paid",
  confirmed: "Paid",
  collected: "Collected",
  received: "Collected",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
};

const toTitleCase = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const normalizePaymentValue = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getRawPaymentMethod = (source?: PaymentMethodSource) =>
  source?.payment_method || source?.payment || "";

export const formatPaymentMethodLabel = (value?: string | null) => {
  const rawValue = value?.trim();
  if (!rawValue) return "N/A";

  const normalizedValue = normalizePaymentValue(rawValue);

  if (PAYMENT_METHOD_LABELS[normalizedValue]) {
    return PAYMENT_METHOD_LABELS[normalizedValue];
  }

  if (
    normalizedValue.includes("cash") ||
    normalizedValue.includes("physical") ||
    normalizedValue.includes("pickup")
  ) {
    return "Physical Payment";
  }

  if (
    normalizedValue.includes("mobile") ||
    normalizedValue.includes("momo")
  ) {
    return "Mobile Money";
  }

  return toTitleCase(rawValue);
};

export const isPhysicalPaymentMethodValue = (value?: string | null) => {
  const normalizedValue = normalizePaymentValue(value);

  return Boolean(
    normalizedValue &&
      (PAYMENT_METHOD_LABELS[normalizedValue] === "Physical Payment" ||
        normalizedValue.includes("cash") ||
        normalizedValue.includes("physical") ||
        normalizedValue.includes("pickup")),
  );
};

export const isPhysicalPaymentMethod = (source?: PaymentMethodSource) =>
  isPhysicalPaymentMethodValue(getRawPaymentMethod(source));

const getExplicitPaymentTrackingValue = (source?: PaymentTrackingSource) =>
  source?.payment_status ||
  source?.paymentStatus ||
  source?.transaction_status ||
  source?.transactionStatus;

export const formatPaymentTrackingLabel = (value?: string | null) => {
  const rawValue = value?.trim();
  if (!rawValue) return "Unknown";

  const normalizedValue = normalizePaymentValue(rawValue);
  return PAYMENT_TRACKING_LABELS[normalizedValue] || toTitleCase(rawValue);
};

export const getPaymentTrackingStatus = (source?: PaymentTrackingSource) => {
  const explicitTrackingValue = getExplicitPaymentTrackingValue(source);
  if (explicitTrackingValue) {
    return formatPaymentTrackingLabel(explicitTrackingValue);
  }

  const orderStatus = String(source?.status || "")
    .trim()
    .toLowerCase();

  if (orderStatus === "cancelled" || orderStatus === "canceled") {
    return "Cancelled";
  }

  if (isPhysicalPaymentMethod(source)) {
    if (orderStatus === "delivered") {
      return "Collected";
    }

    return "Awaiting Collection";
  }

  return "Paid";
};

export const getPaymentTrackingBadgeClass = (value?: string | null) => {
  const normalizedValue = normalizePaymentValue(
    formatPaymentTrackingLabel(value),
  );

  if (
    normalizedValue === "awaiting_collection" ||
    normalizedValue === "pending"
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (normalizedValue === "paid") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (normalizedValue === "collected" || normalizedValue === "completed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalizedValue === "cancelled" || normalizedValue === "failed") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  if (normalizedValue === "refunded") {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  return "bg-muted text-muted-foreground border-border";
};

export const getPaymentReference = (source?: PaymentTrackingSource) =>
  source?.transaction_reference ||
  source?.transactionReference ||
  source?.payment_reference ||
  source?.paymentReference ||
  (source?.id ? `TXN-${String(source.id).padStart(5, "0")}` : "N/A");
