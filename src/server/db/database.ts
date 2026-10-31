import {
  Product,
  User,
  Order,
  SupportConversation,
  NotificationLog,
  ExchangeRequest,
} from './types.ts';
import bcrypt from 'bcryptjs';

export class MemoryDatabase {
  public products: Product[] = [];
  public users: User[] = [];
  public orders: Order[] = [];
  public conversations: SupportConversation[] = [];
  public notifications: NotificationLog[] = [];
  public exchangeRequests: ExchangeRequest[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Initial Products
    this.products = [
      {
        id: 'prod-1',
        name: 'Vestido Midi Floral Primavera',
        slug: 'vestido-midi-floral-primavera',
        category: 'Feminino',
        description: 'Vestido midi em crepe fluido com estampa floral botânica exclusiva, decote em V sutil e fenda suave. Tecido de alta respirabilidade e acabamento de alfaiataria fina.',
        composition: '96% Crepe de Viscose, 4% Elastano (Toque de Seda)',
        careInstructions: 'Lavar à mão ou ciclo delicado com sabão neutro. Passar a ferro em temperatura branda.',
        price: 289.90,
        originalPrice: 349.90,
        imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        ],
        rating: 4.9,
        reviewCount: 42,
        tags: ['floral', 'vestido', 'primavera', 'elegante', 'festa'],
        sizes: ['PP', 'P', 'M', 'G', 'GG'],
        colors: [
          { name: 'Floral Azul Sereno', hex: '#6b9080' },
          { name: 'Floral Rosa Chá', hex: '#e8b4b8' },
        ],
        variants: [
          { id: 'v1-pp-azul', size: 'PP', color: 'Floral Azul Sereno', stock: 5, sku: 'VMF-PP-AZ' },
          { id: 'v1-p-azul', size: 'P', color: 'Floral Azul Sereno', stock: 8, sku: 'VMF-P-AZ' },
          { id: 'v1-m-azul', size: 'M', color: 'Floral Azul Sereno', stock: 12, sku: 'VMF-M-AZ' },
          { id: 'v1-g-azul', size: 'G', color: 'Floral Azul Sereno', stock: 9, sku: 'VMF-G-AZ' }, // explicitly stocked for agent testing!
          { id: 'v1-gg-azul', size: 'GG', color: 'Floral Azul Sereno', stock: 4, sku: 'VMF-GG-AZ' },
          { id: 'v1-p-rosa', size: 'P', color: 'Floral Rosa Chá', stock: 6, sku: 'VMF-P-RS' },
          { id: 'v1-m-rosa', size: 'M', color: 'Floral Rosa Chá', stock: 10, sku: 'VMF-M-RS' },
          { id: 'v1-g-rosa', size: 'G', color: 'Floral Rosa Chá', stock: 7, sku: 'VMF-G-RS' },
        ],
        totalStock: 61,
        featured: true,
      },
      {
        id: 'prod-2',
        name: 'Camiseta Básica Premium Algodão Egípcio',
        slug: 'camiseta-basica-premium-algodao-egipcio',
        category: 'Masculino',
        description: 'Camiseta com modelagem regular fit confeccionada em legítimo algodão egípcio de fibra longa. Toque aveludado, gola pespontada que não deforma e tingimento reativo que não desbota.',
        composition: '100% Algodão Egípcio Certificado (Fio 40.1 Penteado)',
        careInstructions: 'Lavar em água fria. Não utilizar alvejante. Secagem em varal à sombra.',
        price: 119.90,
        originalPrice: 149.00,
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        ],
        rating: 4.8,
        reviewCount: 95,
        tags: ['camiseta', 'algodao egipcio', 'basica', 'masculino'],
        sizes: ['P', 'M', 'G', 'GG'],
        colors: [
          { name: 'Branco Óptico', hex: '#FFFFFF' },
          { name: 'Preto Noite', hex: '#111827' },
          { name: 'Verde Militar', hex: '#4b5548' },
        ],
        variants: [
          { id: 'v2-p-br', size: 'P', color: 'Branco Óptico', stock: 14, sku: 'CBP-P-BR' },
          { id: 'v2-m-br', size: 'M', color: 'Branco Óptico', stock: 20, sku: 'CBP-M-BR' },
          { id: 'v2-g-br', size: 'G', color: 'Branco Óptico', stock: 18, sku: 'CBP-G-BR' },
          { id: 'v2-gg-br', size: 'GG', color: 'Branco Óptico', stock: 8, sku: 'CBP-GG-BR' },
          { id: 'v2-p-pt', size: 'P', color: 'Preto Noite', stock: 12, sku: 'CBP-P-PT' },
          { id: 'v2-m-pt', size: 'M', color: 'Preto Noite', stock: 22, sku: 'CBP-M-PT' },
          { id: 'v2-g-pt', size: 'G', color: 'Preto Noite', stock: 16, sku: 'CBP-G-PT' },
        ],
        totalStock: 110,
        featured: true,
      },
      {
        id: 'prod-3',
        name: 'Blazer Estruturado em Puro Linho Italiano',
        slug: 'blazer-estruturado-puro-linho-italiano',
        category: 'Alfaiataria',
        description: 'Corte de alfaiataria sartorial clássica com forro interno acetinado em meia-costa, ombreiras leves e botões de casca de coco natural. Caimento impecável para ocasiões casuais e executivas.',
        composition: '100% Linho Puro Rústico Desfibrado | Forro 100% Acetato Respirável',
        careInstructions: 'Lavagem a seco profissional. Não centrifugar.',
        price: 499.00,
        originalPrice: 620.00,
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        ],
        rating: 5.0,
        reviewCount: 31,
        tags: ['blazer', 'alfaiataria', 'linho', 'luxo', 'casaco'],
        sizes: ['P', 'M', 'G', 'GG'],
        colors: [
          { name: 'Areia Natural', hex: '#d9cdb8' },
          { name: 'Azul Marinho Real', hex: '#1e293b' },
        ],
        variants: [
          { id: 'v3-p-ar', size: 'P', color: 'Areia Natural', stock: 4, sku: 'BLZ-P-AR' },
          { id: 'v3-m-ar', size: 'M', color: 'Areia Natural', stock: 9, sku: 'BLZ-M-AR' },
          { id: 'v3-g-ar', size: 'G', color: 'Areia Natural', stock: 5, sku: 'BLZ-G-AR' },
          { id: 'v3-gg-ar', size: 'GG', color: 'Areia Natural', stock: 2, sku: 'BLZ-GG-AR' },
          { id: 'v3-m-mar', size: 'M', color: 'Azul Marinho Real', stock: 6, sku: 'BLZ-M-MAR' },
        ],
        totalStock: 26,
        featured: true,
      },
      {
        id: 'prod-4',
        name: 'Calça Pantalona Cintura Alta com Prega',
        slug: 'calca-pantalona-cintura-alta-com-prega',
        category: 'Alfaiataria',
        description: 'Design contemporâneo com cintura alta estruturada, passantes largos para cinto e caimento fluído em crepe encorpado. Bolsos faca funcionais e acabamento em barra invisível.',
        composition: '92% Poliéster Premium de Alta Densidade, 8% Spandex',
        careInstructions: 'Ciclo suave de lavagem. Secar à sombra.',
        price: 249.90,
        imageUrl: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
        ],
        rating: 4.7,
        reviewCount: 28,
        tags: ['calca', 'pantalona', 'alfaiataria', 'feminino'],
        sizes: ['36', '38', '40', '42', '44'],
        colors: [
          { name: 'Terracota Warm', hex: '#b85d43' },
          { name: 'Off-White Puro', hex: '#f4f1ea' },
          { name: 'Preto Clássico', hex: '#1c1c1c' },
        ],
        variants: [
          { id: 'v4-38-tc', size: '38', color: 'Terracota Warm', stock: 7, sku: 'CP-38-TC' },
          { id: 'v4-40-tc', size: '40', color: 'Terracota Warm', stock: 11, sku: 'CP-40-TC' },
          { id: 'v4-42-tc', size: '42', color: 'Terracota Warm', stock: 5, sku: 'CP-42-TC' },
          { id: 'v4-38-ow', size: '38', color: 'Off-White Puro', stock: 8, sku: 'CP-38-OW' },
          { id: 'v4-40-ow', size: '40', color: 'Off-White Puro', stock: 10, sku: 'CP-40-OW' },
        ],
        totalStock: 41,
        featured: false,
      },
      {
        id: 'prod-5',
        name: 'Camisa Social Maquinetada Slim Fit',
        slug: 'camisa-social-maquinetada-slim-fit',
        category: 'Masculino',
        description: 'Camisa masculina em padronagem maquinetada geométrica sutil, colarinho italiano com barbatana removível e punho chanfrado com dois botões de ajuste.',
        composition: '100% Algodão Fio Nobre 60 (Tecido Easy Iron - Passa Fácil)',
        careInstructions: 'Lavar à máquina até 40°C. Centrifugação curta.',
        price: 189.90,
        imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        ],
        rating: 4.9,
        reviewCount: 39,
        tags: ['camisa', 'social', 'slim', 'algodao', 'masculino'],
        sizes: ['1', '2', '3', '4', '5'],
        colors: [
          { name: 'Azul Claro Geométrico', hex: '#b0c4de' },
          { name: 'Branco Maquinetado', hex: '#ffffff' },
        ],
        variants: [
          { id: 'v5-2-az', size: '2', color: 'Azul Claro Geométrico', stock: 12, sku: 'CS-2-AZ' },
          { id: 'v5-3-az', size: '3', color: 'Azul Claro Geométrico', stock: 15, sku: 'CS-3-AZ' },
          { id: 'v5-4-az', size: '4', color: 'Azul Claro Geométrico', stock: 9, sku: 'CS-4-AZ' },
        ],
        totalStock: 36,
        featured: false,
      },
      {
        id: 'prod-6',
        name: 'Conjunto Uniforme Corporativo Alfaiataria',
        slug: 'conjunto-uniforme-corporativo-alfaiataria',
        category: 'Uniformes',
        description: 'Linha corporativa desenvolvida para equipes executivas, clínicas e hotéis de alto padrão. Tecido bi-stretch de alta durabilidade, antiamassamento e retenção de cor.',
        composition: '70% Poliéster Tecnológico, 28% Viscose, 2% Elastano',
        careInstructions: 'Lavagem industrial ou doméstica prática. Secagem ultra rápida.',
        price: 329.00,
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        ],
        rating: 5.0,
        reviewCount: 19,
        tags: ['uniforme', 'corporativo', 'empresa', 'confeccao industrial'],
        sizes: ['P', 'M', 'G', 'GG'],
        colors: [
          { name: 'Cinza Chumbo Nobre', hex: '#374151' },
          { name: 'Azul Corporativo', hex: '#1e3a8a' },
        ],
        variants: [
          { id: 'v6-p-ch', size: 'P', color: 'Cinza Chumbo Nobre', stock: 25, sku: 'UNI-P-CH' },
          { id: 'v6-m-ch', size: 'M', color: 'Cinza Chumbo Nobre', stock: 35, sku: 'UNI-M-CH' },
          { id: 'v6-g-ch', size: 'G', color: 'Cinza Chumbo Nobre', stock: 30, sku: 'UNI-G-CH' },
        ],
        totalStock: 90,
        featured: false,
      },
    ];

    // 2. Initial Users
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('vestebem123', salt);

    this.users = [
      {
        id: 'user-1',
        name: 'Maria Fernanda Silva',
        email: 'maria.silva@exemplo.com.br',
        phone: '11987654321',
        passwordHash: demoPasswordHash,
        role: 'customer',
        twoFactorEnabled: true,
        twoFactorMethod: 'both',
        savedCards: [
          {
            id: 'card-1',
            cardHolder: 'MARIA F SILVA',
            brand: 'mastercard',
            last4: '8842',
            expiry: '09/29',
            cardToken: 'tok_pci_master_8842_x9183',
            isDefault: true,
            createdAt: new Date().toISOString(),
          },
        ],
        addresses: [
          {
            id: 'addr-1',
            street: 'Alameda Santos',
            number: '1470',
            complement: 'Apt 82',
            neighborhood: 'Cerqueira César',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01418-100',
          },
        ],
        createdAt: '2026-01-15T10:00:00.000Z',
      },
      {
        id: 'user-admin',
        name: 'Carlos Oliveira (Gerente do Ateliê)',
        email: 'gerencia@vestebemconfeccao.com.br',
        phone: '11999998888',
        passwordHash: demoPasswordHash,
        role: 'admin',
        twoFactorEnabled: true,
        twoFactorMethod: 'email',
        savedCards: [],
        addresses: [],
        createdAt: '2025-11-01T08:00:00.000Z',
      },
    ];

    // 3. Initial Orders (including the order for exchange/tracking tests)
    this.orders = [
      {
        id: 'ORD-7821',
        customerName: 'Maria Fernanda Silva',
        customerEmail: 'maria.silva@exemplo.com.br',
        customerPhone: '11987654321',
        items: [
          {
            productId: 'prod-2',
            productName: 'Camiseta Básica Premium Algodão Egípcio',
            size: 'P',
            color: 'Branco Óptico',
            quantity: 1,
            unitPrice: 119.90,
            imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          },
        ],
        subtotal: 119.90,
        shippingFee: 15.00,
        discount: 0,
        total: 134.90,
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        cardLast4: '8842',
        status: 'entregue',
        trackingCode: 'VB849201832BR',
        carrier: 'Correios Sedex Expresso',
        shippingAddress: {
          id: 'addr-ord-1',
          street: 'Alameda Santos',
          number: '1470',
          neighborhood: 'Cerqueira César',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01418-100',
        },
        trackingTimeline: [
          {
            status: 'Pedido Postado',
            description: 'Objeto postado na agência central de confecção',
            location: 'São Paulo / SP - Polo Têxtil',
            timestamp: '2026-10-24 10:15',
          },
          {
            status: 'Em Trânsito',
            description: 'Objeto em trânsito para Centro de Distribuição',
            location: 'São Paulo / SP - CTE Jaguaré',
            timestamp: '2026-10-25 04:30',
          },
          {
            status: 'Saiu para Entrega',
            description: 'Objeto saiu para entrega ao destinatário',
            location: 'São Paulo / SP - CDD Jardins',
            timestamp: '2026-10-26 09:10',
          },
          {
            status: 'Objeto Entregue',
            description: 'Objeto entregue ao destinatário com sucesso',
            location: 'São Paulo / SP',
            timestamp: '2026-10-26 14:22',
          },
        ],
        createdAt: '2026-10-23T14:20:00.000Z',
        updatedAt: '2026-10-26T14:22:00.000Z',
      },
      {
        id: 'ORD-9042',
        customerName: 'Rodrigo Medeiros',
        customerEmail: 'rodrigo.m@exemplo.com.br',
        customerPhone: '11977771234',
        items: [
          {
            productId: 'prod-3',
            productName: 'Blazer Estruturado em Puro Linho Italiano',
            size: 'M',
            color: 'Areia Natural',
            quantity: 1,
            unitPrice: 499.00,
            imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
          },
        ],
        subtotal: 499.00,
        shippingFee: 0,
        discount: 49.90,
        total: 449.10,
        paymentMethod: 'pix',
        paymentStatus: 'paid',
        status: 'em_transporte',
        trackingCode: 'VB991823741BR',
        carrier: 'Loggi Express Premium',
        shippingAddress: {
          id: 'addr-ord-2',
          street: 'Rua Bela Cintra',
          number: '800',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01415-000',
        },
        trackingTimeline: [
          {
            status: 'Confeccionado & Embalado',
            description: 'Peça conferida pelo controle de qualidade do ateliê',
            location: 'Ateliê VesteBem - São Paulo/SP',
            timestamp: '2026-10-29 11:00',
          },
          {
            status: 'Em Transporte',
            description: 'Motorista em rota de entrega prioritária',
            location: 'Base Loggi Centro - São Paulo/SP',
            timestamp: '2026-10-30 08:45',
          },
        ],
        createdAt: '2026-10-28T09:12:00.000Z',
        updatedAt: '2026-10-30T08:45:00.000Z',
      },
    ];

    // 4. Initial Notifications
    this.notifications = [
      {
        id: 'notif-1',
        channel: 'whatsapp',
        recipient: '+55 11 98765-4321',
        message: '🛍️ Ateliê VesteBem: Seu pedido #ORD-7821 foi postado! Acompanhe pelo código de rastreio VB849201832BR.',
        type: 'order_tracking',
        status: 'delivered',
        createdAt: '2026-10-24T10:16:00.000Z',
      },
      {
        id: 'notif-2',
        channel: 'email',
        recipient: 'maria.silva@exemplo.com.br',
        subject: 'Código de Rastreamento - Pedido #ORD-7821 Ateliê VesteBem',
        message: 'Olá Maria! Seu pedido de confecção está a caminho. Transportadora: Correios Sedex Expresso. Código: VB849201832BR.',
        type: 'order_tracking',
        status: 'delivered',
        createdAt: '2026-10-24T10:16:00.000Z',
      },
    ];

    // 5. Initial Support Conversations
    this.conversations = [
      {
        id: 'conv-demo-1',
        channel: 'whatsapp',
        customerPhone: '+55 11 98765-4321',
        customerName: 'Maria Fernanda Silva',
        customerEmail: 'maria.silva@exemplo.com.br',
        status: 'BOT_ADK',
        createdAt: '2026-10-30T14:00:00.000Z',
        updatedAt: '2026-10-30T14:05:00.000Z',
        messages: [
          {
            id: 'm-1',
            conversationId: 'conv-demo-1',
            sender: 'agent_adk',
            text: 'Olá! Sou o Assistente Inteligente do Ateliê & Confecção VesteBem. Como posso te ajudar hoje? (Consulte estoque, rastreie pedidos, solicite trocas ou tire dúvidas de alfaiataria)',
            timestamp: '2026-10-30 14:00',
          },
        ],
      },
    ];
  }
}

// Global in-memory singleton
export const db = new MemoryDatabase();
