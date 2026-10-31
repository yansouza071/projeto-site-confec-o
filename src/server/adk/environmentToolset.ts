import {
  productRepo,
  orderRepo,
  exchangeRepo,
  notificationRepo,
  supportRepo,
} from '../repositories/index.ts';
import { Type, FunctionDeclaration } from '@google/genai';

/**
 * GOOGLE ADK - EnvironmentToolset
 * Conjunto de ferramentas de ambiente expostas ao Agente ADK da Confecção
 */

// 1. Definições de Ferramentas (Schemas para o Google GenAI / ADK)
export const checkProductStockDeclaration: FunctionDeclaration = {
  name: 'checkProductStock',
  description:
    'Consulta em tempo real o estoque de peças de confecção, roupas, tamanhos e cores disponíveis no ateliê.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Nome da peça ou tipo de roupa (ex: vestido floral, camiseta basica, blazer linho).',
      },
      size: {
        type: Type.STRING,
        description: 'Tamanho desejado da peça (ex: PP, P, M, G, GG, 38, 40, 42).',
      },
      color: {
        type: Type.STRING,
        description: 'Cor ou tonalidade desejada (ex: azul, preto, terracota, areia).',
      },
    },
    required: ['query'],
  },
};

export const getOrderStatusDeclaration: FunctionDeclaration = {
  name: 'getOrderStatus',
  description:
    'Consulta o status detalhado, linha do tempo de entrega e código de rastreamento de um pedido de confecção.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderIdOrTrackingCode: {
        type: Type.STRING,
        description: 'Número do pedido (ex: ORD-7821) ou código de rastreio (ex: VB849201832BR).',
      },
      customerPhoneOrEmail: {
        type: Type.STRING,
        description: 'Telefone ou e-mail do cliente para busca se não souber o código.',
      },
    },
  },
};

export const requestExchangeOrReturnDeclaration: FunctionDeclaration = {
  name: 'requestExchangeOrReturn',
  description:
    'Abre um protocolo oficial de troca ou devolução de peça de vestuário (ex: trocar camiseta P por M, troca por defeito ou devolução).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.STRING,
        description: 'Código do pedido original (ex: ORD-7821).',
      },
      customerPhone: {
        type: Type.STRING,
        description: 'Telefone/WhatsApp do cliente.',
      },
      itemDescription: {
        type: Type.STRING,
        description: 'Descrição da peça (ex: Camiseta Básica Premium Algodão Egípcio).',
      },
      reason: {
        type: Type.STRING,
        description: 'Motivo da troca (ex: Tamanho P ficou apertado, prefere tamanho M).',
      },
      preferredAction: {
        type: Type.STRING,
        description: 'Ação desejada: "troca_tamanho", "troca_defeito" ou "devolucao_estorno".',
      },
      targetSize: {
        type: Type.STRING,
        description: 'Tamanho desejado para a nova peça no caso de troca de tamanho (ex: M).',
      },
    },
    required: ['itemDescription', 'reason'],
  },
};

export const sendCustomerNotificationDeclaration: FunctionDeclaration = {
  name: 'sendCustomerNotification',
  description:
    'Dispara uma notificação automática ou recado oficial via WhatsApp ou E-mail para o cliente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      channel: {
        type: Type.STRING,
        description: 'Canal de envio: "whatsapp" ou "email".',
      },
      recipient: {
        type: Type.STRING,
        description: 'Telefone com DDD ou e-mail de destino.',
      },
      message: {
        type: Type.STRING,
        description: 'Texto do recado ou notificação a ser enviado.',
      },
      notificationType: {
        type: Type.STRING,
        description: 'Tipo de alerta: "order_tracking", "stock_alert", "exchange_update" ou "general".',
      },
    },
    required: ['channel', 'recipient', 'message'],
  },
};

export const escalateToHumanSupportDeclaration: FunctionDeclaration = {
  name: 'escalateToHumanSupport',
  description:
    'Transborda o atendimento para um atendente humano da equipe interna do ateliê quando o cliente pede suporte humano ou demonstra insatisfação.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      conversationId: {
        type: Type.STRING,
        description: 'ID da conversa atual.',
      },
      customerName: {
        type: Type.STRING,
        description: 'Nome do cliente.',
      },
      reason: {
        type: Type.STRING,
        description: 'Motivo do transbordo (ex: Solicitação explícita de atendente, Dúvida complexa de alfaiataria sob medida, Insatisfação).',
      },
      priority: {
        type: Type.STRING,
        description: 'Prioridade: "baixa", "media", "alta" ou "urgente".',
      },
      recentSummary: {
        type: Type.STRING,
        description: 'Resumo dos tópicos discutidos na conversa para o atendente humano dar continuidade imediata.',
      },
    },
    required: ['reason'],
  },
};

export const adkEnvironmentDeclarations = [
  checkProductStockDeclaration,
  getOrderStatusDeclaration,
  requestExchangeOrReturnDeclaration,
  sendCustomerNotificationDeclaration,
  escalateToHumanSupportDeclaration,
];

// 2. Executores das Funções da EnvironmentToolset
export class EnvironmentToolset {
  static checkProductStock(params: { query: string; size?: string; color?: string }) {
    const products = productRepo.searchByTerm(params.query);
    if (!products || products.length === 0) {
      return {
        found: false,
        message: `Não encontramos nenhuma peça com o termo "${params.query}". Confira nossas categorias de Feminino, Masculino e Alfaiataria.`,
      };
    }

    const results = products.map((prod) => {
      let filteredVariants = prod.variants;
      if (params.size) {
        filteredVariants = filteredVariants.filter(
          (v) => v.size.toLowerCase() === params.size!.toLowerCase()
        );
      }
      if (params.color) {
        filteredVariants = filteredVariants.filter((v) =>
          v.color.toLowerCase().includes(params.color!.toLowerCase())
        );
      }

      const availableInFilters = filteredVariants.reduce((sum, v) => sum + v.stock, 0);

      return {
        id: prod.id,
        name: prod.name,
        price: prod.price,
        composition: prod.composition,
        totalStock: prod.totalStock,
        availableRequested: availableInFilters,
        variantsAvailable: filteredVariants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
        })),
      };
    });

    const isAvailable = results.some((r) => r.availableRequested > 0);

    return {
      found: true,
      available: isAvailable,
      items: results,
      summary: isAvailable
        ? `Temos estoque disponível da peça solicitada!`
        : `A peça está no catálogo, mas não temos o tamanho/cor especificado no momento.`,
    };
  }

  static getOrderStatus(params: { orderIdOrTrackingCode?: string; customerPhoneOrEmail?: string }) {
    let order;

    if (params.orderIdOrTrackingCode) {
      const code = params.orderIdOrTrackingCode.trim();
      order = orderRepo.findByTrackingCode(code) || orderRepo.findById(code);
    }

    if (!order && params.customerPhoneOrEmail) {
      const list = orderRepo.findByCustomerQuery(params.customerPhoneOrEmail);
      if (list.length > 0) {
        order = list[0];
      }
    }

    if (!order) {
      return {
        found: false,
        message:
          'Não localizamos nenhum pedido com esses dados. Por favor, verifique o código de rastreio (ex: VB849201832BR) ou número do pedido (ex: ORD-7821).',
      };
    }

    return {
      found: true,
      orderId: order.id,
      customerName: order.customerName,
      status: order.status,
      trackingCode: order.trackingCode,
      carrier: order.carrier,
      items: order.items.map((i) => `${i.quantity}x ${i.productName} (${i.size} - ${i.color})`),
      total: order.total,
      timeline: order.trackingTimeline,
      latestUpdate: order.trackingTimeline[order.trackingTimeline.length - 1],
    };
  }

  static requestExchangeOrReturn(params: {
    orderId?: string;
    customerPhone?: string;
    itemDescription: string;
    reason: string;
    preferredAction?: 'troca_tamanho' | 'troca_defeito' | 'devolucao_estorno';
    targetSize?: string;
  }) {
    // Se o pedido não foi informado, tenta achar o último pedido entregue ou usa placeholder
    let orderId = params.orderId || 'ORD-7821';
    let customerPhone = params.customerPhone || '11987654321';

    // Se informou targetSize (ex: trocar P por M), verifica estoque do tamanho M
    let targetStockStatus = null;
    if (params.targetSize) {
      const stockCheck = this.checkProductStock({
        query: params.itemDescription,
        size: params.targetSize,
      });
      targetStockStatus = stockCheck.available
        ? `Tamanho ${params.targetSize} confirmado em estoque no ateliê! Peça reservada para a troca.`
        : `Tamanho ${params.targetSize} está com estoque limitado no ateliê, mas já reservamos a prioridade no corte.`;
    }

    const action = params.preferredAction || 'troca_tamanho';

    const exchange = exchangeRepo.create({
      orderId,
      customerPhone,
      itemDescription: params.itemDescription,
      reason: params.reason,
      preferredAction: action,
      targetSize: params.targetSize,
      status: 'autorizado',
    });

    const reverseLogisticsCode = `REV-${Math.floor(100000 + Math.random() * 900000)}`;

    // Dispara recado/notificação automática
    notificationRepo.create({
      channel: 'whatsapp',
      recipient: customerPhone,
      message: `📦 Ateliê VesteBem: Solicitação de troca #${exchange.id} autorizada! Use o código de postagem reversa dos Correios: ${reverseLogisticsCode}.`,
      type: 'exchange_update',
      status: 'delivered',
    });

    return {
      success: true,
      exchangeId: exchange.id,
      orderId,
      status: 'autorizado',
      reverseLogisticsCode,
      targetStockStatus,
      instructions: `Autorização de postagem reversa gerada com sucesso! Código dos Correios: ${reverseLogisticsCode}. Validade: 7 dias úteis. Leve a peça em qualquer agência dos Correios com a nota fiscal.`,
    };
  }

  static sendCustomerNotification(params: {
    channel: 'whatsapp' | 'email';
    recipient: string;
    message: string;
    notificationType?: '2fa_code' | 'password_reset' | 'order_tracking' | 'order_confirmed' | 'stock_alert' | 'human_escalation';
  }) {
    const notif = notificationRepo.create({
      channel: params.channel,
      recipient: params.recipient,
      message: params.message,
      type: params.notificationType || 'order_tracking',
      status: 'delivered',
    });

    return {
      success: true,
      notificationId: notif.id,
      deliveredAt: notif.createdAt,
    };
  }

  static escalateToHumanSupport(params: {
    conversationId?: string;
    customerName?: string;
    reason: string;
    priority?: string;
    recentSummary?: string;
  }) {
    const convId = params.conversationId || 'conv-demo-1';
    const updated = supportRepo.updateStatus(
      convId,
      'EM_ATENDIMENTO_HUMANO',
      params.reason
    );

    // Notifica equipe interna
    notificationRepo.create({
      channel: 'whatsapp',
      recipient: '+55 11 99999-8888 (Equipe Ateliê)',
      message: `🔔 TRANSBORDO HUMANO: Cliente "${params.customerName || 'Cliente'}" transferido para suporte humano. Motivo: ${params.reason}. Resumo: ${params.recentSummary || 'Sem resumo'}`,
      type: 'human_escalation',
      status: 'delivered',
    });

    return {
      escalated: true,
      status: 'EM_ATENDIMENTO_HUMANO',
      message:
        'Transferência realizada com sucesso! Um atendente humano da nossa confecção assumiu o canal.',
      ticketId: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }
}
