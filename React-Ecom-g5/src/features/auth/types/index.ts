export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  customerId: number;
  fullName: string;
  email: string;
}

export interface CustomerMeResponse {
  customerId: number;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface Customer {
  customerId: number;
  fullName: string;
  email: string;
  phone?: string | null;
}
