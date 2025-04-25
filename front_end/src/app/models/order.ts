import { OrderItem } from "./order-item";

export interface Order {
  id?: number;
  user: number; // Foreign key reference to User
  user_username:string;
  status: number; // Foreign key reference to OrderStatus
  total_amount: number;
  shipping_address: string;
  contact_phone: string;
  created_at?: Date;
  updated_at?: Date;
  items?: OrderItem[]; // Related items
}