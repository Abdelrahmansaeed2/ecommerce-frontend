export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isLimited?: boolean;
  rating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  configuration?: string;
}
