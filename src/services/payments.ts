import { apiRequest } from "@/hooks/useClient";
import type { PaymentListResponse, PaymentRecord, PaymentSingleResponse } from "@/types/payments";
import {
  buildQueryString,
  extractListData,
  extractMeta,
  extractSingleData,
} from "@/services/admin/common";

interface InitializePaymentPayload {
  order_id?: string | number;
  amount?: number;
  email?: string;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

interface GetPaymentsParams {
  page?: number;
  per_page?: number;
  status?: string;
  reference?: string;
  order_id?: string | number;
}

const extractPayment = (payload: Record<string, any>) =>
  extractSingleData<PaymentRecord>(payload, ["payment"]);

export const GetPayments = async (
  params: GetPaymentsParams = {},
): Promise<PaymentListResponse> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await apiRequest<Record<string, any>>(
      `payments${query}`,
      "GET",
    );
    const data = extractListData<PaymentRecord>(response, ["payments"]);
    const meta = extractMeta(response, {
      page: params.page ?? 1,
      per_page: params.per_page ?? (data.length || 20),
      total: data.length,
      pages: 1,
    });

    return {
      success: true,
      data,
      meta,
      message: response.message || "Payments fetched",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch payments",
      status: 500,
      meta: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
        total: 0,
        pages: 0,
      },
    };
  }
};

export const GetPayment = async (
  reference: string,
): Promise<PaymentSingleResponse> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `payments/${reference}`,
      "GET",
    );

    return {
      success: true,
      data: extractPayment(response),
      message: response.message || "Payment fetched",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch payment",
      status: 500,
    };
  }
};

export const InitializePayment = async (
  payload: InitializePaymentPayload,
): Promise<PaymentSingleResponse> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      "payments/initialize",
      "POST",
      payload,
    );

    return {
      success: true,
      data: extractPayment(response),
      message: response.message || "Payment initialized",
      status: response.status || 201,
    };
  } catch (error) {
    console.error("Error initializing payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to initialize payment",
      status: 500,
    };
  }
};

export const VerifyPayment = async (
  reference: string,
): Promise<PaymentSingleResponse> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `payments/verify/${reference}`,
      "GET",
    );

    return {
      success: true,
      data: extractPayment(response),
      message: response.message || "Payment verified",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to verify payment",
      status: 500,
    };
  }
};
