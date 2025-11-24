
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  weight?: string;
  rating?: number;
}

export interface Market {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  coverImage: string;
  categories: string[];
  products: Product[];
  isPromoted?: boolean;
  tags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  marketId: string;
  marketName: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Changed from React.ReactNode to string (name of the icon)
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'market';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'market'; marketId: string };

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  nickname?: string; // e.g., "Casa", "Trabalho"
}

export interface Order {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered';
  marketName: string;
  rating?: number; // 1 to 5 stars, or undefined if not rated
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  currentAddressIndex: number;
  orders: Order[];
  role?: string;
}
