'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
}

export function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const reqs = validatePassword(password);
  return reqs.length && reqs.uppercase && reqs.number && reqs.special;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const reqs = validatePassword(password);

  const items = [
    { label: 'Minimo de 8 caracteres', met: reqs.length },
    { label: 'Pelo menos uma letra maiuscula', met: reqs.uppercase },
    { label: 'Pelo menos um numero', met: reqs.number },
    { label: 'Pelo menos um caractere especial', met: reqs.special },
  ];

  if (!password) {
    return null;
  }

  return (
    <div className="p-3 rounded-2xl bg-white/[0.04] border border-[#d798ff]/15 text-xs space-y-1.5 transition-all">
      <span className="font-semibold text-[#eee3f7] block mb-1">
        Requisitos de seguranca da senha:
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-1.5 transition-colors ${
              item.met ? 'text-emerald-400' : 'text-[#887591]'
            }`}
          >
            {item.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-[#887591] flex-shrink-0" />
            )}
            <span className="leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

