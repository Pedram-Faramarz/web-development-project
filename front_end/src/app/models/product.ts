export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: number; // Foreign key reference to Category
  is_active: boolean;
  is_featured: boolean;
  image?: string; // URL to the image
  created_at?: Date;
  updated_at?: Date;
  in_stock?: boolean; // Computed property
}