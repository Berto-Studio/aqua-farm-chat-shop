import type { PaginationMeta } from "@/types/admin";

export interface PaymentRecord {
  id: string | number;
  user_id: string | number;
  order_id?: string | number | null;
  provider?: string | null;
  reference: string;
  access_code?: string | null;
  authorization_url?: string | null;
  amount: number;
  currency?: string | null;
  status: string;
  gateway_response?: string | null;
  gateway_payload?: Record<string, unknown>;
  channel?: string | null;
  customer_email?: string | null;
  metadata?: Record<string, unknown>;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  order_status?: string | null;
  order_total?: number | null;
  order_payment_status?: string | null;
}

export interface PaymentListResponse {
  success: boolean;
  data: PaymentRecord[];
  message: string;
  status: number;
  meta?: PaginationMeta;
}

export interface PaymentSingleResponse {
  success: boolean;
  data?: PaymentRecord;
  message: string;
  status: number;
}
