import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Mail,
  Smartphone,
  MessageCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { NotificationLog } from '../types.ts';
import { fetchNotifications } from '../services/api.ts';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<'all' | 'whatsapp' | 'email' | 'sms'>('all');

  const loadNotifications = async () => {
    try {
      const list = await fetchNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filterChannel === 'all'
    ? notifications
    : notifications.filter((n) => n.channel === filterChannel);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-stone-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Central de Disparos em Tempo Real
              </h3>
              <p className="text-xs text-stone-500">
                Simulador de envio de SMS, E-mails e WhatsApp disparados pela aplicação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadNotifications}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel Filter Bar */}
        <div className="px-5 py-2.5 bg-stone-100/70 border-b border-stone-200 flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-stone-500">Filtrar Canal:</span>
          <button
            onClick={() => setFilterChannel('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterChannel === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900'
            }`}
          >
            Todos ({notifications.length})
          </button>
          <button
            onClick={() => setFilterChannel('whatsapp')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              filterChannel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={() => setFilterChannel('email')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              filterChannel === 'email'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            E-mail
          </button>
          <button
            onClick={() => setFilterChannel('sms')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              filterChannel === 'sms'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            SMS (2FA)
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              Nenhuma notificação disparada neste canal ainda.
            </div>
          ) : (
            filtered.map((notif) => {
              const isSms = notif.channel === 'sms';
              const isEmail = notif.channel === 'email';
              const isWhatsapp = notif.channel === 'whatsapp';

              return (
                <div
                  key={notif.id}
                  className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 hover:bg-white transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {isWhatsapp && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          WHATSAPP
                        </span>
                      )}
                      {isEmail && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          E-MAIL
                        </span>
                      )}
                      {isSms && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          SMS
                        </span>
                      )}
                      <span className="font-semibold text-stone-900">{notif.recipient}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.createdAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>

                  {notif.subject && (
                    <div className="text-xs font-semibold text-stone-900">
                      Assunto: {notif.subject}
                    </div>
                  )}

                  <p className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200/80 whitespace-pre-line font-mono text-[11px]">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-700 font-medium">
                      ✓ Status de Entrega: {notif.status}
                    </span>
                    <button
                      onClick={() => handleCopy(notif.message, notif.id)}
                      className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
                    >
                      {copiedId === notif.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar Texto
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
