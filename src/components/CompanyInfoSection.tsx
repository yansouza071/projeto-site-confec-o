import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Share2,
  Send,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface CompanyInfoSectionProps {
  onOpenWhatsApp: () => void;
}

export const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({ onOpenWhatsApp }) => {
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formMessage, setFormMessage] = useState<string>('');
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setFormName('');
      setFormEmail('');
      setFormMessage('');
      setSentSuccess(false);
    }, 4000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs font-semibold tracking-wider uppercase text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
          Tradição, Alfaiataria e Atendimento Nobre
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Ateliê & Confecção VesteBem
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Localizado no coração do polo têxtil paulistano, unimos artesãos alfaiates à inteligência artificial do Google ADK para proporcionar uma experiência de alta costura sob medida.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Endereço */}
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-semibold text-stone-900">
                Endereço do Ateliê
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Rua das Rendeiras, 850 · Polo Têxtil<br />
                São Paulo - SP, Brasil<br />
                CEP: 03010-000
              </p>
            </div>

            {/* Horários */}
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-semibold text-stone-900">
                Horário de Atendimento
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong>Segunda a Sexta:</strong> 08:00 às 18:00<br />
                <strong>Sábado:</strong> 09:00 às 14:00<br />
                <span className="text-emerald-700 font-medium">Agente ADK WhatsApp: 24h/dia</span>
              </p>
            </div>

            {/* Telefones */}
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-semibold text-stone-900">
                Centrais Telefônicas
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong>Recepção do Ateliê:</strong> (11) 3456-7890<br />
                <strong>SAC Gratuito:</strong> 0800 770 1234<br />
                <strong>Atendimento Corporativo:</strong> Ramal 204
              </p>
            </div>

            {/* WhatsApp Oficial */}
            <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-semibold text-emerald-950">
                WhatsApp Oficial com ADK
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                <strong>+55 (11) 98765-4321</strong><br />
                Canal exclusivo para consulta de estoque, trocas e rastreamento.
              </p>
              <button
                onClick={onOpenWhatsApp}
                className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>

          {/* E-mails & Redes Sociais */}
          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
            <div>
              <h4 className="font-serif text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-700" />
                Canais Eletrônicos Oficiais
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                <div>
                  <strong>Atendimento Geral:</strong> contato@vestebemconfeccao.com.br
                </div>
                <div>
                  <strong>SAC & Trocas:</strong> sac@vestebemconfeccao.com.br
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Redes Sociais Oficiais:
              </span>
              <div className="flex items-center gap-4 text-stone-600">
                <span className="hover:text-stone-900 cursor-pointer">Instagram @vestebem_atelier</span>
                <span>·</span>
                <span className="hover:text-stone-900 cursor-pointer">Facebook /vestebemconfeccao</span>
                <span>·</span>
                <span className="hover:text-stone-900 cursor-pointer">LinkedIn /vestebem-textil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Fale com Nossos Alfaiates
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              Envie uma Mensagem
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Dúvidas sobre tecidos sob encomenda, uniformes empresariais ou prazos de produção? Nossa equipe retornará rapidamente.
            </p>

            {sentSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Mensagem enviada com sucesso! Protocolo registrado em nosso sistema.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Seu E-mail</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Mensagem ou Projeto Têxtil</label>
                <textarea
                  rows={4}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Conte-nos o que você precisa..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar Mensagem para o Ateliê
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] text-stone-400 text-center">
            Ateliê & Confecção VesteBem Ltda. CNPJ: 12.345.678/0001-90
          </div>
        </div>
      </div>
    </section>
  );
};
