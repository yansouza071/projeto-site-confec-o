import { db } from '../db/database.ts';
import {
  Product,
  Order,
  User,
  SupportConversation,
  SupportMessage,
  NotificationLog,
  ExchangeRequest,
  SavedCard,
  OrderStatus,
  TrackingEvent,
} from '../db/types.ts';

// 1. PRODUCT REPOSITORY
export class ProductRepository {
  findAll(filter?: {
    category?: string;
    query?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Product[] {
    let list = [...db.products];

    if (filter?.category && filter.category !== 'Todos') {
      list = list.filter((p) => p.category.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter?.query) {
      const q = filter.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.composition.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filter?.size) {
      list = list.filter((p) => p.sizes.includes(filter.size!));
    }

    if (filter?.minPrice !== undefined) {
      list = list.filter((p) => p.price >= filter.minPrice!);
    }

    if (filter?.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= filter.maxPrice!);
    }

    return list;
  }

  findById(id: string): Product | undefined {
    return db.products.find((p) => p.id === id);
  }

  findBySlug(slug: string): Product | undefined {
    return db.products.find((p) => p.slug === slug);
  }

  searchByTerm(term: string): Product[] {
    const q = term.toLowerCase().trim();
    return db.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.variants.some((v) => v.size.toLowerCase() === q || v.color.toLowerCase().includes(q))
    );
  }

  checkStock(productId: string, size?: string, color?: string): {
    available: boolean;
    productName: string;
    totalStock: number;
    matchingVariants: { size: string; color: string; stock: number }[];
  } {
    const product = this.findById(productId);
    if (!product) {
      return { available: false, productName: 'Não encontrado', totalStock: 0, matchingVariants: [] };
    }

    let matched = product.variants;
    if (size) {
      matched = matched.filter((v) => v.size.toLowerCase() === size.toLowerCase());
    }
    if (color) {
      matched = matched.filter((v) => v.color.toLowerCase().includes(color.toLowerCase()));
    }

    const available = matched.some((v) => v.stock > 0);
    return {
      available,
      productName: product.name,
      totalStock: product.totalStock,
      matchingVariants: matched.map((v) => ({ size: v.size, color: v.color, stock: v.stock })),
    };
  }

  decrementStock(productId: string, size: string, color: string, quantity: number): boolean {
    const product = this.findById(productId);
    if (!product) return false;

    const variant = product.variants.find(
      (v) => v.size.toLowerCase() === size.toLowerCase() && v.color.toLowerCase() === color.toLowerCase()
    );

    if (!variant || variant.stock < quantity) {
      return false;
    }

    variant.stock -= quantity;
    product.totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    return true;
  }

  incrementStock(productId: string, size: string, color: string, quantity: number): boolean {
    const product = this.findById(productId);
    if (!product) return false;

    const variant = product.variants.find(
      (v) => v.size.toLowerCase() === size.toLowerCase() && v.color.toLowerCase() === color.toLowerCase()
    );

    if (!variant) return false;

    variant.stock += quantity;
    product.totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    return true;
  }
}

// 2. ORDER REPOSITORY
export class OrderRepository {
  findAll(): Order[] {
    return [...db.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  findById(id: string): Order | undefined {
    return db.orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  }

  findByTrackingCode(code: string): Order | undefined {
    const normalized = code.trim().toUpperCase();
    return db.orders.find((o) => o.trackingCode.toUpperCase() === normalized);
  }

  findByCustomerQuery(query: string): Order[] {
    const clean = query.replace(/\D/g, '');
    const text = query.toLowerCase().trim();
    return db.orders.filter((o) => {
      const phoneDigits = o.customerPhone.replace(/\D/g, '');
      return (
        (clean.length > 4 && phoneDigits.includes(clean)) ||
        o.customerEmail.toLowerCase().includes(text) ||
        o.customerName.toLowerCase().includes(text) ||
        o.id.toLowerCase() === text ||
        o.trackingCode.toLowerCase() === text
      );
    });
  }

  create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const order: Order = {
      ...orderData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    db.orders.unshift(order);
    return order;
  }

  updateStatus(id: string, status: OrderStatus, newTimelineEvent?: TrackingEvent): Order | undefined {
    const order = this.findById(id);
    if (!order) return undefined;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (newTimelineEvent) {
      order.trackingTimeline.push(newTimelineEvent);
    }

    return order;
  }
}

// 3. USER REPOSITORY
export class UserRepository {
  findById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  }

  findByEmail(email: string): User | undefined {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  findByPhone(phone: string): User | undefined {
    const digits = phone.replace(/\D/g, '');
    return db.users.find((u) => u.phone.replace(/\D/g, '') === digits);
  }

  create(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    return newUser;
  }

  set2FACode(userId: string, code: string, method: 'email' | 'sms'): void {
    const user = this.findById(userId);
    if (!user) return;
    user.twoFactorPendingCode = {
      code,
      method,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
  }

  verify2FACode(userId: string, code: string): boolean {
    const user = this.findById(userId);
    if (!user || !user.twoFactorPendingCode) return false;

    if (Date.now() > user.twoFactorPendingCode.expiresAt) {
      user.twoFactorPendingCode = undefined;
      return false;
    }

    if (user.twoFactorPendingCode.code === code.trim()) {
      user.twoFactorPendingCode = undefined;
      return true;
    }

    return false;
  }

  setResetPasswordToken(email: string, token: string, code: string): boolean {
    const user = this.findByEmail(email);
    if (!user) return false;

    user.resetPasswordPendingToken = {
      token,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
    };
    return true;
  }

  resetPassword(tokenOrCode: string, newPasswordHash: string): boolean {
    const user = db.users.find(
      (u) =>
        u.resetPasswordPendingToken &&
        (u.resetPasswordPendingToken.token === tokenOrCode ||
          u.resetPasswordPendingToken.code === tokenOrCode) &&
        Date.now() <= u.resetPasswordPendingToken.expiresAt
    );

    if (!user) return false;

    user.passwordHash = newPasswordHash;
    user.resetPasswordPendingToken = undefined;
    return true;
  }

  addSavedCard(userId: string, card: Omit<SavedCard, 'id' | 'createdAt'>): SavedCard | undefined {
    const user = this.findById(userId);
    if (!user) return undefined;

    const newCard: SavedCard = {
      ...card,
      id: `card-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (card.isDefault) {
      user.savedCards.forEach((c) => (c.isDefault = false));
    }

    user.savedCards.push(newCard);
    return newCard;
  }

  getSavedCards(userId: string): SavedCard[] {
    const user = this.findById(userId);
    return user ? user.savedCards : [];
  }
}

// 4. SUPPORT CONVERSATION REPOSITORY
export class SupportRepository {
  getAllConversations(): SupportConversation[] {
    return [...db.conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getConversation(id: string): SupportConversation | undefined {
    return db.conversations.find((c) => c.id === id);
  }

  getOrCreateConversation(channel: 'whatsapp' | 'web', phone: string, name: string): SupportConversation {
    let conv = db.conversations.find(
      (c) => c.channel === channel && c.customerPhone.replace(/\D/g, '') === phone.replace(/\D/g, '')
    );

    if (!conv) {
      const now = new Date().toISOString();
      conv = {
        id: `conv-${Date.now()}`,
        channel,
        customerPhone: phone,
        customerName: name,
        status: 'BOT_ADK',
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            conversationId: `conv-${Date.now()}`,
            sender: 'agent_adk',
            text: `Olá ${name}! Sou o Agente de Suporte Inteligente do Ateliê & Confecção VesteBem.\n\nPosso te ajudar com:\n1. Consulta de estoque e tamanhos em tempo real\n2. Rastreio detalhado do seu pedido\n3. Troca ou devolução (ex: trocar tamanho P por M)\n4. Informações de pagamento e alfaiataria\n\nComo posso ser útil hoje?`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
      db.conversations.unshift(conv);
    }
    return conv;
  }

  addMessage(conversationId: string, message: Omit<SupportMessage, 'id'>): SupportMessage {
    const conv = this.getConversation(conversationId);
    const msg: SupportMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    if (conv) {
      conv.messages.push(msg);
      conv.updatedAt = new Date().toISOString();
    }
    return msg;
  }

  updateStatus(
    conversationId: string,
    status: 'BOT_ADK' | 'EM_ATENDIMENTO_HUMANO' | 'FINALIZADO',
    reason?: string,
    assignedAgent?: string
  ): SupportConversation | undefined {
    const conv = this.getConversation(conversationId);
    if (!conv) return undefined;

    conv.status = status;
    conv.updatedAt = new Date().toISOString();
    if (reason) conv.humanEscalationReason = reason;
    if (assignedAgent) conv.assignedAgent = assignedAgent;
    if (status === 'EM_ATENDIMENTO_HUMANO') {
      conv.escalatedAt = new Date().toISOString();
    }

    return conv;
  }

  getAllPendingHumanEscalations(): SupportConversation[] {
    return db.conversations.filter((c) => c.status === 'EM_ATENDIMENTO_HUMANO');
  }
}

// 5. NOTIFICATION REPOSITORY
export class NotificationRepository {
  create(log: Omit<NotificationLog, 'id' | 'createdAt'>): NotificationLog {
    const entry: NotificationLog = {
      ...log,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(entry);
    return entry;
  }

  findAll(): NotificationLog[] {
    return [...db.notifications];
  }

  findByRecipient(recipient: string): NotificationLog[] {
    const clean = recipient.replace(/\D/g, '');
    return db.notifications.filter(
      (n) => n.recipient.toLowerCase().includes(recipient.toLowerCase()) || (clean.length > 5 && n.recipient.replace(/\D/g, '').includes(clean))
    );
  }
}

// 6. EXCHANGE REPOSITORY
export class ExchangeRepository {
  create(request: Omit<ExchangeRequest, 'id' | 'createdAt'>): ExchangeRequest {
    const entry: ExchangeRequest = {
      ...request,
      id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    db.exchangeRequests.unshift(entry);
    return entry;
  }

  findAll(): ExchangeRequest[] {
    return [...db.exchangeRequests];
  }

  findByOrderId(orderId: string): ExchangeRequest[] {
    return db.exchangeRequests.filter((e) => e.orderId.toLowerCase() === orderId.toLowerCase());
  }
}

// Instâncias singleton dos repositórios
export const productRepo = new ProductRepository();
export const orderRepo = new OrderRepository();
export const userRepo = new UserRepository();
export const supportRepo = new SupportRepository();
export const notificationRepo = new NotificationRepository();
export const exchangeRepo = new ExchangeRepository();
