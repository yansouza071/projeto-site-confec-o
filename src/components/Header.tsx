import React from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  MessageCircle,
  Bell,
  Headphones,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { User } from '../types.ts';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenWhatsApp: () => void;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  onOpenSupportDashboard: () => void;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadNotificationsCount: number;
  pendingHumanEscalationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenWhatsApp,
  onOpenAuth,
  onOpenNotifications,
  onOpenSupportDashboard,
  user,
  onLogout,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  unreadNotificationsCount,
  pendingHumanEscalationsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Notification Bar */}
      <div className="bg-[#1e293b] text-stone-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Coleção Primavera/Verão & Alfaiataria Fina
            </span>
            <span className="hidden md:inline text-stone-400">·</span>
            <span className="hidden md:flex items-center gap-1 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              Polo Têxtil - São Paulo / SP
            </span>
            <span className="hidden md:inline text-stone-400">·</span>
            <span className="hidden md:flex items-center gap-1 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Seg-Sex 08h-18h | Sáb 09h-14h (ADK IA 24h)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWhatsApp}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Oficial: (11) 98765-4321
            </button>
            <span className="text-stone-500">|</span>
            <button
              onClick={() => setActiveTab('contato')}
              className="text-stone-300 hover:text-white transition-colors"
            >
              SAC: 0800 770 1234
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('catalogo')}
            className="cursor-pointer flex flex-col group"
          >
            <span className="text-2xl sm:text-3xl font-serif tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              VESTEBEM
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-stone-500 font-semibold -mt-1">
              Ateliê & Confecção Própria
            </span>
          </div>

          {/* Search Box */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vestidos, alfaiataria, linho, algodão egípcio..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-100 hover:bg-stone-50 focus:bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-800 transition-all placeholder:text-stone-400 text-stone-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp ADK Support Button */}
            <button
              onClick={onOpenWhatsApp}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm"
              title="Abrir Suporte Inteligente no WhatsApp com Agente Google ADK"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp ADK</span>
            </button>

            {/* Operator Desk / Transbordo Humano */}
            <button
              onClick={onOpenSupportDashboard}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Painel de Atendimento Humano (Transbordo)"
            >
              <Headphones className="w-5 h-5" />
              {pendingHumanEscalationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pendingHumanEscalationsCount}
                </span>
              )}
            </button>

            {/* Simulated Notification Box (2FA, SMS, Rastreamento) */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Disparos de SMS & E-mail (2FA e Rastreamento)"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User Account / 2FA Login */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-stone-600" />
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar / 2FA</span>
              </button>
            )}

            {/* Cart Drawer Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-stone-950 font-bold text-xs px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between overflow-x-auto text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-4 whitespace-nowrap">
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`py-1.5 px-2.5 font-medium transition-colors ${
                activeTab === 'catalogo'
                  ? 'text-stone-950 border-b-2 border-stone-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Coleções & Catálogo
            </button>
            <button
              onClick={() => setActiveTab('feminino')}
              className={`py-1.5 px-2.5 font-medium transition-colors ${
                activeTab === 'feminino'
                  ? 'text-stone-950 border-b-2 border-stone-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Vestidos & Feminino
            </button>
            <button
              onClick={() => setActiveTab('masculino')}
              className={`py-1.5 px-2.5 font-medium transition-colors ${
                activeTab === 'masculino'
                  ? 'text-stone-950 border-b-2 border-stone-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Camisaria & Masculino
            </button>
            <button
              onClick={() => setActiveTab('alfaiataria')}
              className={`py-1.5 px-2.5 font-medium transition-colors ${
                activeTab === 'alfaiataria'
                  ? 'text-stone-950 border-b-2 border-stone-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Alfaiataria Sartorial
            </button>
            <button
              onClick={() => setActiveTab('rastreio')}
              className={`py-1.5 px-2.5 font-medium transition-colors ${
                activeTab === 'rastreio'
                  ? 'text-stone-950 border-b-2 border-stone-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Rastrear Pedido
            </button>
            <button
              onClick={() => setActiveTab('contato')}
              className={`py-1.5 px-2.5 font-medium transition-colors ${
                activeTab === 'contato'
                  ? 'text-stone-950 border-b-2 border-stone-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ateliê & Contato
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-stone-500">
            <span>1ª Troca Grátis</span>
            <span aria-hidden="true">·</span>
            <span>Até 10x sem juros</span>
            <span aria-hidden="true">·</span>
            <span>PIX com 5% OFF</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
