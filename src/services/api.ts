import {
  Product,
  Order,
  CartItem,
  SavedCard,
  Address,
  User,
  SupportConversation,
  NotificationLog,
} from '../types.ts';

export async function fetchProducts(filters?: {
  category?: string;
  query?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.query) params.append('query', filters.query);
  if (filters?.size) params.append('size', filters.size);
  if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

  const res = await fetch(`/api/products?${params.toString()}`);
  const data = await res.json();
  return data.products || [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${id}`);
  const data = await res.json();
  return data.success ? data.product : null;
}

export async function checkStock(productId: string, size?: string, color?: string) {
  const params = new URLSearchParams();
  if (size) params.append('size', size);
  if (color) params.append('color', color);
  const res = await fetch(`/api/products/${productId}/stock?${params.toString()}`);
  return await res.json();
}

export async function loginUser(email: string, password: string, method?: 'email' | 'sms') {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, method }),
  });
  return await res.json();
}

export async function verify2FA(userId: string, code: string) {
  const res = await fetch('/api/auth/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code }),
  });
  return await res.json();
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  twoFactorMethod?: 'email' | 'sms' | 'both';
}) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function forgotPassword(email: string, channel?: 'email' | 'sms') {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, channel }),
  });
  return await res.json();
}

export async function resetPassword(tokenOrCode: string, newPassword: string) {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenOrCode, newPassword }),
  });
  return await res.json();
}

export async function fetchSavedCards(userId: string): Promise<SavedCard[]> {
  const res = await fetch(`/api/cards?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  return data.cards || [];
}

export async function saveCreditCard(cardData: {
  userId: string;
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  isDefault?: boolean;
}) {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return await res.json();
}

export async function createOrder(orderPayload: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  shippingAddress: Address;
  shippingFee: number;
  discount: number;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  cardLast4?: string;
}) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  return await res.json();
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  const data = await res.json();
  return data.orders || [];
}

export async function fetchTracking(code: string) {
  const res = await fetch(`/api/tracking/${encodeURIComponent(code.trim())}`);
  return await res.json();
}

export async function sendAdkMessage(params: {
  conversationId?: string;
  customerPhone?: string;
  customerName?: string;
  text: string;
  channel?: 'whatsapp' | 'web';
}) {
  const res = await fetch('/api/adk/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await res.json();
}

export async function fetchConversations(): Promise<{
  conversations: SupportConversation[];
  humanQueueCount: number;
}> {
  const res = await fetch('/api/adk/conversations');
  const data = await res.json();
  return {
    conversations: data.conversations || [],
    humanQueueCount: data.humanQueueCount || 0,
  };
}

export async function sendHumanSupportReply(conversationId: string, agentName: string, text: string) {
  const res = await fetch('/api/adk/human-reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, agentName, text }),
  });
  return await res.json();
}

export async function resolveConversation(conversationId: string) {
  const res = await fetch('/api/adk/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId }),
  });
  return await res.json();
}

export async function fetchNotifications(recipient?: string): Promise<NotificationLog[]> {
  const url = recipient ? `/api/notifications?recipient=${encodeURIComponent(recipient)}` : '/api/notifications';
  const res = await fetch(url);
  const data = await res.json();
  return data.notifications || [];
}
