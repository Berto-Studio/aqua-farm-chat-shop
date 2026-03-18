declare module "@paystack/inline-js" {
  type PaystackCustomer = Record<string, unknown>;

  type PaystackOnLoadPayload = {
    id: number;
    customer?: PaystackCustomer;
    accessCode?: string;
  };

  type PaystackOnSuccessPayload = {
    id: number;
    reference: string;
    message?: string;
  };

  type PaystackOnErrorPayload = {
    message: string;
  };

  type PaystackCallbacks = {
    onLoad?: (payload: PaystackOnLoadPayload) => void;
    onSuccess?: (payload: PaystackOnSuccessPayload) => void;
    onCancel?: () => void;
    onError?: (payload: PaystackOnErrorPayload) => void;
  };

  class PopupTransaction {
    id?: number | string;
  }

  export default class PaystackPop {
    static isLoaded(): boolean;
    resumeTransaction(
      accessCode: string,
      callbacks?: PaystackCallbacks,
    ): PopupTransaction;
  }
}
