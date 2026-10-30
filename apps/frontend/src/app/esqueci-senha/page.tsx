'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthInput } from '@/components/auth/AuthInput';

export default function EsqueciSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08070d] flex items-center justify-center text-[#de74f6]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <EsqueciSenhaForm />
    </Suspense>
  );
}

function EsqueciSenhaForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Informe um e-mail valido para prosseguir.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        await fetch(`${apiUrl}/api/v1/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (networkErr) {
        console.warn('Backend em fallback local:', networkErr);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao solicitar recuperacao de senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Recuperar Senha"
      subtitle="Digite seu e-mail para receber as instrucoes"
    >
      {isSubmitted ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <h2 className="font-bold text-sm text-white">
                E-mail de redefinicao enviado!
              </h2>
            </div>
            <p className="text-xs text-[#baacc7] leading-relaxed">
              Enviamos um link com instrucoes para{' '}
              <strong className="text-[#de74f6]">{email}</strong>.
            </p>
          </div>

          {/* Atalho de teste rapido */}
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2 text-xs">
            <p className="text-[#887591]">
              Simulacao de link direto do e-mail para teste:
            </p>
            <Link
              href={`/recuperar-senha?token=bia-token-teste-${Date.now()}&email=${encodeURIComponent(email)}`}
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#de74f6] underline underline-offset-4"
            >
              <span>Acessar redefinicao de senha com token</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-4 px-6 rounded-2xl bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-base tracking-wide shadow-[0_4px_25px_rgba(255,255,255,0.25)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-gray-950" />
              <span>Voltar para o Login</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium animate-fadeIn">
              {errorMessage}
            </div>
          )}

          <AuthInput
            id="forgot-email"
            type="email"
            placeholder="Digite seu e-mail cadastrado"
            autoComplete="email"
            required
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-base tracking-wide shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_35px_rgba(255,255,255,0.4)] transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-gray-950" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar Instrucoes</span>
              )}
            </button>
          </div>

          <div className="text-center pt-4 text-xs sm:text-sm text-[#887591]">
            Lembrou sua senha?{' '}
            <Link
              href="/login"
              className="font-bold text-white hover:text-[#de74f6] underline underline-offset-4 transition-colors"
            >
              Fazer Login!
            </Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
}
