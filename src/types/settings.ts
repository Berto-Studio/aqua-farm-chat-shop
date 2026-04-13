export interface SettingsProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  defaultEnabled: boolean;
}

export interface NotificationGroup {
  id: string;
  label: string;
  settings: NotificationPreference[];
}

export interface NotificationSettingsPayload {
  groups: NotificationGroup[];
}

export interface PaymentMethod {
  id: number;
  name: string;
  last4: string;
  maskedNumber: string;
  type: string;
  expiry: string;
  isDefault: boolean;
}

export interface AddPaymentMethodPayload {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  isDefault?: boolean;
}

export interface BillingAddress {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

export interface SettingsOverview {
  profile: SettingsProfile | null;
  notifications: NotificationSettingsPayload;
  paymentMethods: PaymentMethod[];
  billing: BillingAddress;
}
