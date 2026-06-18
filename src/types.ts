export type Category =
  | 'baby-diapers'
  | 'adult-diapers'
  | 'sanitary-pads'
  | 'panty-liners'
  | 'maternity-pads';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  mrp: number;
  size?: string;
  packOf: number;
  stock: number;
  image: string;
  description: string;
  rating: number;
  absorbency?: 'Light' | 'Regular' | 'Heavy' | 'Overnight';
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'COD';
  paymentStatus: 'Paid' | 'Unpaid';
  status: OrderStatus;
  deliveryPartnerId?: string;
  placedAt: number;
  eta?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'admin' | 'delivery';
  address?: string;
}

export interface Coupon {
  code: string;
  discountPct: number;
  maxDiscount: number;
  minOrder: number;
  active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'order' | 'info';
  createdAt: number;
  read: boolean;
}
