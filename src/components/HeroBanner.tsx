import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Truck, RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
  onOpenWhatsApp: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore, onOpenWhatsApp }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-[#faf9f6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Editorial Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-stone-600 bg-stone-200/70 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Temporada 2026/2027 · Tecidos Naturais & Alfaiataria Nobre
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 tracking-tight leading-[1.12]">
              A elegância do corte artesanal com a precisão da confecção moderna.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 font-light max-w-2xl leading-relaxed">
              Descubra peças exclusivas em Crepe Fluido, Linho Puro Italiano e legítimo Algodão Egípcio. Cada modelo é moldado à mão no nosso ateliê com acabamento de alta costura e estoque sincronizado em tempo real.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow"
              >
                Ver Coleção Completa
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenWhatsApp}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Agente ADK no WhatsApp
              </button>
            </div>

            {/* Pillar Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-900">Rastreio Imediato</span>
                  <span className="text-stone-500 text-xs">Avisos via E-mail e WhatsApp</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-900">1ª Troca Grátis</span>
                  <span className="text-stone-500 text-xs">Logística reversa sem custo</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-900">Segurança 2FA</span>
                  <span className="text-stone-500 text-xs">Cartão tokenizado e SMS/Email</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Atelier Showcase Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                  alt="Confecção de moda feminina e masculina Ateliê VesteBem"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white p-4 bg-stone-900/60 backdrop-blur-md rounded-xl border border-white/10">
                  <span className="text-xs tracking-wider uppercase text-amber-300 font-semibold block">
                    Destaque da Coleção
                  </span>
                  <p className="font-serif text-lg font-medium text-white">
                    Vestido Midi Floral Primavera & Blazers em Linho
                  </p>
                  <div className="flex items-center justify-between text-xs text-stone-300 mt-2">
                    <span>Corte Fino & Seda</span>
                    <span className="text-white font-bold">A partir de R$ 119,90</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
