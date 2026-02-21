export interface loginProps {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string | number;
  username?: string;
  full_name: string;
  email: string;
  phone?: string;
  user_type?: string;
  address?: string;
  is_admin?: number | boolean;
  is_active?: number | boolean;
  date_of_birth?: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    refresh_token?: string;
    csrf_token?: string;
    user?: AuthenticatedUser;
    data?: AuthenticatedUser;
  } | null;
  status: number;
  message?: string;
  success?: boolean;
}

export interface RegisterProps {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  phoneNumber: number;
  password: string;
  confirmPassword: string;
  userType: "buyer" | "seller";
  dateOfBirth: string;
}
