import React from 'react';
import { X, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Product } from '../types.ts';

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefresh: () => void;
}

export const StockManagementModal: React.FC<StockManagementModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const totalAtelierItems = products.reduce((sum, p) => sum + p.totalStock, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-stone-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Gestão de Estoque do Ateliê em Tempo Real
              </h3>
              <p className="text-xs text-stone-500">
                Sincronização bidirecional entre E-commerce Web e Agente Google ADK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Stock Stats */}
        <div className="px-6 py-3 bg-stone-100/60 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-800 shrink-0">
          <div className="flex items-center gap-4">
            <span>Modelos Cadastrados: <strong>{products.length}</strong></span>
            <span>·</span>
            <span>Total de Peças em Depósito: <strong className="text-emerald-700">{totalAtelierItems}</strong></span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sincronizado com API do WhatsApp ADK
          </span>
        </div>

        {/* Products Matrix */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="p-4 bg-stone-50/50 rounded-xl border border-stone-200 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={prod.imageUrl}
                    alt=""
                    className="w-12 h-14 object-cover rounded-lg bg-stone-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">
                      {prod.name}
                    </h4>
                    <span className="text-xs text-stone-500">
                      {prod.category} · R$ {prod.price.toFixed(2)} · {prod.composition}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-stone-900">
                    {prod.totalStock} peças no total
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    Atualizado em tempo real
                  </span>
                </div>
              </div>

              {/* Variants Grid */}
              <div className="pt-2 border-t border-stone-200">
                <span className="text-[11px] font-semibold text-stone-600 block mb-2">
                  Estoque por Variação (Tamanho / Cor / SKU):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {prod.variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 bg-white rounded-lg border border-stone-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-stone-900 mr-1.5">{v.size}</span>
                        <span className="text-[11px] text-stone-500">{v.color.split(' ')[0]}</span>
                        <span className="text-[9px] text-stone-400 block font-mono">{v.sku}</span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          v.stock > 5
                            ? 'bg-emerald-50 text-emerald-800'
                            : v.stock > 0
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {v.stock} un
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
