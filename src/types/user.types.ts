export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
  CUSTOMER = "CUSTOMER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
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
  description?: string | null;
  address: string;
  cuisineType?: string | null;
  logo?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;

  meals?: any[];
}
