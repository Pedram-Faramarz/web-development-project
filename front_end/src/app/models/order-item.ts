export interface OrderItem {
    id?: number;
    order: number; // Foreign key reference to Order
    product: number; // Foreign key reference to Product
    quantity: number;
    price: number;
    subtotal?: number; // Computed property
  }