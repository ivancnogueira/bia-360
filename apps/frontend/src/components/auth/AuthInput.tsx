'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  isPassword?: boolean;
}

export function AuthInput({
  label,
  id,
  type = 'text',
  icon: Icon,
  error,
  isPassword = false,
  className = '',
  disabled,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-semibold text-[#eee3f7] uppercase tracking-wider pl-1"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-2xl transition-all duration-200">
        <input
          id={id}
          type={inputType}
          disabled={disabled}
          className={`w-full py-3.5 sm:py-4 px-4 sm:px-5 text-sm sm:text-base rounded-2xl bg-white text-gray-950 placeholder:text-gray-400 font-medium transition-all duration-200 outline-none shadow-sm
            ${isPassword || Icon ? 'pr-12' : 'pr-4'}
            ${error 
              ? 'ring-2 ring-rose-500 border border-rose-500' 
              : 'border border-gray-200/40 focus:ring-2 focus:ring-[#c22ef3] focus:border-transparent'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}
            ${className}
          `}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        ) : Icon ? (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      {error && (
        <p className="text-xs text-rose-400 font-medium pl-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
}
