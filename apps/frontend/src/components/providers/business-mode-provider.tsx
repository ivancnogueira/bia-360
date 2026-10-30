"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type BusinessType = "BARBERSHOP" | "ACADEMY" | "HYBRID";
export type BusinessViewFilter = "ALL" | "BARBERSHOP" | "ACADEMY";

export interface BusinessUnit {
  id: string;
  name: string;
  type: BusinessType;
}

interface BusinessModeContextState {
  currentUnit: BusinessUnit;
  businessType: BusinessType;
  activeFilter: BusinessViewFilter;
  units: BusinessUnit[];
  setUnit: (unitId: string) => void;
  setActiveFilter: (filter: BusinessViewFilter) => void;
  isBarbershopVisible: boolean;
  isAcademyVisible: boolean;
}

const defaultUnits: BusinessUnit[] = [
  { id: "unit-hybrid-matriz", name: "Matriz Centro (Híbrido)", type: "HYBRID" },
  { id: "unit-barbershop-norte", name: "Unidade Norte (Barbearia)", type: "BARBERSHOP" },
  { id: "unit-academy-sul", name: "Polo Academy (Escola)", type: "ACADEMY" },
];

const BusinessModeContext = createContext<BusinessModeContextState | undefined>(undefined);

export const BusinessModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUnit, setCurrentUnit] = useState<BusinessUnit>(defaultUnits[0]);
  const [activeFilter, setActiveFilterState] = useState<BusinessViewFilter>("ALL");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedUnitId = localStorage.getItem("bia360-selected-unit-id");
      if (savedUnitId) {
        const found = defaultUnits.find((u) => u.id === savedUnitId);
        if (found) setCurrentUnit(found);
      }

      const savedFilter = localStorage.getItem("bia360-active-filter") as BusinessViewFilter | null;
      if (savedFilter && ["ALL", "BARBERSHOP", "ACADEMY"].includes(savedFilter)) {
        setActiveFilterState(savedFilter);
      }
    } catch {
      // localStorage indisponível
    }
  }, []);

  const setUnit = (unitId: string) => {
    const found = defaultUnits.find((u) => u.id === unitId);
    if (!found) return;

    setCurrentUnit(found);
    try {
      localStorage.setItem("bia360-selected-unit-id", unitId);
    } catch {
      // localStorage indisponível
    }

    // Se mudar para unidade pura, ajusta o filtro automaticamente
    if (found.type === "BARBERSHOP") {
      setActiveFilterState("BARBERSHOP");
    } else if (found.type === "ACADEMY") {
      setActiveFilterState("ACADEMY");
    } else {
      setActiveFilterState("ALL");
    }
  };

  const setActiveFilter = (filter: BusinessViewFilter) => {
    setActiveFilterState(filter);
    try {
      localStorage.setItem("bia360-active-filter", filter);
    } catch {
      // localStorage indisponível
    }
  };

  const businessType = currentUnit.type;

  // Determinar seções visíveis com base no tipo de negócio e filtro ativo
  const isBarbershopVisible =
    businessType === "BARBERSHOP" ||
    (businessType === "HYBRID" && (activeFilter === "ALL" || activeFilter === "BARBERSHOP"));

  const isAcademyVisible =
    businessType === "ACADEMY" ||
    (businessType === "HYBRID" && (activeFilter === "ALL" || activeFilter === "ACADEMY"));

  return (
    <BusinessModeContext.Provider
      value={{
        currentUnit,
        businessType,
        activeFilter,
        units: defaultUnits,
        setUnit,
        setActiveFilter,
        isBarbershopVisible,
        isAcademyVisible,
      }}
    >
      {children}
    </BusinessModeContext.Provider>
  );
};

export const useBusinessMode = () => {
  const context = useContext(BusinessModeContext);
  if (!context) {
    throw new Error("useBusinessMode deve ser utilizado dentro de um BusinessModeProvider");
  }
  return context;
};

