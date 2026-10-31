import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Filter,
  MessageCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
} from 'lucide-react';
import { Product, CartItem, User, Order } from './types.ts';
import { fetchProducts, fetchConversations, fetchNotifications } from './services/api.ts';
import { Header } from './components/Header.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderTrackerView } from './components/OrderTrackerView.tsx';
import { WhatsAppAdkWidget } from './components/WhatsAppAdkWidget.tsx';
import { HumanSupportDashboard } from './components/HumanSupportDashboard.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { NotificationCenterModal } from './components/NotificationCenterModal.tsx';
import { CompanyInfoSection } from './components/CompanyInfoSection.tsx';
import { StockManagementModal } from './components/StockManagementModal.tsx';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<string>('catalogo');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [sizeFilter, setSizeFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      productId: 'prod-2',
      productName: 'Camiseta Básica Premium Algodão Egípcio',
      size: 'P',
      color: 'Branco Óptico',
      quantity: 1,
      unitPrice: 119.9,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      maxStock: 14,
    },
  ]);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isSupportDashboardOpen, setIsSupportDashboardOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-1',
    name: 'Maria Fernanda Silva',
    email: 'maria.silva@exemplo.com.br',
    phone: '11987654321',
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
      },
    ],
  });

  // Real-time Badge Counters
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(2);
  const [pendingHumanEscalationsCount, setPendingHumanEscalationsCount] = useState<number>(0);
  const [checkoutShipping, setCheckoutShipping] = useState<number>(18.5);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);

  // Load Products & Badges
  const loadData = async () => {
    try {
      setLoading(true);
      const prodList = await fetchProducts();
      setProducts(prodList);

      const convs = await fetchConversations();
      setPendingHumanEscalationsCount(convs.humanQueueCount);

      const notifs = await fetchNotifications();
      setUnreadNotificationsCount(notifs.length);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    if (activeTab === 'feminino' && p.category.toLowerCase() !== 'feminino') return false;
    if (activeTab === 'masculino' && p.category.toLowerCase() !== 'masculino') return false;
    if (activeTab === 'alfaiataria' && p.category.toLowerCase() !== 'alfaiataria') return false;

    if (categoryFilter !== 'Todos' && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }

    if (sizeFilter !== 'Todos' && !p.sizes.includes(sizeFilter)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.composition.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Cart Actions
  const handleAddToCart = (product: Product, size: string, color: string, quantity: number) => {
    const variant = product.variants.find(
      (v) => v.size.toLowerCase() === size.toLowerCase() && v.color.toLowerCase() === color.toLowerCase()
    );
    const maxStock = variant ? variant.stock : product.totalStock;

    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.productId === product.id && it.size === size && it.color === color
      );
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id && it.size === size && it.color === color
            ? { ...it, quantity: Math.min(maxStock, it.quantity + quantity) }
            : it
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          size,
          color,
          quantity,
          unitPrice: product.price,
          imageUrl: product.imageUrl,
          maxStock,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, size: string, color: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.productId === productId && it.size === size && it.color === color
          ? { ...it, quantity: qty }
          : it
      )
    );
  };

  const handleRemoveCartItem = (productId: string, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter(
        (it) => !(it.productId === productId && it.size === size && it.color === color)
      )
    );
  };

  const handleProceedToCheckout = (shipping: number, discount: number) => {
    setCheckoutShipping(shipping);
    setCheckoutDiscount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (_order: Order) => {
    setCartItems([]);
    loadData();
  };

  const cartTotalCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* 1. TOP HEADER */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSupportDashboard={() => setIsSupportDashboardOpen(true)}
        user={currentUser}
        onLogout={() => setCurrentUser(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadNotificationsCount={unreadNotificationsCount}
        pendingHumanEscalationsCount={pendingHumanEscalationsCount}
      />

      {/* 2. BODY CONTENT ROUTING */}
      <main className="flex-1">
        {/* RASTREAMENTO VIEW */}
        {activeTab === 'rastreio' && (
          <OrderTrackerView
            onOpenWhatsAppWithCode={(code) => {
              setIsWhatsAppOpen(true);
            }}
          />
        )}

        {/* CONTATO & INSTITUCIONAL VIEW */}
        {activeTab === 'contato' && (
          <CompanyInfoSection onOpenWhatsApp={() => setIsWhatsAppOpen(true)} />
        )}

        {/* CATALOGO & COLECOES VIEW */}
        {(activeTab === 'catalogo' ||
          activeTab === 'feminino' ||
          activeTab === 'masculino' ||
          activeTab === 'alfaiataria') && (
          <div>
            {/* Editorial Hero Banner */}
            {activeTab === 'catalogo' && !searchQuery && (
              <HeroBanner
                onExplore={() => {
                  const el = document.getElementById('catalog-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
              />
            )}

            {/* Catalog Grid Section */}
            <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              {/* Section Header & Interactive Filter Bar */}
              <div className="space-y-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold tracking-wider uppercase text-stone-500 block mb-1">
                      {activeTab === 'feminino'
                        ? 'Coleção Vestidos & Moda Feminina'
                        : activeTab === 'masculino'
                        ? 'Camisaria & Algodão Egípcio Nobre'
                        : activeTab === 'alfaiataria'
                        ? 'Alfaiataria Sartorial & Puro Linho'
                        : 'Coleção Permanente & Peças de Ateliê'}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                      Peças de Confecção Própria ({filteredProducts.length})
                    </h2>
                  </div>

                  {/* Stock Management Link */}
                  <button
                    onClick={() => setIsStockModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-stone-600" />
                    Inspecionar Estoque em Tempo Real
                  </button>
                </div>

                {/* Filter Controls (Segmented Tabs complying with Zero-Pill discipline) */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-stone-100/70 border border-stone-200 rounded-xl">
                  {/* Category Segmented Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto text-xs">
                    <span className="text-stone-400 font-medium mr-1 text-[11px] hidden sm:inline">
                      Categoria:
                    </span>
                    {['Todos', 'Feminino', 'Masculino', 'Alfaiataria', 'Uniformes'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          categoryFilter === cat
                            ? 'bg-white text-stone-900 shadow-xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Size Filter Segmented */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-stone-400 font-medium mr-1 text-[11px] hidden sm:inline">
                      Tamanho:
                    </span>
                    {['Todos', 'PP', 'P', 'M', 'G', 'GG'].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSizeFilter(sz)}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          sizeFilter === sz
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Display */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-96 rounded-xl bg-stone-200 animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <p className="text-stone-500 text-sm">
                    Nenhuma peça encontrada com os filtros selecionados.
                  </p>
                  <button
                    onClick={() => {
                      setCategoryFilter('Todos');
                      setSizeFilter('Todos');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                      onQuickAdd={(p) => handleAddToCart(p, p.sizes[0] || 'M', p.colors[0]?.name || '', 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="bg-stone-900 text-stone-300 pt-14 pb-8 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <span className="font-serif text-xl font-bold text-white block">
                VESTEBEM ATELIÊ
              </span>
              <p className="text-stone-400 text-xs leading-relaxed font-light">
                Confecção de vestuário nobre, corte de alfaiataria fina, linhos rústicos e algodão egípcio com suporte automatizado via Google ADK e atendimento humano especializado.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                Canais do Ateliê
              </span>
              <ul className="space-y-1.5 text-stone-400">
                <li>Endereço: Rua das Rendeiras, 850 · SP</li>
                <li>Telefone: (11) 3456-7890</li>
                <li>SAC: 0800 770 1234</li>
                <li>WhatsApp Oficial: (11) 98765-4321</li>
                <li>E-mail: contato@vestebemconfeccao.com.br</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                Políticas & Segurança
              </span>
              <ul className="space-y-1.5 text-stone-400">
                <li>1ª Troca Grátis sem burocracia</li>
                <li>Tokenização de Cartão (PCI-DSS)</li>
                <li>Autenticação Multifator (2FA)</li>
                <li>Rastreamento Integrado aos Correios/Loggi</li>
                <li>Conformidade com LGPD</li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                Atendimento Inteligente
              </span>
              <p className="text-stone-400 text-xs">
                Nosso Agente ADK no WhatsApp consulta estoque e pedidos 24h por dia, com transbordo automático para alfaiates humanos quando necessário.
              </p>
              <button
                onClick={() => setIsWhatsAppOpen(true)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Iniciar Conversa no WhatsApp
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <span>© 2026 Ateliê & Confecção VesteBem. Todos os direitos reservados.</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsStockModalOpen(true)} className="hover:text-stone-300">
                Gestão de Estoque
              </button>
              <span>·</span>
              <button onClick={() => setIsSupportDashboardOpen(true)} className="hover:text-stone-300">
                Painel do Atendente Humano
              </button>
              <span>·</span>
              <button onClick={() => setIsNotificationsOpen(true)} className="hover:text-stone-300">
                Disparos SMS/E-mail
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Floating WhatsApp ADK Button */}
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="relative group p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          title="Falar com o Agente ADK no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400" />
          </span>
          <span className="hidden sm:inline-block absolute right-full mr-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Suporte ADK no WhatsApp
          </span>
        </button>
      </div>

      {/* 5. MODAL DIALOGS */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        shippingFee={checkoutShipping}
        discount={checkoutDiscount}
        user={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      <WhatsAppAdkWidget
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        customerName={currentUser?.name || 'Maria Fernanda Silva'}
        customerPhone={currentUser?.phone || '+55 11 98765-4321'}
      />

      <HumanSupportDashboard
        isOpen={isSupportDashboardOpen}
        onClose={() => setIsSupportDashboardOpen(false)}
        onRefreshBadge={loadData}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={currentUser}
        onLoginSuccess={(u) => setCurrentUser(u)}
        onLogout={() => setCurrentUser(null)}
        onOpenNotifications={() => {
          setIsAuthOpen(false);
          setIsNotificationsOpen(true);
        }}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <StockManagementModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        products={products}
        onRefresh={loadData}
      />
    </div>
  );
}
