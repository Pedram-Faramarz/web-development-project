export interface User {
  id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean; // Flag to distinguish between admin and non-admin users
}
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer'
}

// User interface with role-based approach
export interface UserWithRole {
  id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole; // Using enum for role types
}