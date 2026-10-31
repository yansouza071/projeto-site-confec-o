import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  UserCheck,
  Bot,
  Wrench,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Package,
  MessageCircle,
} from 'lucide-react';
import { SupportConversation, SupportMessage } from '../types.ts';
import { sendAdkMessage, fetchConversations } from '../services/api.ts';

interface WhatsAppAdkWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
}

export const WhatsAppAdkWidget: React.FC<WhatsAppAdkWidgetProps> = ({
  isOpen,
  onClose,
  customerName = 'Maria Fernanda Silva',
  customerPhone = '+55 11 98765-4321',
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carrega ou inicializa a conversa
  const loadChat = async () => {
    try {
      const data = await fetchConversations();
      const current = data.conversations.find(
        (c) => c.customerPhone.replace(/\D/g, '') === customerPhone.replace(/\D/g, '')
      );
      if (current) {
        setConversation(current);
        setMessages(current.messages);
      } else {
        // Se ainda não existir, cria a mensagem inicial
        const initialMsg: SupportMessage = {
          id: 'welcome-1',
          conversationId: 'conv-init',
          sender: 'agent_adk',
          text: `Olá ${customerName}! Sou o Agente de Suporte Inteligente do Ateliê & Confecção VesteBem (construído com Google ADK).\n\nComo posso te ajudar hoje?\n• Consultar estoque de roupas e tamanhos\n• Rastrear seu pedido\n• Solicitar troca (ex: trocar camiseta P por M)\n• Informações de pagamento e alfaiataria`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialMsg]);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: SupportMessage = {
      id: `usr-${Date.now()}`,
      conversationId: conversation?.id || 'conv-temp',
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await sendAdkMessage({
        conversationId: conversation?.id,
        customerName,
        customerPhone,
        text,
        channel: 'whatsapp',
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        if (res.status) {
          setConversation((prev) => (prev ? { ...prev, status: res.status } : null));
        }
      }
    } catch (err) {
      console.error('Failed to send message to ADK agent:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isHumanTransferred = conversation?.status === 'EM_ATENDIMENTO_HUMANO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl h-[92vh] max-h-[720px] bg-[#efeae2] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-stone-300">
        {/* WhatsApp Top Header */}
        <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white font-serif font-bold text-base border-2 border-emerald-400">
                VB
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#075e54]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">Ateliê & Confecção VesteBem</span>
                <span className="bg-emerald-500 text-[10px] text-white font-bold px-1 rounded-sm">
                  ✓ VERIFICADO
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-100">
                {isHumanTransferred ? (
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    Atendimento Humano em Andamento
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-emerald-300" />
                    Google ADK Intelligence · Online 24h
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp Status Subheader */}
        <div className="bg-[#128c7e] text-emerald-50 px-3.5 py-1.5 text-[11px] flex items-center justify-between shrink-0">
          <span className="truncate">WhatsApp Business API · Conectado com EnvironmentToolset</span>
          <span className="font-mono">{customerPhone}</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
          {/* Encryption E2E Note */}
          <div className="text-center my-2">
            <span className="inline-block bg-[#ffeecd] text-[#54656f] text-[10px] px-3 py-1 rounded-md shadow-xs max-w-sm">
              🔒 As mensagens são protegidas de ponta a ponta. Agente conectado com a base de estoque e expedição do Ateliê.
            </span>
          </div>

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isHuman = m.sender === 'human_agent';

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div
                  className={`relative p-3 rounded-xl shadow-xs text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                      : isHuman
                      ? 'bg-amber-50 text-stone-900 border border-amber-200 rounded-tl-none'
                      : 'bg-white text-[#111b21] rounded-tl-none'
                  }`}
                >
                  {/* Sender Badge */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-stone-100 text-[10px] font-semibold text-stone-500">
                      {isHuman ? (
                        <span className="text-amber-800 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Consultor Têxtil Humano
                        </span>
                      ) : (
                        <span className="text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Agente Google ADK
                        </span>
                      )}
                    </div>
                  )}

                  {m.text}

                  {/* Tool Call Badges */}
                  {m.toolCallsExecuted && m.toolCallsExecuted.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-stone-100 flex flex-wrap gap-1">
                      <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-stone-400" />
                        Ferramentas ADK executadas:
                      </span>
                      {m.toolCallsExecuted.map((tool) => (
                        <span
                          key={tool}
                          className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-mono"
                        >
                          {tool}()
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className="text-[10px] text-[#667781] float-right ml-2 mt-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 bg-white text-stone-500 text-xs px-3 py-2 rounded-xl w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Agente ADK consultando estoque e dados da confecção...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Skill Buttons (Facilita testes imediatos dos 10 critérios da especificação) */}
        <div className="p-2 bg-white/95 border-t border-stone-200 overflow-x-auto shrink-0 flex gap-1.5">
          <button
            onClick={() => handleSend('Vocês têm vestido floral tamanho G no estoque?')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <Search className="w-3 h-3 text-stone-500" />
            Vestido floral tamanho G?
          </button>

          <button
            onClick={() => handleSend('Quero trocar uma camiseta P por M')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-stone-500" />
            Trocar camiseta P por M
          </button>

          <button
            onClick={() => handleSend('Onde está meu pedido? (VB849201832BR)')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <Package className="w-3 h-3 text-stone-500" />
            Onde está meu pedido?
          </button>

          <button
            onClick={() => handleSend('Meu código de rastreio não funciona')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <Package className="w-3 h-3 text-stone-500" />
            Rastreio com erro
          </button>

          <button
            onClick={() => handleSend('Quero falar com um atendente humano')}
            className="whitespace-nowrap px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <UserCheck className="w-3 h-3 text-amber-700" />
            Transbordo Humano
          </button>

          <button
            onClick={() => handleSend('Qual o horário de funcionamento e endereço do ateliê?')}
            className="whitespace-nowrap px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <Clock className="w-3 h-3 text-stone-500" />
            Horário e Endereço
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#f0f2f5] border-t border-stone-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isHumanTransferred
                ? 'Conectado com atendente humano... Digite sua dúvida...'
                : 'Mensagem para o Agente ADK da Confecção...'
            }
            className="flex-1 py-2 px-3.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900 placeholder:text-stone-400"
          />
          <button
            disabled={!inputValue.trim() || loading}
            onClick={() => handleSend()}
            className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
