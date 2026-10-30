"use client";

import React, { useEffect, useState, useRef } from "react";

export interface MoneyInputProps {
  value: number | undefined | null; // Valor numérico em Reais (ex: 60 ou 60.5)
  onChange: (value: number) => void;
  currencySymbol?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
}

export function MoneyInput({
  value,
  onChange,
  currencySymbol = "R$",
  placeholder = "0,00",
  disabled = false,
  required = false,
  autoFocus = false,
  readOnly = false,
  className = "",
  inputClassName = "",
  id,
  name,
  "aria-label": ariaLabel,
}: MoneyInputProps) {
  // Converte número puro para string formatada pt-BR
  const formatNumberToMask = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num) || num === 0) {
      return "";
    }
    const cents = Math.round(num * 100);
    const integerPart = Math.floor(cents / 100);
    const decimalPart = cents % 100;
    const integerFormatted = integerPart.toLocaleString("pt-BR");
    const decimalStr = decimalPart.toString().padStart(2, "0");
    return `${integerFormatted},${decimalStr}`;
  };

  const [displayValue, setDisplayValue] = useState<string>(() => formatNumberToMask(value));
  const isInternalChange = useRef(false);

  // Sincroniza quando o valor externo mudar sem ser digitação própria
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setDisplayValue(formatNumberToMask(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return;

    const raw = e.target.value;
    // Extrai apenas dígitos
    const digits = raw.replace(/\D/g, "");

    if (!digits || digits === "0") {
      isInternalChange.current = true;
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Limite de 12 dígitos para evitar estouro de precisão
    const safeDigits = digits.slice(0, 12);
    const numericValue = Number(safeDigits) / 100;

    const integerPart = safeDigits.slice(0, -2) || "0";
    const decimalPart = safeDigits.slice(-2).padStart(2, "0");
    const integerNumber = Number(integerPart);
    const integerFormatted = integerNumber.toLocaleString("pt-BR");
    const formatted = `${integerFormatted},${decimalPart}`;

    isInternalChange.current = true;
    setDisplayValue(formatted);
    onChange(numericValue);
  };

  return (
    <div
      className={`relative flex items-center rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0B0D11] transition-all focus-within:ring-2 focus-within:ring-[#c22ef3]/20 focus-within:border-[#c22ef3] ${
        disabled ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-white/5" : ""
      } ${className}`}
    >
      <span className="pointer-events-none select-none pl-3 text-xs font-black text-gray-500 dark:text-gray-400">
        {currencySymbol}
      </span>
      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        aria-label={ariaLabel}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-transparent px-2.5 py-2 text-sm text-gray-900 dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none disabled:cursor-not-allowed ${inputClassName}`}
      />
    </div>
  );
}

