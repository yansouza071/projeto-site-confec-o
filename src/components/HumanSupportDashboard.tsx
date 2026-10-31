import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { SupportConversation } from '../types.ts';
import { fetchConversations, sendHumanSupportReply, resolveConversation } from '../services/api.ts';

interface HumanSupportDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshBadge?: () => void;
}

export const HumanSupportDashboard: React.FC<HumanSupportDashboardProps> = ({
  isOpen,
  onClose,
  onRefreshBadge,
}) => {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [agentName] = useState<string>('Carlos (Alfaiate Chefe)');

  const loadData = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data.conversations);
      if (data.conversations.length > 0 && !selectedConvId) {
        // Prioritize escalated conversations
        const escalated = data.conversations.find((c) => c.status === 'EM_ATENDIMENTO_HUMANO');
        setSelectedConvId(escalated ? escalated.id : data.conversations[0].id);
      }
      onRefreshBadge?.();
    } catch (err) {
      console.error('Error fetching support queue:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const handleSendReply = async () => {
    if (!selectedConvId || !replyText.trim() || loading) return;

    setLoading(true);
    try {
      await sendHumanSupportReply(selectedConvId, agentName, replyText);
      setReplyText('');
      await loadData();
    } catch (err) {
      console.error('Failed to send human reply:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedConvId) return;
    await resolveConversation(selectedConvId);
    await loadData();
  };

  if (!isOpen) return null;

  const escalatedList = conversations.filter((c) => c.status === 'EM_ATENDIMENTO_HUMANO');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-stone-200">
        {/* Top Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                Painel do Operador · Transbordo Humano VesteBem
              </h3>
              <p className="text-xs text-stone-400">
                Atendimento humano integrado ao WhatsApp e ao Google ADK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Recarregar fila"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Conversations Queue */}
          <div className="w-1/3 border-r border-stone-200 bg-stone-50 overflow-y-auto flex flex-col">
            <div className="p-3 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Fila de Conversas ({conversations.length})</span>
              {escalatedList.length > 0 && (
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {escalatedList.length} transbordadas
                </span>
              )}
            </div>

            <div className="divide-y divide-stone-200">
              {conversations.map((c) => {
                const isEscalated = c.status === 'EM_ATENDIMENTO_HUMANO';
                const isSelected = c.id === selectedConvId;
                const lastMsg = c.messages[c.messages.length - 1];

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-l-4 border-stone-900 shadow-xs'
                        : isEscalated
                        ? 'bg-amber-50/60 hover:bg-amber-50'
                        : 'hover:bg-stone-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-stone-900 truncate">
                        {c.customerName}
                      </span>
                      {isEscalated ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded shrink-0">
                          HUMANO
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                          BOT ADK
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{c.customerPhone}</span>
                    </div>

                    {isEscalated && c.humanEscalationReason && (
                      <div className="text-[10px] text-amber-900 bg-amber-100/70 p-1 rounded font-medium line-clamp-1 mb-1">
                        Motivo: {c.humanEscalationReason}
                      </div>
                    )}

                    <p className="text-[11px] text-stone-600 line-clamp-1">
                      {lastMsg?.text || 'Sem mensagens'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Area: Selected Conversation & Human Reply */}
          <div className="flex-1 flex flex-col justify-between bg-white">
            {selectedConv ? (
              <>
                {/* Chat Top Banner */}
                <div className="p-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm font-bold text-stone-900">
                        {selectedConv.customerName}
                      </h4>
                      <span className="text-xs text-stone-500">({selectedConv.customerPhone})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>Status: <strong>{selectedConv.status}</strong></span>
                      {selectedConv.humanEscalationReason && (
                        <span>· Motivo do transbordo: {selectedConv.humanEscalationReason}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedConv.status !== 'FINALIZADO' && (
                      <button
                        onClick={handleResolve}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Finalizar Chamado
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9f6]">
                  {selectedConv.messages.map((m) => {
                    const isUser = m.sender === 'user';
                    const isHuman = m.sender === 'human_agent';

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                            isUser
                              ? 'bg-white text-stone-900 border border-stone-200'
                              : isHuman
                              ? 'bg-amber-100 text-amber-950 font-medium'
                              : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 pb-1 border-b border-black/5">
                            <span>
                              {isUser
                                ? selectedConv.customerName
                                : isHuman
                                ? `${agentName} (Você)`
                                : 'Google ADK Bot'}
                            </span>
                            <span>{m.timestamp}</span>
                          </div>

                          {m.text}

                          {m.toolCallsExecuted && m.toolCallsExecuted.length > 0 && (
                            <div className="mt-1.5 pt-1 text-[10px] text-emerald-800 flex gap-1 flex-wrap">
                              <span>Ferramentas:</span>
                              {m.toolCallsExecuted.map((t) => (
                                <span key={t} className="font-mono bg-white/60 px-1 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Human Operator Reply Input */}
                <div className="p-3.5 border-t border-stone-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder={`Responder como ${agentName} no WhatsApp do cliente...`}
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    disabled={!replyText.trim() || loading}
                    onClick={handleSendReply}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Resposta
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-stone-400">
                Selecione uma conversa para atender
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
