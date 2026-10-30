'use client';

import React, { useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (index: number, char: string) => {
    const rawChar = char.replace(/\D/g, '');
    const newOtp = [...digits];

    if (rawChar) {
      newOtp[index] = rawChar.slice(-1);
      onChange(newOtp.join(''));
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      newOtp[index] = '';
      onChange(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      onChange(pasteData);
      const nextFocus = Math.min(pasteData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full py-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-11 sm:w-13 h-13 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl bg-white/[0.07] border border-[#d798ff]/20 text-[#f7f2ff] focus:border-[#de74f6] focus:ring-2 focus:ring-[#c22ef3]/30 focus:bg-white/[0.12] outline-none transition-all disabled:opacity-50"
          aria-label={`Digito ${idx + 1} do codigo de verificacao`}
        />
      ))}
    </div>
  );
}

