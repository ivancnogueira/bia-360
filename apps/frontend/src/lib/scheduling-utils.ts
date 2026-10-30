import { addMinutes, format, parse, isBefore, isAfter, getDay, addDays, startOfToday, differenceInMinutes, startOfDay } from 'date-fns';

export interface SlotOptions {
  duracaoMinutos: number;
  bufferAntes?: number;
  bufferDepois?: number;
  avisoMinimo?: number; // fallback em minutos
  slotInterval?: number;
  sessoesExistentes?: any[]; // agendamentos existentes no dia
  
  noticePeriod?: number;
  noticePeriodUnit?: string;
  limitFutureBookings?: boolean;
  limitFutureBookingsDays?: number;

  limitBookingFrequency?: boolean;
  limitBookingFrequencyCount?: number;
  limitBookingFrequencyUnit?: string;
  limitTotalBookingDuration?: boolean;
  limitTotalBookingDurationCount?: number;
  apenasProximoDisponivel?: boolean;
}

export function generateTimeSlots(
  date: Date,
  availability: any[],
  options: SlotOptions
) {
  const {
    duracaoMinutos,
    bufferAntes = 0,
    bufferDepois = 0,
    avisoMinimo = 120,
    slotInterval,
    sessoesExistentes = [],
    noticePeriod,
    noticePeriodUnit,
    limitFutureBookings,
    limitFutureBookingsDays,
    limitBookingFrequency,
    limitBookingFrequencyCount,
    limitBookingFrequencyUnit,
    limitTotalBookingDuration,
    limitTotalBookingDurationCount,
    apenasProximoDisponivel = false
  } = options;

  // 0. Janela de Agendamento Futuro
  if (limitFutureBookings && limitFutureBookingsDays) {
    const maxDate = addDays(startOfToday(), limitFutureBookingsDays);
    if (isAfter(startOfDay(date), startOfDay(maxDate))) {
      return [];
    }
  }

  // 0.1 Frequência Diária
  if (limitBookingFrequency && limitBookingFrequencyUnit === 'day' && limitBookingFrequencyCount) {
    if (sessoesExistentes.length >= limitBookingFrequencyCount) {
      return [];
    }
  }

  // 0.2 Duração Diária Total
  if (limitTotalBookingDuration && limitTotalBookingDurationCount) {
    const duracaoAtual = sessoesExistentes.reduce((acc, s) => acc + (s.duracao || duracaoMinutos), 0);
    if (duracaoAtual + duracaoMinutos > limitTotalBookingDurationCount) {
      return [];
    }
  }

  // 1. Aviso Mínimo
  let totalAvisoMinutos = avisoMinimo;
  if (noticePeriod && noticePeriodUnit) {
    if (noticePeriodUnit === 'hours') totalAvisoMinutos = noticePeriod * 60;
    else if (noticePeriodUnit === 'days') totalAvisoMinutos = noticePeriod * 24 * 60;
    else totalAvisoMinutos = noticePeriod;
  }

  const slots: string[] = [];
  const diaSemana = getDay(date);
  const now = new Date();
  const dateString = format(date, 'yyyy-MM-dd');

  // 2. Overrides de data vs Recorrente
  const overridesHoje = availability.filter(a => {
    if (!a.date) return false;
    const aDateStr = typeof a.date === 'string' ? a.date.split('T')[0] : format(new Date(a.date), 'yyyy-MM-dd');
    return aDateStr === dateString;
  });
  
  let disponibilidadeEfetiva = [];
  if (overridesHoje.length > 0) {
    const isExplicitlyBlocked = overridesHoje.some(o => o.startTime === '00:00' && o.endTime === '00:00');
    if (isExplicitlyBlocked) return [];
    disponibilidadeEfetiva = overridesHoje;
  } else {
    disponibilidadeEfetiva = availability.filter(a => a.days && a.days.includes(diaSemana));
  }

  if (disponibilidadeEfetiva.length === 0) return [];

  // 3. Gerar slots para cada faixa
  for (const faixa of disponibilidadeEfetiva) {
    if (!faixa.startTime || !faixa.endTime || faixa.startTime === faixa.endTime) continue;

    let current = parse(faixa.startTime, 'HH:mm', date);
    const end = parse(faixa.endTime, 'HH:mm', date);
    
    const step = slotInterval || duracaoMinutos;

    while (isBefore(addMinutes(current, duracaoMinutos), addMinutes(end, 1))) {
      const timeStr = format(current, 'HH:mm');
      
      const diff = differenceInMinutes(current, now);
      const isTooSoon = diff < totalAvisoMinutos;

      const hasConflict = sessoesExistentes.some(sessao => {
        const sessaoStart = parse(sessao.hora, 'HH:mm', date);
        const sessaoEnd = addMinutes(sessaoStart, sessao.duracao || duracaoMinutos);
        
        const newSlotStart = addMinutes(current, -bufferAntes);
        const newSlotEnd = addMinutes(current, duracaoMinutos + bufferDepois);
        
        const existingStart = addMinutes(sessaoStart, -(sessao.bufferAntes || 0));
        const existingEnd = addMinutes(sessaoEnd, (sessao.bufferDepois || 0));

        return isBefore(newSlotStart, existingEnd) && isAfter(newSlotEnd, existingStart);
      });

      if (!isTooSoon && !hasConflict) {
        slots.push(timeStr);
        if (apenasProximoDisponivel) return slots;
      }

      current = addMinutes(current, step);
    }
  }

  return slots;
}

export function getNextAvailableDates(availability: any[], daysCount: number = 30) {
  const dates: Date[] = [];
  const now = startOfToday();
  
  const availableDays = new Set<number>();
  availability.forEach(a => {
    if (a.days && !a.date) a.days.forEach((d: number) => availableDays.add(d));
  });

  for (let i = 0; i < daysCount; i++) {
    const d = addDays(now, i);
    const dateString = format(d, 'yyyy-MM-dd');
    
    const overridesParaODia = availability.filter(a => {
      if (!a.date) return false;
      const aDateStr = typeof a.date === 'string' ? a.date.split('T')[0] : format(new Date(a.date), 'yyyy-MM-dd');
      return aDateStr === dateString;
    });

    const isExplicitlyBlocked = overridesParaODia.some(o => o.startTime === '00:00' && o.endTime === '00:00');
    const isDayOfWeekAvailable = availableDays.has(getDay(d));

    if ((overridesParaODia.length > 0 && !isExplicitlyBlocked) || (overridesParaODia.length === 0 && isDayOfWeekAvailable)) {
      dates.push(d);
    }
  }
  return dates;
}

