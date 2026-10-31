import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Tag, Truck } from 'lucide-react';
import { CartItem } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onProceedToCheckout: (shippingFee: number, discount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [cep, setCep] = useState<string>('01418-100');
  const [shippingFee, setShippingFee] = useState<number>(18.5);
  const [shippingCalculated, setShippingCalculated] = useState<boolean>(true);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Frete grátis acima de R$ 299
  const effectiveShipping = subtotal >= 299 ? 0 : shippingFee;
  const finalTotal = Math.max(0, subtotal + effectiveShipping - discountAmount);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'VESTEBEM10') {
      const discount = subtotal * 0.1;
      setDiscountAmount(discount);
      setCouponMessage('Cupom VESTEBEM10 aplicado! 10% de desconto concedido.');
    } else if (code === 'PRIMEIRACOMPRA') {
      const discount = 20;
      setDiscountAmount(discount);
      setCouponMessage('Cupom PRIMEIRACOMPRA aplicado! R$ 20 de desconto.');
    } else {
      setCouponMessage('Cupom inválido. Tente VESTEBEM10');
      setDiscountAmount(0);
    }
  };

  const handleCalculateShipping = () => {
    if (cep.length >= 8) {
      setShippingCalculated(true);
      setShippingFee(subtotal >= 299 ? 0 : 18.5);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-stone-900">
                Seu Carrinho de Compras
              </span>
              <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'peça' : 'peças'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🛍️
                </div>
                <h4 className="font-serif text-base font-semibold text-stone-800">
                  Seu carrinho está vazio
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore nossas coleções de vestidos, camisaria e alfaiataria em linho para começar.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-3.5 p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-24 object-cover rounded-lg shrink-0 border border-stone-200 bg-stone-100"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.productId, item.size, item.color)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remover peça"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <span>Tam: <strong className="text-stone-800">{item.size}</strong></span>
                        <span>·</span>
                        <span>Cor: <strong className="text-stone-800">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-stone-300 rounded bg-white">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-stone-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= item.maxStock}
                          onClick={() =>
                            onUpdateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              Math.min(item.maxStock, item.quantity + 1)
                            )
                          }
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-stone-900">
                          R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Cupom e Frete */}
            {items.length > 0 && (
              <div className="pt-2 space-y-3">
                {/* Cupom */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    Cupom de Desconto
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Ex: VESTEBEM10"
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white uppercase"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponMessage && (
                    <span className="text-[11px] text-stone-600 block mt-1">
                      {couponMessage}
                    </span>
                  )}
                </div>

                {/* Simulador de Frete */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-700" />
                      Frete / CEP de Entrega
                    </span>
                    {subtotal >= 299 && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                        FRETE GRÁTIS
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="00000-000"
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                    <button
                      onClick={handleCalculateShipping}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium"
                    >
                      Calcular
                    </button>
                  </div>
                  {shippingCalculated && (
                    <span className="text-[11px] text-stone-600 block mt-1">
                      {subtotal >= 299
                        ? 'Frete Grátis Sedex aplicado (compras acima de R$ 299)!'
                        : 'Sedex Expresso: R$ 18,50 (Prazo: 1 a 2 dias úteis)'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal das peças:</span>
                  <span className="font-semibold text-stone-900">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frete estimado (Sedex):</span>
                  <span className="font-semibold text-stone-900">
                    {effectiveShipping === 0 ? 'Grátis' : `R$ ${effectiveShipping.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Desconto aplicado:</span>
                    <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Total do Pedido:</span>
                  <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <span className="text-[11px] text-stone-400 block text-right">
                  ou até 10x sem juros de R$ {(finalTotal / 10).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <button
                onClick={() => onProceedToCheckout(effectiveShipping, discountAmount)}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Prosseguir para o Pagamento
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambiente Seguro com Tokenização de Cartão e 2FA</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
