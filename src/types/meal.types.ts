import { ICategory } from "./category.types";
import { IProviderProfile } from "./user.types";

export interface IMeal {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  dietaryTag?: string | null;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;

  // Added via relations (includes)
  category?: ICategory;
  provider?: IProviderProfile;
}
