import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  productRepo,
  orderRepo,
  userRepo,
  supportRepo,
  notificationRepo,
  exchangeRepo,
} from '../repositories/index.ts';
import { adkAgent } from '../adk/agent.ts';
import { EnvironmentToolset } from '../adk/environmentToolset.ts';

const api = Router();

// ==========================================
// 1. PRODUCTS & STOCK ENDPOINTS
// ==========================================
api.get('/products', (req: Request, res: Response) => {
  const { category, query, size, minPrice, maxPrice } = req.query;
  const products = productRepo.findAll({
    category: category ? String(category) : undefined,
    query: query ? String(query) : undefined,
    size: size ? String(size) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });
  res.json({ success: true, count: products.length, products });
});

api.get('/products/:id', (req: Request, res: Response) => {
  const product = productRepo.findById(req.params.id) || productRepo.findBySlug(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Produto não encontrado' });
    return;
  }
  res.json({ success: true, product });
});

api.get('/products/:id/stock', (req: Request, res: Response) => {
  const { size, color } = req.query;
  const stock = productRepo.checkStock(
    req.params.id,
    size ? String(size) : undefined,
    color ? String(color) : undefined
  );
  res.json({ success: true, stock });
});

// ==========================================
// 2. AUTHENTICATION, 2FA & PASSWORD RECOVERY
// ==========================================
api.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, twoFactorMethod } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ success: false, error: 'Nome, e-mail e senha são obrigatórios' });
    return;
  }

  const existing = userRepo.findByEmail(email);
  if (existing) {
    res.status(400).json({ success: false, error: 'E-mail já cadastrado' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = userRepo.create({
    name,
    email,
    phone: phone || '11987654321',
    passwordHash,
    role: 'customer',
    twoFactorEnabled: true,
    twoFactorMethod: twoFactorMethod || 'both',
    savedCards: [],
    addresses: [],
  });

  res.status(201).json({
    success: true,
    message: 'Conta criada com sucesso! Verificação em 2 etapas ativada.',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      twoFactorEnabled: newUser.twoFactorEnabled,
      twoFactorMethod: newUser.twoFactorMethod,
    },
  });
});

api.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, method } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios' });
    return;
  }

  const user = userRepo.findByEmail(email);
  if (!user) {
    res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    return;
  }

  const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    return;
  }

  // Se 2FA está habilitado, gera código de verificação
  if (user.twoFactorEnabled) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const chosenMethod = (method as 'email' | 'sms') || (user.twoFactorMethod === 'sms' ? 'sms' : 'email');

    userRepo.set2FACode(user.id, code, chosenMethod);

    // Dispara notificação por E-mail
    if (chosenMethod === 'email' || user.twoFactorMethod === 'both') {
      notificationRepo.create({
        channel: 'email',
        recipient: user.email,
        subject: 'Código de Verificação em 2 Etapas (2FA) - Ateliê VesteBem',
        message: `Seu código de segurança para login no Ateliê VesteBem é: ${code}. Válido por 5 minutos.`,
        type: '2fa_code',
        status: 'delivered',
      });
    }

    // Dispara notificação por SMS
    if (chosenMethod === 'sms' || user.twoFactorMethod === 'both') {
      notificationRepo.create({
        channel: 'sms',
        recipient: user.phone,
        message: `[VesteBem 2FA] Seu código de acesso seguro é: ${code}. Não compartilhe este código.`,
        type: '2fa_code',
        status: 'delivered',
      });
    }

    res.json({
      success: true,
      twoFactorRequired: true,
      userId: user.id,
      method: chosenMethod,
      message: `Código de verificação enviado via ${chosenMethod.toUpperCase()} (${chosenMethod === 'sms' ? user.phone : user.email}).`,
      // Para fins de teste/demo transparente, enviamos uma dica do código
      previewCode: code,
    });
    return;
  }

  // Login direto se não tiver 2FA
  res.json({
    success: true,
    twoFactorRequired: false,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      savedCards: user.savedCards,
    },
  });
});

api.post('/auth/verify-2fa', (req: Request, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    res.status(400).json({ success: false, error: 'ID do usuário e código são obrigatórios' });
    return;
  }

  const isValid = userRepo.verify2FACode(userId, code);
  if (!isValid) {
    res.status(400).json({ success: false, error: 'Código de verificação incorreto ou expirado' });
    return;
  }

  const user = userRepo.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    return;
  }

  res.json({
    success: true,
    message: 'Autenticação em 2 etapas concluída com sucesso!',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      savedCards: user.savedCards,
      addresses: user.addresses,
    },
  });
});

api.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email, channel } = req.body;

  if (!email) {
    res.status(400).json({ success: false, error: 'E-mail é obrigatório' });
    return;
  }

  const user = userRepo.findByEmail(email);
  if (!user) {
    // Por segurança, retorna mensagem genérica
    res.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas.',
    });
    return;
  }

  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  userRepo.setResetPasswordToken(email, token, code);

  // Disparo via E-mail
  notificationRepo.create({
    channel: 'email',
    recipient: user.email,
    subject: 'Recuperação de Senha - Ateliê VesteBem',
    message: `Olá ${user.name}! Recebemos uma solicitação para redefinir sua senha. Utilize o código de segurança ${code} ou acerte o token ${token}. Válido por 15 minutos.`,
    type: 'password_reset',
    status: 'delivered',
  });

  // Disparo via SMS se solicitado
  if (channel === 'sms' || user.twoFactorMethod === 'both') {
    notificationRepo.create({
      channel: 'sms',
      recipient: user.phone,
      message: `[VesteBem Segurança] Código para redefinir sua senha: ${code}. Válido por 15 min.`,
      type: 'password_reset',
      status: 'delivered',
    });
  }

  res.json({
    success: true,
    message: 'Código de recuperação enviado para o seu e-mail e SMS cadastrados!',
    previewCode: code,
    token,
  });
});

api.post('/auth/reset-password', (req: Request, res: Response) => {
  const { tokenOrCode, newPassword } = req.body;

  if (!tokenOrCode || !newPassword) {
    res.status(400).json({ success: false, error: 'Token/código e nova senha são obrigatórios' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  const resetSuccess = userRepo.resetPassword(tokenOrCode, newHash);
  if (!resetSuccess) {
    res.status(400).json({
      success: false,
      error: 'Código de recuperação inválido ou expirado',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Senha redefinida com sucesso! Você já pode realizar o login.',
  });
});

// ==========================================
// 3. CREDIT CARD TOKENIZATION & GATEWAY
// ==========================================
api.get('/cards', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-1';
  const cards = userRepo.getSavedCards(userId);
  res.json({ success: true, cards });
});

api.post('/cards', (req: Request, res: Response) => {
  const { userId, cardHolder, cardNumber, expiry, isDefault } = req.body;

  if (!cardHolder || !cardNumber || !expiry) {
    res.status(400).json({ success: false, error: 'Dados do cartão incompletos' });
    return;
  }

  const cleanNum = cardNumber.replace(/\D/g, '');
  if (cleanNum.length < 13) {
    res.status(400).json({ success: false, error: 'Número de cartão inválido' });
    return;
  }

  // Identificação segura da bandeira
  let brand: 'visa' | 'mastercard' | 'elo' | 'amex' = 'visa';
  if (cleanNum.startsWith('5') || cleanNum.startsWith('2')) brand = 'mastercard';
  else if (cleanNum.startsWith('3')) brand = 'amex';
  else if (cleanNum.startsWith('6') || cleanNum.startsWith('4011')) brand = 'elo';

  // Simulação de Tokenização PCI-DSS (ex: Stripe / Pagar.me / Cielo Token)
  const cardToken = `tok_pci_${brand}_${cleanNum.slice(-4)}_${Date.now()}`;

  const savedCard = userRepo.addSavedCard(userId || 'user-1', {
    cardHolder: cardHolder.toUpperCase().trim(),
    brand,
    last4: cleanNum.slice(-4),
    expiry,
    cardToken,
    isDefault: !!isDefault,
  });

  res.status(201).json({
    success: true,
    message: 'Cartão de crédito tokenizado e salvo com segurança!',
    card: savedCard,
  });
});

// ==========================================
// 4. ORDERS, CHECKOUT & REAL-TIME TRACKING
// ==========================================
api.get('/orders', (_req: Request, res: Response) => {
  const orders = orderRepo.findAll();
  res.json({ success: true, count: orders.length, orders });
});

api.get('/orders/:id', (req: Request, res: Response) => {
  const order = orderRepo.findById(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    return;
  }
  res.json({ success: true, order });
});

api.get('/tracking/:code', (req: Request, res: Response) => {
  const order = orderRepo.findByTrackingCode(req.params.code) || orderRepo.findById(req.params.code);
  if (!order) {
    res.status(404).json({
      success: false,
      error: 'Código de rastreamento não encontrado na base de entregas.',
    });
    return;
  }

  res.json({
    success: true,
    trackingCode: order.trackingCode,
    carrier: order.carrier,
    status: order.status,
    customerName: order.customerName,
    shippingAddress: order.shippingAddress,
    timeline: order.trackingTimeline,
    items: order.items,
  });
});

api.post('/orders', (req: Request, res: Response) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    items,
    shippingAddress,
    shippingFee,
    discount,
    paymentMethod,
    cardLast4,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'O carrinho está vazio' });
    return;
  }

  if (!customerName || !customerEmail || !customerPhone) {
    res.status(400).json({ success: false, error: 'Dados do cliente incompletos' });
    return;
  }

  // 1. Validação e Baixa em Tempo Real de Estoque
  for (const item of items) {
    const stockStatus = productRepo.checkStock(item.productId, item.size, item.color);
    if (!stockStatus.available) {
      res.status(400).json({
        success: false,
        error: `A peça "${item.productName}" no tamanho ${item.size} / cor ${item.color} está esgotada no ateliê!`,
      });
      return;
    }

    const decremented = productRepo.decrementStock(
      item.productId,
      item.size,
      item.color,
      item.quantity
    );

    if (!decremented) {
      res.status(400).json({
        success: false,
        error: `Estoque insuficiente para a quantidade solicitada de "${item.productName}".`,
      });
      return;
    }
  }

  // 2. Cálculo dos valores
  const subtotal = items.reduce(
    (sum: number, it: { unitPrice: number; quantity: number }) => sum + it.unitPrice * it.quantity,
    0
  );
  const finalShipping = shippingFee !== undefined ? Number(shippingFee) : 18.5;
  const finalDiscount = discount !== undefined ? Number(discount) : 0;
  const total = Math.max(0, subtotal + finalShipping - finalDiscount);

  // 3. Geração do Código de Rastreamento Único Padrão Transportadora
  const randomTrackingNumber = Math.floor(10000000 + Math.random() * 90000000);
  const trackingCode = `VB${randomTrackingNumber}BR`;
  const carrier = 'Correios Sedex Expresso';

  const defaultAddress = shippingAddress || {
    id: `addr-${Date.now()}`,
    street: 'Rua das Camélias',
    number: '120',
    neighborhood: 'Jardins',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01420-000',
  };

  const nowFormatted = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 4. Criação do Pedido
  const newOrder = orderRepo.create({
    customerName,
    customerEmail,
    customerPhone,
    items,
    subtotal,
    shippingFee: finalShipping,
    discount: finalDiscount,
    total,
    paymentMethod: paymentMethod || 'credit_card',
    paymentStatus: 'paid',
    cardLast4: cardLast4 || '8842',
    status: 'em_producao_corte',
    trackingCode,
    carrier,
    shippingAddress: defaultAddress,
    trackingTimeline: [
      {
        status: 'Pedido Confirmado',
        description: 'Pagamento aprovado e pedido recebido pelo setor de corte e confecção.',
        location: 'Ateliê VesteBem - Polo Têxtil/SP',
        timestamp: nowFormatted,
      },
    ],
  });

  // 5. Disparo AUTOMÁTICO de Código de Rastreio via E-MAIL
  notificationRepo.create({
    channel: 'email',
    recipient: customerEmail,
    subject: `Confirmação de Pedido #${newOrder.id} e Código de Rastreio - Ateliê VesteBem`,
    message: `Olá, ${customerName}!\n\nSeu pedido #${newOrder.id} no Ateliê VesteBem foi aprovado com sucesso! Já iniciamos a separação e controle de qualidade das peças.\n\n🚚 Código de Rastreamento: ${trackingCode}\n📦 Transportadora: ${carrier}\n💰 Total: R$ ${total.toFixed(2)}\n\nAcompanhe seu pacote em tempo real em nossa loja.`,
    type: 'order_tracking',
    status: 'delivered',
  });

  // 6. Disparo AUTOMÁTICO de Código de Rastreio via WHATSAPP
  notificationRepo.create({
    channel: 'whatsapp',
    recipient: customerPhone,
    message: `🧵 Ateliê VesteBem: Parabéns ${customerName}! Seu pedido #${newOrder.id} foi aprovado.\n\nCódigo de Rastreamento: *${trackingCode}* (${carrier}). Você pode rastrear diretamente pelo nosso WhatsApp enviando "Onde está meu pedido?".`,
    type: 'order_tracking',
    status: 'delivered',
  });

  res.status(201).json({
    success: true,
    message: 'Pedido realizado com sucesso! Estoque atualizado e código de rastreio emitido.',
    order: newOrder,
  });
});

api.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status, description, location } = req.body;
  const order = orderRepo.findById(req.params.id);

  if (!order) {
    res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    return;
  }

  const nowFormatted = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const updated = orderRepo.updateStatus(req.params.id, status, {
    status: status.replace(/_/g, ' ').toUpperCase(),
    description: description || `Status atualizado para ${status}`,
    location: location || 'Centro de Distribuição Têxtil / SP',
    timestamp: nowFormatted,
  });

  // Notifica automaticamente o cliente sobre o novo status
  if (updated) {
    notificationRepo.create({
      channel: 'whatsapp',
      recipient: updated.customerPhone,
      message: `🔔 Atualização do seu pedido #${updated.id}: ${description || status}. Rastreio: ${updated.trackingCode}.`,
      type: 'order_tracking',
      status: 'delivered',
    });
  }

  res.json({ success: true, order: updated });
});

// ==========================================
// 5. GOOGLE ADK & WHATSAPP CHAT
// ==========================================
api.post('/adk/chat', async (req: Request, res: Response) => {
  const { conversationId, customerPhone, customerName, text, channel } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({ success: false, error: 'Mensagem vazia' });
    return;
  }

  const conv = supportRepo.getOrCreateConversation(
    (channel as 'whatsapp' | 'web') || 'whatsapp',
    customerPhone || '+55 11 98765-4321',
    customerName || 'Cliente VesteBem'
  );

  // Adiciona a mensagem do usuário no repositório
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  supportRepo.addMessage(conv.id, {
    conversationId: conv.id,
    sender: 'user',
    text,
    timestamp: now,
  });

  try {
    const result = await adkAgent.processMessage({
      conversationId: conv.id,
      customerPhone: conv.customerPhone,
      customerName: conv.customerName,
      text,
    });

    // Registra a resposta do agente
    const agentMsg = supportRepo.addMessage(conv.id, {
      conversationId: conv.id,
      sender: 'agent_adk',
      text: result.reply,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      toolCallsExecuted: result.toolsExecuted,
      intentDetected: result.intent,
    });

    res.json({
      success: true,
      conversationId: conv.id,
      reply: result.reply,
      toolsExecuted: result.toolsExecuted,
      intent: result.intent,
      isHumanEscalated: result.isHumanEscalated,
      status: conv.status,
      message: agentMsg,
    });
  } catch (err: unknown) {
    console.error('Error processing ADK message:', err);
    res.status(500).json({
      success: false,
      error: 'Falha ao processar mensagem com o Agente ADK',
    });
  }
});

api.get('/adk/conversations', (_req: Request, res: Response) => {
  const conversations = supportRepo.getAllConversations();
  const humanQueue = supportRepo.getAllPendingHumanEscalations();
  res.json({
    success: true,
    total: conversations.length,
    humanQueueCount: humanQueue.length,
    conversations,
  });
});

api.get('/adk/conversations/:id', (req: Request, res: Response) => {
  const conv = supportRepo.getConversation(req.params.id);
  if (!conv) {
    res.status(404).json({ success: false, error: 'Conversa não encontrada' });
    return;
  }
  res.json({ success: true, conversation: conv });
});

api.post('/adk/human-reply', (req: Request, res: Response) => {
  const { conversationId, agentName, text } = req.body;

  if (!conversationId || !text) {
    res.status(400).json({ success: false, error: 'Dados incompletos' });
    return;
  }

  const conv = supportRepo.getConversation(conversationId);
  if (!conv) {
    res.status(404).json({ success: false, error: 'Conversa não encontrada' });
    return;
  }

  const msg = supportRepo.addMessage(conversationId, {
    conversationId,
    sender: 'human_agent',
    text,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  });

  supportRepo.updateStatus(
    conversationId,
    'EM_ATENDIMENTO_HUMANO',
    undefined,
    agentName || 'Consultor Humano'
  );

  res.json({ success: true, message: msg });
});

api.post('/adk/resolve', (req: Request, res: Response) => {
  const { conversationId } = req.body;
  const updated = supportRepo.updateStatus(conversationId, 'FINALIZADO');
  res.json({ success: true, conversation: updated });
});

// ==========================================
// 6. NOTIFICATIONS & EXCHANGES ENDPOINTS
// ==========================================
api.get('/notifications', (req: Request, res: Response) => {
  const recipient = req.query.recipient as string;
  const notifications = recipient
    ? notificationRepo.findByRecipient(recipient)
    : notificationRepo.findAll();
  res.json({ success: true, count: notifications.length, notifications });
});

api.get('/exchanges', (_req: Request, res: Response) => {
  const list = exchangeRepo.findAll();
  res.json({ success: true, count: list.length, exchanges: list });
});

api.post('/exchanges', (req: Request, res: Response) => {
  const { orderId, customerPhone, itemDescription, reason, preferredAction, targetSize } = req.body;
  const result = EnvironmentToolset.requestExchangeOrReturn({
    orderId,
    customerPhone,
    itemDescription,
    reason,
    preferredAction,
    targetSize,
  });
  res.status(201).json({ success: true, result });
});

export default api;
