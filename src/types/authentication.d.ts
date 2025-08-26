export interface loginProps {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    id: string;
    full_name: string;
    email: string;
    user_type?: string;
    phone?: number;
    address?: string;
  } | null;
  access_token: string;
  status: number;
  message?: string;
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
