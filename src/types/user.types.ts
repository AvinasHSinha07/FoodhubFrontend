export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
  CUSTOMER = "CUSTOMER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProviderProfile {
  id: string;
  userId: string;
  restaurantName: string;
  location: string;
  cuisineOptions: string[];
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
