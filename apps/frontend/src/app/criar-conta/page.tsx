'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Building2, Loader2, ArrowRight } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSocialButtons } from '@/components/auth/AuthSocialButtons';
import { PasswordRequirements, isPasswordValid } from '@/components/auth/PasswordRequirements';

export default function CriarContaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08070d] flex items-center justify-center text-[#de74f6]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <CriarContaForm />
    </Suspense>
  );
}

function CriarContaForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    operationType: 'barbearia',
    password: '',
    confirmPassword: '',
    acceptTerms: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mascara automatica de telefone brasileiro: (99) 99999-9999
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;

    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }

    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Informe seu nome completo.');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Informe um e-mail valido.');
      return;
    }

    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      setErrorMessage('Informe um numero de telefone celular com DDD.');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      setErrorMessage('Sua senha deve atender a todos os requisitos minimos.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('As senhas digitadas nao coincidem.');
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMessage('Voce deve aceitar os termos de servico para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        await fetch(`${apiUrl}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: rawPhone,
            operationType: formData.operationType,
            password: formData.password,
          }),
        });
      } catch (networkErr) {
        console.warn('Backend em fallback local:', networkErr);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('bia_pending_verification_email', formData.email);
        localStorage.setItem('bia_registered_user_draft', JSON.stringify(formData));
      }

      setSuccessMessage('Cadastro realizado com sucesso. Redirecionando para validacao...');

      setTimeout(() => {
        router.push(`/validacao?email=${encodeURIComponent(formData.email)}`);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao registrar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setIsLoading(true);
    setSuccessMessage('Conectando via Google...');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'bia_session_user',
          JSON.stringify({
            name: 'Gestor Barone',
            email: 'gestor.google@baroneacademy.com.br',
            provider: 'google',
            operationType: formData.operationType,
          })
        );
      }
      router.push('/admin');
    }, 700);
  };

  return (
    <AuthSplitLayout
      title="Crie sua Conta"
      subtitle="Cadastre-se para acessar a BIA 360"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium animate-fadeIn">
            {successMessage}
          </div>
        )}

        {/* Nome */}
        <AuthInput
          id="register-name"
          placeholder="Nome Completo"
          autoComplete="name"
          required
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          disabled={isLoading}
        />

        {/* E-mail e Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            id="register-email"
            type="email"
            placeholder="Seu melhor e-mail"
            autoComplete="email"
            required
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            disabled={isLoading}
          />

          <AuthInput
            id="register-phone"
            type="tel"
            placeholder="(41) 99999-9999"
            autoComplete="tel"
            required
            icon={Phone}
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={isLoading}
          />
        </div>

        {/* Modalidade */}
        <div className="w-full">
          <select
            id="register-operation"
            value={formData.operationType}
            onChange={(e) => setFormData((prev) => ({ ...prev, operationType: e.target.value }))}
            disabled={isLoading}
            className="w-full py-3.5 px-4 text-sm rounded-2xl bg-white text-gray-950 font-medium border border-gray-200/50 outline-none focus:ring-2 focus:ring-[#c22ef3] cursor-pointer"
          >
            <option value="barbearia">Barbearia Profissional (Agenda e Atendimento)</option>
            <option value="escola">Escola de Barbeiros (Cursos e Turmas)</option>
            <option value="hibrido">Operacao Hibrida (Barbearia + Escola)</option>
          </select>
        </div>

        {/* Senha e Confirmar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            id="register-password"
            isPassword
            placeholder="Crie sua senha"
            autoComplete="new-password"
            required
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            disabled={isLoading}
          />

          <AuthInput
            id="register-confirm-password"
            isPassword
            placeholder="Confirme sua senha"
            autoComplete="new-password"
            required
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            disabled={isLoading}
          />
        </div>

        {/* Requisitos Visuais */}
        <PasswordRequirements password={formData.password} />

        {/* Aceite de Termos */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-[#887591] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData((prev) => ({ ...prev, acceptTerms: e.target.checked }))}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#c22ef3] focus:ring-[#c22ef3]"
            />
            <span>
              Concordo com os Termos de Servico e Politica de Privacidade da BIA 360.
            </span>
          </label>
        </div>

        {/* Botao de Cadastro */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-base tracking-wide shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_35px_rgba(255,255,255,0.4)] transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-gray-950" />
                <span>Processando...</span>
              </>
            ) : (
              <span>Criar Conta</span>
            )}
          </button>
        </div>

        {/* Google apenas */}
        <AuthSocialButtons onGoogleClick={handleGoogleClick} disabled={isLoading} />

        {/* Rodape */}
        <div className="text-center pt-4 text-xs sm:text-sm text-[#887591]">
          Ja possui uma conta?{' '}
          <Link
            href="/login"
            className="font-bold text-white hover:text-[#de74f6] underline underline-offset-4 transition-colors"
          >
            Fazer Login!
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
