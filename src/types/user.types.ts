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
  addresses?: ICustomerAddress[];
}

export interface ICustomerAddress {
  id: string;
  customerId: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  instructions?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProviderAvailabilityWindow {
  id?: string;
  providerId?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

export interface IProviderProfile {
  id: string;
  userId: string;
  restaurantName: string;
  description?: string | null;
  address: string;
  cuisineType?: string | null;
  preparationTimeMinutes?: number;
  timezone?: string;
  logo?: string | null;
  bannerImage?: string | null;
  isOpenNow?: boolean;
  nextOpenAt?: string | null;
  availabilityLabel?: string;
  estimatedReadyInMinutes?: number;
  createdAt: string;
  updatedAt: string;

  meals?: any[];
  availabilityWindows?: IProviderAvailabilityWindow[];
}
