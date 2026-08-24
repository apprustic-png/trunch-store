export interface Product {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  discountPercent: number;
  price: number;
  description: string;
  specs: {
    color?: string;
    style?: string;
    material?: string;
    details?: string;
    softnessnessAndThickness?: string;
    seasonAge?: string;
  };
  sizeChart: {
    [key: string]: string; // e.g. "S": "40 - 45 kg (Tinggi 150 - 168 cm)"
  };
  checkoutUrl: string;
  lynkProductUuid: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  label: string;
  province: string;
  regency: string;
  district: string;
  fullAddress: string;
  benchmark: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  addresses: UserAddress[];
  createdAt?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'order confirm'
  | 'production'
  | 'packaging'
  | 'shipping'
  | 'delivery'
  | 'done';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  size: string; // S, M, L, XL
  note: string;
  addressSnapshot: UserAddress;
  status: OrderStatus;
  lynkProductUuid: string;
  checkoutUrl: string;
  paymentRefId?: string;
  paymentAmount?: number;
  paymentTime?: string;
  poDeadline?: string; // 30 days from confirmation
  createdAt: string;
  updatedAt: string;
}

export interface UnmatchedPayment {
  id: string;
  refId: string;
  email: string;
  lynkProductUuid: string;
  rawPayload: any;
  status: 'needs_review' | 'resolved';
  createdAt: string;
}
