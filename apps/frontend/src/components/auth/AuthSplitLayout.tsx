'use client';

import React from 'react';
import Link from 'next/link';
import { asset } from '@/data/product';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthSplitLayout({
  children,
  title,
  subtitle,
}: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen w-full bg-[#08070d] text-[#f7f2ff] relative overflow-hidden flex flex-col justify-center selection:bg-[#c22ef3] selection:text-white">
      {/* Luzes neon suaves de ambientacao cinematografica */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#c22ef3]/12 rounded-full blur-[160px]" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-[#f33199]/10 rounded-full blur-[160px]" 
      />

      {/* Grid Full Screen: Sem caixas ou bordas limitantes */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* Lado Esquerdo: Imagem da BIA Full Height sem caixa, sem circulo e sem borda */}
        <section 
          aria-label="Apresentacao Visual da BIA"
          className="relative lg:col-span-6 xl:col-span-7 h-[420px] sm:h-[500px] lg:h-screen w-full flex items-end justify-center lg:justify-end overflow-hidden lg:pr-6 xl:pr-12 pt-8 lg:pt-0"
        >
          {/* Efeito de luz neon violeta concentrado atras da BIA */}
          <div 
            aria-hidden="true" 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-1/3 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-gradient-to-tr from-[#c22ef3]/30 via-[#f33199]/20 to-transparent rounded-full blur-3xl pointer-events-none" 
          />

          {/* Avatar Oficial BIA: Full, surgindo do fundo preto */}
          <div className="relative z-10 w-full h-full flex items-end justify-center lg:justify-end">
            <img
              src={asset('/images/bia.png')}
              alt="BIA - Inteligencia Artificial da Barone Academy"
              className="w-auto h-[95%] max-h-[88vh] sm:max-h-[92vh] object-contain object-bottom select-none pointer-events-none filter drop-shadow-[0_20px_60px_rgba(194,46,243,0.4)] transition-transform duration-700 hover:scale-[1.02]"
              fetchPriority="high"
            />
          </div>

          {/* Degradê suave na base para fusao perfeita com o fundo escuro */}
          <div 
            aria-hidden="true" 
            className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#08070d] via-[#08070d]/60 to-transparent pointer-events-none z-20" 
          />
        </section>

        {/* Lado Direito: Formulario Clean diretamente no fundo escuro, sem caixa externa */}
        <section 
          aria-label="Formulario de Acesso"
          className="relative lg:col-span-6 xl:col-span-5 w-full flex flex-col justify-center px-6 sm:px-12 lg:px-10 xl:px-16 py-10 lg:py-16 z-20"
        >
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Logo e Titulo Oficial */}
            <div className="mb-6 sm:mb-8 text-left">
              <Link 
                href="/" 
                className="inline-block mb-4 transition-opacity hover:opacity-80"
                title="Ir para pagina inicial"
              >
                <img
                  src={asset('/images/logo.png')}
                  alt="BIA 360"
                  className="h-8 w-auto object-contain filter brightness-110"
                />
              </Link>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2 text-sm sm:text-base text-[#baacc7] leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Formulario Ativo */}
            <div className="w-full">
              {children}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
