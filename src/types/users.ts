export interface User {
  id?: number;
  name?: string;
  email: string;
  full_name?: string;
  user_type?: string;
  phone?: number;
  address?: string;
  is_admin?: boolean;
  profile_image_url?: string;
}

export interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export interface LoggedInState {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}
