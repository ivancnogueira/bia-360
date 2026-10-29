"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#08070d]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Conteudo do Modal */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} rounded-2xl bg-[#100b17] border border-[#d798ff44] shadow-2xl shadow-purple-950/50 p-6 z-10 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between border-b border-[#d798ff22] pb-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#f7f2ff] tracking-tight">{title}</h2>
            {description ? (
              <p className="text-xs text-[#baacc7] mt-1">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#baacc7] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

