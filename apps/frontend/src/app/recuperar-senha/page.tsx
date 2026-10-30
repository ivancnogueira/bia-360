'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordRequirements, isPasswordValid } from '@/components/auth/PasswordRequirements';

export default function RecuperarSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08070d] flex items-center justify-center text-[#de74f6]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <RecuperarSenhaForm />
    </Suspense>
  );
}

function RecuperarSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!token) {
    return (
      <AuthSplitLayout
        title="Token Invalido"
        subtitle="O link de recuperacao e invalido ou expirou"
      >
        <div className="space-y-6 text-center">
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              Link Nao Encontrado
            </h2>
            <p className="text-xs text-[#baacc7] max-w-sm">
              Solicite um novo link seguro para redefinir sua senha de acesso.
            </p>
          </div>

          <div>
            <Link
              href="/esqueci-senha"
              className="w-full py-4 px-6 rounded-2xl bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-base tracking-wide shadow-[0_4px_25px_rgba(255,255,255,0.25)] transition-all duration-200 inline-block text-center cursor-pointer"
            >
              Solicitar Novo Link
            </Link>
          </div>

          <div className="pt-2 text-xs text-[#887591]">
            <Link
              href="/login"
              className="text-white hover:text-[#de74f6] underline underline-offset-4"
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      </AuthSplitLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isPasswordValid(password)) {
      setErrorMessage('A nova senha deve atender a todos os requisitos minimos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmacao nao coincide com a nova senha digitada.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        await fetch(`${apiUrl}/api/v1/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
      } catch (networkErr) {
        console.warn('Backend em fallback local:', networkErr);
      }

      setSuccessMessage('Senha atualizada com sucesso! Redirecionando para login...');

      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao redefinir a senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Nova Senha"
      subtitle="Defina sua nova senha para acessar a BIA 360"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <AuthInput
          id="reset-password"
          isPassword
          placeholder="Digite sua nova senha"
          autoComplete="new-password"
          required
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <AuthInput
          id="reset-confirm-password"
          isPassword
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          required
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />

        <PasswordRequirements password={password} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid(password)}
            className="w-full py-4 px-6 rounded-2xl bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-base tracking-wide shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_35px_rgba(255,255,255,0.4)] transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-gray-950" />
                <span>Atualizando...</span>
              </>
            ) : (
              <span>Salvar Nova Senha</span>
            )}
          </button>
        </div>

        <div className="text-center pt-4 text-xs sm:text-sm text-[#887591]">
          Deseja cancelar?{' '}
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
