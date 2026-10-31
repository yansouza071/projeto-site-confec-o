import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
} from 'lucide-react';
import { CartItem, User, Address, Order } from '../types.ts';
import { createOrder, saveCreditCard } from '../services/api.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  shippingFee: number;
  discount: number;
  user: User | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  shippingFee,
  discount,
  user,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Customer Details Form
  const [name, setName] = useState<string>(user?.name || 'Maria Fernanda Silva');
  const [email, setEmail] = useState<string>(user?.email || 'maria.silva@exemplo.com.br');
  const [phone, setPhone] = useState<string>(user?.phone || '11987654321');

  // Address
  const [address, setAddress] = useState<Address>(
    user?.addresses?.[0] || {
      street: 'Alameda Santos',
      number: '1470',
      complement: 'Apt 82',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01418-100',
    }
  );

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  const [selectedCardId, setSelectedCardId] = useState<string>(user?.savedCards?.[0]?.id || 'new');

  // New Credit Card Form
  const [cardNumber, setCardNumber] = useState<string>('5502 0000 0000 8842');
  const [cardHolder, setCardHolder] = useState<string>(user?.name || 'MARIA F SILVA');
  const [expiry, setExpiry] = useState<string>('09/29');
  const [cvv, setCvv] = useState<string>('123');
  const [saveCardToken, setSaveCardToken] = useState<boolean>(true);

  // Result Order
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const total = Math.max(0, subtotal + shippingFee - discount - pixDiscount);

  const handleSubmitOrder = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      let cardLast4 = '8842';

      if (paymentMethod === 'credit_card') {
        if (selectedCardId === 'new') {
          const cleanNum = cardNumber.replace(/\D/g, '');
          cardLast4 = cleanNum.slice(-4) || '8842';

          if (saveCardToken && user) {
            await saveCreditCard({
              userId: user.id,
              cardHolder,
              cardNumber,
              expiry,
              isDefault: true,
            });
          }
        } else {
          const card = user?.savedCards?.find((c) => c.id === selectedCardId);
          if (card) cardLast4 = card.last4;
        }
      }

      const res = await createOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        items,
        shippingAddress: address,
        shippingFee,
        discount: discount + pixDiscount,
        paymentMethod,
        cardLast4,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Falha ao finalizar pedido');
        setLoading(false);
        return;
      }

      setCreatedOrder(res.order);
      setStep('confirmed');
      onOrderSuccess(res.order);
    } catch {
      setErrorMessage('Erro ao se comunicar com o servidor do ateliê.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-stone-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {step === 'confirmed' ? 'Pedido Concluído com Sucesso!' : 'Checkout Seguro - Ateliê VesteBem'}
            </h3>
          </div>
          {step !== 'confirmed' && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: CUSTOMER & ADDRESS */}
          {step === 'details' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                  1. Dados do Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">E-mail (Rastreamento)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">WhatsApp / SMS</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                  2. Endereço de Entrega das Peças
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">Rua / Avenida</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Cidade / UF</label>
                    <input
                      type="text"
                      value={`${address.city} - ${address.state}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('-');
                        setAddress({
                          ...address,
                          city: parts[0]?.trim() || 'São Paulo',
                          state: parts[1]?.trim() || 'SP',
                        });
                      }}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Order Item Summary */}
              <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1.5 border border-stone-200">
                <div className="flex justify-between font-medium text-stone-800">
                  <span>Itens ({items.length}):</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frete Sedex Expresso:</span>
                  <span>{shippingFee === 0 ? 'Grátis' : `R$ ${shippingFee.toFixed(2).replace('.', ',')}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Desconto do Cupom:</span>
                    <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Previsto:</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                Avançar para Pagamento Seguro
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD & TOKENIZATION */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  3. Selecione a Forma de Pagamento
                </h4>
                <button
                  onClick={() => setStep('details')}
                  className="text-xs text-stone-500 hover:text-stone-900 underline"
                >
                  Voltar para Endereço
                </button>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-semibold">Cartão de Crédito</span>
                  <span className="text-[10px] opacity-80">Até 10x sem juros</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-semibold">PIX Instantâneo</span>
                  <span className="text-[10px] text-emerald-400 font-bold">5% de Desconto</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'boleto'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-semibold">Boleto Bancário</span>
                  <span className="text-[10px] opacity-80">À vista</span>
                </button>
              </div>

              {/* Credit Card Form (PCI Tokenized) */}
              {paymentMethod === 'credit_card' && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800">
                      Tokenização Segura PCI-DSS
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                      Criptografia de Ponta
                    </span>
                  </div>

                  {user?.savedCards && user.savedCards.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <label className="block text-xs font-medium text-stone-700">
                        Cartões Salvos nesta Conta:
                      </label>
                      {user.savedCards.map((c) => (
                        <label
                          key={c.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs ${
                            selectedCardId === c.id
                              ? 'border-stone-900 bg-white'
                              : 'border-stone-200 bg-stone-100/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="saved_card"
                              checked={selectedCardId === c.id}
                              onChange={() => setSelectedCardId(c.id)}
                            />
                            <span className="font-semibold uppercase">{c.brand}</span>
                            <span>terminado em •••• {c.last4}</span>
                          </div>
                          <span className="text-[10px] text-stone-400">Val: {c.expiry}</span>
                        </label>
                      ))}

                      <label
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                          selectedCardId === 'new'
                            ? 'border-stone-900 bg-white'
                            : 'border-stone-200 bg-stone-100/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="saved_card"
                          checked={selectedCardId === 'new'}
                          onChange={() => setSelectedCardId('new')}
                        />
                        <span>Pagar com outro cartão de crédito</span>
                      </label>
                    </div>
                  )}

                  {selectedCardId === 'new' && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Número do Cartão de Crédito
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">
                            Nome Gravado no Cartão
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white uppercase"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-stone-700 mb-1">
                              Validade
                            </label>
                            <input
                              type="text"
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-stone-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-stone-600 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCardToken}
                          onChange={(e) => setSaveCardToken(e.target.checked)}
                          className="rounded text-stone-900"
                        />
                        <span>Salvar cartão de forma tokenizada e segura para próximas compras</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* PIX Details */}
              {paymentMethod === 'pix' && (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-900 font-semibold">
                    <span>Pagamento Instantâneo via PIX</span>
                    <span>5% OFF Aplicado (- R$ {pixDiscount.toFixed(2).replace('.', ',')})</span>
                  </div>
                  <p className="text-stone-600 text-[11px]">
                    O QR Code e a chave PIX Copia e Cola serão gerados imediatamente. A aprovação do pagamento e a baixa no estoque ocorrem em menos de 10 segundos!
                  </p>
                </div>
              )}

              {/* Final Total */}
              <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-sm font-bold text-stone-950">
                <span>Total a Pagar:</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <button
                disabled={loading}
                onClick={handleSubmitOrder}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Processando e Emitindo Rastreio...' : 'Confirmar e Finalizar Pedido'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Estoque reservado em tempo real · Notificações automáticas via E-mail e WhatsApp</span>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMED & TRACKING DISPATCHED */}
          {step === 'confirmed' && createdOrder && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold block mb-1">
                  Pagamento Aprovado e Pedido em Produção!
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Pedido #{createdOrder.id}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  Muito obrigado, {createdOrder.customerName}! Nossa equipe de corte e alfaiataria já iniciou a preparação das suas peças.
                </p>
              </div>

              {/* Dispatched Tracking Information Card */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-stone-700" />
                    Código de Rastreamento Gerado:
                  </span>
                  <span className="font-mono text-sm font-bold text-stone-950 bg-stone-200 px-2.5 py-0.5 rounded">
                    {createdOrder.trackingCode}
                  </span>
                </div>

                <div className="text-xs text-stone-600 space-y-1 pt-1 border-t border-stone-200">
                  <div>
                    <strong>Transportadora:</strong> {createdOrder.carrier}
                  </div>
                  <div>
                    <strong>Destino:</strong> {createdOrder.shippingAddress.street},{' '}
                    {createdOrder.shippingAddress.number} - {createdOrder.shippingAddress.city}/
                    {createdOrder.shippingAddress.state}
                  </div>
                  <div className="text-emerald-700 font-medium">
                    ✓ Notificação com código de rastreio disparada automaticamente via E-mail ({createdOrder.customerEmail}) e WhatsApp ({createdOrder.customerPhone})!
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Concluir e Voltar à Loja
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
