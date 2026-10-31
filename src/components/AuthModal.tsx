import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { User } from '../types.ts';
import {
  loginUser,
  verify2FA,
  registerUser,
  forgotPassword,
  resetPassword,
} from '../services/api.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onLogout,
  onOpenNotifications,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | '2fa' | 'register' | 'forgot' | 'reset'>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Login & 2FA State
  const [email, setEmail] = useState<string>('maria.silva@exemplo.com.br');
  const [password, setPassword] = useState<string>('vestebem123');
  const [twoFactorUserId, setTwoFactorUserId] = useState<string>('');
  const [twoFactorMethod, setTwoFactorMethod] = useState<'email' | 'sms'>('email');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [previewCode, setPreviewCode] = useState<string>('');

  // Register State
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('11987654321');
  const [regPassword, setRegPassword] = useState<string>('');
  const [reg2FAMethod, setReg2FAMethod] = useState<'email' | 'sms' | 'both'>('both');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState<string>('maria.silva@exemplo.com.br');
  const [resetCodeOrToken, setResetCodeOrToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await loginUser(email, password, twoFactorMethod);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas');
        setLoading(false);
        return;
      }

      if (res.twoFactorRequired) {
        setTwoFactorUserId(res.userId);
        setTwoFactorMethod(res.method || 'email');
        setPreviewCode(res.previewCode || '');
        setMode('2fa');
      } else {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch {
      setErrorMessage('Erro ao tentar conectar ao servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await verify2FA(twoFactorUserId, twoFactorCode);
      if (!res.success) {
        setErrorMessage(res.error || 'Código 2FA incorreto ou expirado');
        setLoading(false);
        return;
      }

      onLoginSuccess(res.user);
      onClose();
    } catch {
      setErrorMessage('Erro na validação multifator.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        twoFactorMethod: reg2FAMethod,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Falha ao cadastrar');
        setLoading(false);
        return;
      }

      setSuccessMessage('Conta cadastrada com sucesso! Faça seu login para validar o 2FA.');
      setEmail(regEmail);
      setPassword(regPassword);
      setMode('login');
    } catch {
      setErrorMessage('Erro de cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await forgotPassword(forgotEmail);
      if (res.previewCode) {
        setPreviewCode(res.previewCode);
        setResetCodeOrToken(res.previewCode);
      }
      setSuccessMessage('Código e token de recuperação enviados por E-mail e SMS!');
      setMode('reset');
    } catch {
      setErrorMessage('Erro ao solicitar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await resetPassword(resetCodeOrToken, newPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Código inválido ou expirado');
        setLoading(false);
        return;
      }

      setSuccessMessage('Senha atualizada com sucesso! Você já pode realizar o login.');
      setPassword(newPassword);
      setMode('login');
    } catch {
      setErrorMessage('Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  // Se o usuário já está logado, mostra o perfil com os cartões tokenizados
  if (user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Minha Conta VesteBem
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-stone-400 block">Nome do Cliente</span>
              <strong className="text-stone-900 text-sm">{user.name}</strong>
            </div>
            <div>
              <span className="text-stone-400 block">E-mail Cadastrado</span>
              <span className="text-stone-800">{user.email}</span>
            </div>
            <div>
              <span className="text-stone-400 block">WhatsApp / Telefone</span>
              <span className="text-stone-800">{user.phone}</span>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Autenticação Multifator (2FA) Ativa
              </span>
            </div>
          </div>

          {user.savedCards && user.savedCards.length > 0 && (
            <div className="pt-2 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-800 block mb-2">
                Cartões de Crédito Tokenizados (PCI-DSS):
              </span>
              <div className="space-y-1.5">
                {user.savedCards.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-stone-800 uppercase">
                      {c.brand} •••• {c.last4}
                    </span>
                    <span className="text-[10px] text-stone-500">Expira em {c.expiry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-stone-200 flex gap-2">
            <button
              onClick={onLogout}
              className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Sair da Conta
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {mode === 'login' && 'Entrar na Conta VesteBem'}
              {mode === '2fa' && 'Verificação em 2 Etapas (2FA)'}
              {mode === 'register' && 'Criar Conta com 2FA'}
              {mode === 'forgot' && 'Recuperar Acesso'}
              {mode === 'reset' && 'Nova Senha'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-800">Senha</label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setSuccessMessage('');
                      setMode('forgot');
                    }}
                    className="text-[11px] text-stone-500 hover:text-stone-900 underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Canal de envio do código 2FA:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTwoFactorMethod('email')}
                    className={`py-1.5 px-2 text-xs rounded-lg border flex items-center justify-center gap-1.5 ${
                      twoFactorMethod === 'email'
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Via E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoFactorMethod('sms')}
                    className={`py-1.5 px-2 text-xs rounded-lg border flex items-center justify-center gap-1.5 ${
                      twoFactorMethod === 'sms'
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Via SMS
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {loading ? 'Validando...' : 'Entrar com Verificação em 2 Etapas'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 border-t border-stone-100 text-center">
                <span className="text-xs text-stone-500">Ainda não tem conta? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode('register');
                  }}
                  className="text-xs font-semibold text-stone-900 hover:underline"
                >
                  Cadastre-se com 2FA
                </button>
              </div>
            </form>
          )}

          {/* 2. 2FA MULTIFACTOR VERIFICATION */}
          {mode === '2fa' && (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Código de 6 dígitos enviado via {twoFactorMethod.toUpperCase()}!
                </div>
                <p>
                  Por motivos de segurança, insira o código numérico expirável enviado para o seu {twoFactorMethod === 'sms' ? 'celular' : 'e-mail'}.
                </p>
              </div>

              {previewCode && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-amber-900 font-medium">
                    Simulação: Código <strong>{previewCode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTwoFactorCode(previewCode)}
                    className="text-[11px] font-bold text-amber-950 underline hover:text-black"
                  >
                    Preencher Automático
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Código de Verificação (6 Dígitos)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 849201"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length < 6}
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  {loading ? 'Verificando...' : 'Confirmar e Acessar'}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Ver no Centro de Mensagens (SMS/E-mail)
                </button>
              </div>
            </form>
          )}

          {/* 3. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com.br"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Telefone Celular / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="11987654321"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Senha Segura</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Preferência de 2FA (Verificação em 2 Etapas):
                </label>
                <select
                  value={reg2FAMethod}
                  onChange={(e) => setReg2FAMethod(e.target.value as 'email' | 'sms' | 'both')}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                >
                  <option value="both">Ambos (E-mail e SMS)</option>
                  <option value="email">Apenas E-mail</option>
                  <option value="sms">Apenas SMS</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm mt-2"
              >
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro com 2FA'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-stone-500 hover:text-stone-900 underline"
                >
                  Já tem conta? Faça Login
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Digite o e-mail da sua conta para enviarmos o código e token seguro de recuperação via E-mail e SMS.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                >
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {previewCode && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  Código de recuperação gerado: <strong>{previewCode}</strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Código ou Token de Recuperação
                </label>
                <input
                  type="text"
                  required
                  value={resetCodeOrToken}
                  onChange={(e) => setResetCodeOrToken(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                {loading ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
