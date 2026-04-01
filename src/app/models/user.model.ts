export interface User {
  id?: number;
  name: string;
  email: string;
  token?: string;
}

// Defining the shape of my laravel response for login
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}