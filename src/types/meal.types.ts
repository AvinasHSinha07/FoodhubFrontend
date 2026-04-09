import { ICategory } from "./category.types";
import { IProviderProfile } from "./user.types";

export interface IMeal {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  ingredients: string[];
  price: number;
  portionSize: string;
  dietaryTag: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;

  // Added via relations (includes)
  category?: ICategory;
  provider?: IProviderProfile;
}
