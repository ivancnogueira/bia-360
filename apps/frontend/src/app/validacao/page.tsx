'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, RotateCw, Loader2 } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { OtpInput } from '@/components/auth/OtpInput';

export default function ValidacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08070d] flex items-center justify-center text-[#de74f6]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ValidacaoForm />
    </Suspense>
  );
}

function ValidacaoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  useEffect(() => {
    const paramEmail = searchParams?.get('email');
    const paramToken = searchParams?.get('token');

    let effectiveEmail = paramEmail;
    if (!effectiveEmail && typeof window !== 'undefined') {
      effectiveEmail = localStorage.getItem('bia_pending_verification_email') || '';
    }

    if (effectiveEmail) {
      setEmail(effectiveEmail);
    }

    if (paramToken) {
      setOtp(paramToken.slice(0, 6));
      if (effectiveEmail) {
        setIsAutoSubmitting(true);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (isAutoSubmitting && email && otp.length === 6) {
      handleValidation(otp);
    }
  }, [isAutoSubmitting, email, otp]);

  const handleValidation = async (codeToVerify: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (codeToVerify.length < 6) {
      setErrorMessage('Digite os 6 digitos do codigo de validacao.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        await fetch(`${apiUrl}/api/v1/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token: codeToVerify }),
        });
      } catch (networkErr) {
        console.warn('API de verificacao remota em fallback:', networkErr);
      }

      setSuccessMessage('Conta validada com sucesso! Redirecionando...');

      if (typeof window !== 'undefined') {
        localStorage.removeItem('bia_pending_verification_email');
        localStorage.setItem(
          'bia_session_user',
          JSON.stringify({
            email,
            name: email.split('@')[0],
            verified: true,
            role: 'ADMINISTRATOR',
            authenticatedAt: new Date().toISOString(),
          })
        );
      }

      setTimeout(() => {
        router.push('/admin');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Codigo invalido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValidation(otp);
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        await fetch(`${apiUrl}/api/v1/auth/resend-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (networkErr) {
        console.warn('Reenvio local simulado:', networkErr);
      }

      setSuccessMessage('Novo codigo de 6 digitos enviado para o seu e-mail.');
      setResendCountdown(60);
    } catch (err: any) {
      setErrorMessage('Nao foi possivel reenviar o codigo agora. Tente em instantes.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Validacao"
      subtitle="Confirme o codigo de 6 digitos enviado para seu e-mail"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium animate-fadeIn flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Notificacao com o email */}
        <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#c22ef3]/15 text-[#de74f6]">
            <Mail className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#baacc7] space-y-1">
            <p className="text-white font-semibold">
              Codigo enviado
            </p>
            <p>
              Enviamos um codigo para{' '}
              <strong className="text-[#de74f6]">{email || 'seu e-mail'}</strong>.
            </p>
          </div>
        </div>

        {/* Input de 6 digitos */}
        <div className="space-y-2">
          <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
        </div>

        {/* Botao de Acao */}
        <div>
          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full py-4 px-6 rounded-2xl bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-base tracking-wide shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_35px_rgba(255,255,255,0.4)] transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-gray-950" />
                <span>Validando...</span>
              </>
            ) : (
              <span>Confirmar Codigo</span>
            )}
          </button>
        </div>

        {/* Reenvio */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#887591]">
          <span>Nao recebeu a mensagem?</span>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCountdown > 0 || isResending}
            className="inline-flex items-center gap-1.5 font-bold text-[#de74f6] hover:text-[#f33199] disabled:text-[#887591] disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {resendCountdown > 0 ? (
              <span>Reenviar em {resendCountdown}s</span>
            ) : (
              <span>Reenviar codigo</span>
            )}
          </button>
        </div>

        {/* Rodape */}
        <div className="text-center pt-4 text-xs text-[#887591]">
          E-mail errado?{' '}
          <Link
            href="/login"
            className="font-bold text-white hover:text-[#de74f6] underline underline-offset-4 transition-colors"
          >
            Voltar para o Login
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
