export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'Feminino' | 'Masculino' | 'Alfaiataria' | 'Infantil' | 'Uniformes';
  description: string;
  composition: string;
  careInstructions: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  totalStock: number;
  featured?: boolean;
}

export interface SavedCard {
  id: string;
  cardHolder: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex';
  last4: string;
  expiry: string;
  cardToken: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'admin' | 'support_agent';
  twoFactorEnabled: boolean;
  twoFactorMethod: 'email' | 'sms' | 'both';
  twoFactorPendingCode?: {
    code: string;
    method: 'email' | 'sms';
    expiresAt: number;
  };
  resetPasswordPendingToken?: {
    token: string;
    code: string;
    expiresAt: number;
  };
  savedCards: SavedCard[];
  addresses: Address[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

export type OrderStatus =
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_producao_corte'
  | 'pronto_envio'
  | 'em_transporte'
  | 'entregue'
  | 'troca_solicitada';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  paymentStatus: 'paid' | 'pending' | 'failed';
  cardLast4?: string;
  status: OrderStatus;
  trackingCode: string;
  carrier: string;
  shippingAddress: Address;
  trackingTimeline: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'agent_adk' | 'human_agent' | 'system';
  text: string;
  timestamp: string;
  toolCallsExecuted?: string[];
  intentDetected?: string;
}

export interface SupportConversation {
  id: string;
  channel: 'whatsapp' | 'web';
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  status: 'BOT_ADK' | 'EM_ATENDIMENTO_HUMANO' | 'FINALIZADO';
  assignedAgent?: string;
  humanEscalationReason?: string;
  escalatedAt?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface NotificationLog {
  id: string;
  channel: 'whatsapp' | 'email' | 'sms';
  recipient: string;
  subject?: string;
  message: string;
  type: '2fa_code' | 'password_reset' | 'order_tracking' | 'order_confirmed' | 'stock_alert' | 'human_escalation' | 'exchange_update';
  status: 'sent' | 'delivered';
  createdAt: string;
}

export interface ExchangeRequest {
  id: string;
  orderId: string;
  customerPhone: string;
  itemDescription: string;
  reason: string;
  preferredAction: 'troca_tamanho' | 'troca_defeito' | 'devolucao_estorno';
  targetSize?: string;
  status: 'solicitado' | 'em_analise' | 'autorizado' | 'concluido';
  createdAt: string;
}
