'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BiaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BiaLogo({ className, size = 'md' }: BiaLogoProps) {
  const heightClasses = {
    sm: 'h-6',
    md: 'h-7',
    lg: 'h-8',
  };

  return (
    <div
      className={cn(
        'relative aspect-[1316/377] flex-shrink-0 select-none',
        heightClasses[size],
        className
      )}
    >
      {/* Logotipo Oficial BIA 360 - Tipografia do 360 na mesma fonte, peso e altura do B */}
      <Image
        src="/bia-logo-360.png"
        alt="BIA 360"
        fill
        priority
        sizes="180px"
        className="object-contain dark:brightness-100 brightness-0 transition-all duration-200"
      />
    </div>
  );
}

/**
 * Versão SVG Vetorial Unificada BIA 360
 */
export function BiaLogoSvg({
  className = 'h-7 w-auto',
  starColor = '#10B981',
}: {
  className?: string;
  starColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 360 96"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-foreground flex-shrink-0', className)}
    >
      {/* ================= B (Y: 12 -> 84, Altura: 72) ================= */}
      <path
        d="M 12 12 H 44 C 58 12 66 20 66 31 C 66 39 60 45 52 47 C 62 50 68 57 68 68 C 68 79 58 84 44 84 H 12 V 12 Z M 27 25 V 42 H 41 C 47 42 51 39 51 33.5 C 51 28 47 25 41 25 H 27 Z M 27 54 V 71 H 42 C 48 71 53 67.5 53 62.5 C 53 57.5 48 54 42 54 H 27 Z"
        fill="currentColor"
      />
      <polygon points="59,84 68,73 68,84" fill="currentColor" />

      {/* ================= [IA] SQUIRCLE (Y: 12 -> 84, Altura: 72) ================= */}
      <rect
        x="80"
        y="12"
        width="72"
        height="72"
        rx="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="8.5"
      />
      <line
        x1="98"
        y1="29"
        x2="98"
        y2="67"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 115 67 L 124 29 L 133 67 M 117 55 H 131"
        fill="none"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Estrela de 4 pontas no topo direito do squircle */}
      <path
        d="M 152 4 Q 152 12 160 12 Q 152 12 152 20 Q 152 12 144 12 Q 152 12 152 4 Z"
        fill={starColor}
      />

      {/* ================= 3 6 0 (Y: 12 -> 84, Altura: 72 idêntica ao B) ================= */}
      <path
        d="M 174 12 H 212 C 220 12 225 17 225 24 C 225 30 220 35 212 37.5 C 222 40 227 47 227 56 C 227 72 216 84 198 84 C 187 84 178 81 173 77 V 62 C 178 66 186 69 194 69 C 204 69 210 64 210 56 C 210 48 203 44 192 44 H 183 V 32 H 192 C 201 32 208 28.5 208 23 C 208 17.5 203 14 193 14 C 185 14 179 17 174 20 Z"
        fill="currentColor"
      />
      <path
        d="M 278 24 L 265 14 C 257 20 252 28 250 37 C 254 34 259 32 265 32 C 277 32 286 41 286 58 C 286 73 276 84 262 84 C 246 84 236 71 236 48 C 236 26 248 12 266 12 C 271 12 275 13 278 15 Z M 251 58 C 251 66 256 71 262 71 C 267 71 271 66 271 58 C 271 50 267 45 262 45 C 256 45 251 50 251 58 Z"
        fill="currentColor"
      />
      <path
        d="M 298 48 C 298 24 308 12 323 12 C 338 12 348 24 348 48 C 348 72 338 84 323 84 C 308 84 298 72 298 48 Z M 313 48 C 313 65 316 71 323 71 C 330 71 333 65 333 48 C 333 31 330 25 323 25 C 316 25 313 31 313 48 Z"
        fill="currentColor"
      />
    </svg>
  );
}

