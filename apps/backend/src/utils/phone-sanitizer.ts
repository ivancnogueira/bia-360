/**
 * Modulo de Sanitizacao de Telefonia e Normalizacao de Nomes
 * Adaptado do projeto de referencia para a plataforma BIA 360
 */

export function normalizeDigits(phone: string): string {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "");
}

/**
 * Formata um numero de telefone brasileiro para o padrao internacional canonico E.164:
 * Celular: 55 + DDD (2 digitos) + 9 + 8 digitos moveis (Total 13 digitos)
 * Fixo comercial / WhatsApp: 55 + DDD (2 digitos) + 8 digitos fixos (Total 12 digitos)
 */
export function formatBrazilianPhoneNumber(phone: string): string {
  const digits = normalizeDigits(phone);
  if (!digits) return "";

  // Caso 1: Comeca com 55 (Brasil)
  if (digits.startsWith("55")) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);

    if (/^[1-9][0-9]$/.test(ddd)) {
      if (rest.length === 9) {
        return `55${ddd}${rest}`;
      } else if (rest.length === 8) {
        const firstDigit = rest[0];
        // Se comeca com 2, 3, 4 ou 5, e telefone fixo
        if (["2", "3", "4", "5"].includes(firstDigit)) {
          return `55${ddd}${rest}`;
        }
        // Celular legado: adiciona o nono digito
        return `55${ddd}9${rest}`;
      }
    }
    return digits;
  }

  // Caso 2: Nao comeca com 55, mas tem tamanho de numero brasileiro
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (/^[1-9][0-9]$/.test(ddd)) {
      const firstDigit = rest[0];
      if (["2", "3", "4", "5"].includes(firstDigit)) {
        return `55${ddd}${rest}`;
      }
      return `55${ddd}9${rest}`;
    }
  }

  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (/^[1-9][0-9]$/.test(ddd)) {
      return `55${ddd}${rest}`;
    }
  }

  if (digits.length === 8 || digits.length === 9) {
    // Numero sem DDD: aplica DDD 41 (Curitiba, sede Barone) por conveniencia de fallback
    const ddd = "41";
    if (digits.length === 8) {
      const firstDigit = digits[0];
      if (["2", "3", "4", "5"].includes(firstDigit)) {
        return `55${ddd}${digits}`;
      }
      return `55${ddd}9${digits}`;
    }
    return `55${ddd}${digits}`;
  }

  return digits;
}

/**
 * Normaliza nomes proprios para exibicao amigavel
 */
export function sanitizeCustomerName(name: string): string {
  if (!name) return "Cliente";
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (word.length <= 2 && ["de", "da", "do", "das", "dos", "e"].includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

