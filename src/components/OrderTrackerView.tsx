import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { fetchTracking, fetchOrders } from '../services/api.ts';
import { Order } from '../types.ts';

interface OrderTrackerViewProps {
  initialCode?: string;
  onOpenWhatsAppWithCode?: (code: string) => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({
  initialCode = 'VB849201832BR',
  onOpenWhatsAppWithCode,
}) => {
  const [trackingCodeInput, setTrackingCodeInput] = useState<string>(initialCode);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const searchTracking = async (codeToSearch?: string) => {
    const code = (codeToSearch || trackingCodeInput).trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetchTracking(code);
      if (!res.success) {
        setError(res.error || 'Código de rastreio não localizado.');
        setTrackingData(null);
      } else {
        setTrackingData(res);
      }
    } catch {
      setError('Falha ao consultar base de rastreamento da transportadora.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchTracking(initialCode);
    fetchOrders().then((orders) => setRecentOrders(orders));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Title & Introduction */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-semibold tracking-wider uppercase text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
          Logística & Rastreamento em Tempo Real
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Acompanhe sua Encomenda do Ateliê
        </h2>
        <p className="text-sm text-stone-600 max-w-lg mx-auto">
          Consulte o status detalhado da confecção, envio e transporte de peças sob medida e pronta-entrega.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-stone-200 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={trackingCodeInput}
              onChange={(e) => setTrackingCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && searchTracking()}
              placeholder="Digite o código (ex: VB849201832BR ou ORD-7821)"
              className="w-full pl-11 pr-4 py-3 text-sm font-mono border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 uppercase"
            />
          </div>
          <button
            onClick={() => searchTracking()}
            disabled={loading}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Consultando...' : 'Rastrear'}
          </button>
        </div>

        {/* Quick Sample Clickers */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-stone-600">
          <span className="font-medium text-stone-400">Exemplos para teste rápido:</span>
          {recentOrders.slice(0, 3).map((ord) => (
            <button
              key={ord.id}
              onClick={() => {
                setTrackingCodeInput(ord.trackingCode);
                searchTracking(ord.trackingCode);
              }}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-mono text-[11px] transition-colors"
            >
              {ord.trackingCode} ({ord.customerName.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden divide-y divide-stone-200">
          {/* Status Header */}
          <div className="p-6 bg-stone-50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Código de Rastreamento Oficial
              </span>
              <h3 className="font-mono text-2xl font-bold text-stone-950 mt-0.5">
                {trackingData.trackingCode}
              </h3>
              <span className="text-xs text-stone-600">
                Transportadora: <strong>{trackingData.carrier}</strong> · Destinatário:{' '}
                <strong>{trackingData.customerName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {trackingData.status.replace(/_/g, ' ')}
              </span>

              {onOpenWhatsAppWithCode && (
                <button
                  onClick={() => onOpenWhatsAppWithCode(trackingData.trackingCode)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Perguntar no WhatsApp
                </button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 sm:p-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-6">
              Histórico de Movimentação do Objeto
            </h4>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {trackingData.timeline?.map((ev: any, idx: number) => {
                const isLatest = idx === trackingData.timeline.length - 1;

                return (
                  <div key={idx} className="relative group">
                    {/* Step Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-4 sm:w-6 h-4 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isLatest
                          ? 'bg-emerald-600 border-white ring-4 ring-emerald-100 text-white shadow-sm'
                          : 'bg-white border-stone-400 text-stone-400'
                      }`}
                    >
                      {isLatest && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Step Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900">{ev.status}</span>
                        {isLatest && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded">
                            Última Atualização
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-stone-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {ev.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {ev.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items in this Shipment */}
          {trackingData.items && (
            <div className="p-6 bg-stone-50">
              <span className="text-xs font-semibold text-stone-700 block mb-3">
                Peças inclusas nesta remessa:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trackingData.items.map((it: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-3"
                  >
                    {it.imageUrl && (
                      <img
                        src={it.imageUrl}
                        alt=""
                        className="w-12 h-14 object-cover rounded-md bg-stone-100 shrink-0"
                      />
                    )}
                    <div className="text-xs">
                      <span className="font-semibold text-stone-900 block">{it.productName}</span>
                      <span className="text-stone-500">
                        Tam: {it.size} · Cor: {it.color} · Qtd: {it.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
