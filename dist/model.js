(function (scope) {
  'use strict';
  const plans = Object.freeze({ barbearia: 199, escola: 299, hibrido: 449 });
  function roundMoney(value) { return Math.round((value + Number.EPSILON) * 100) / 100; }
  function distribute(total, weights = { barbearia: 40, escola: 40, hibrido: 20 }) {
    if (!Number.isSafeInteger(total) || total < 0) throw new RangeError('Quantidade inválida.');
    const keys = Object.keys(plans);
    const raw = keys.map(key => { const value = Number(weights[key]); return Number.isFinite(value) && value > 0 ? value : 0; });
    const sum = raw.reduce((a, b) => a + b, 0);
    const active = sum > 0 ? raw : [40, 40, 20];
    const base = sum > 0 ? sum : 100;
    const shares = active.map(value => total * value / base);
    const parts = shares.map(Math.floor);
    const ranking = keys.map((key, i) => i).sort((a, b) => (shares[b] - parts[b]) - (shares[a] - parts[a]));
    const missing = total - parts.reduce((a, b) => a + b, 0);
    for (let i = 0; i < missing; i++) parts[ranking[i % ranking.length]]++;
    return Object.fromEntries(keys.map((key, i) => [key, parts[i]]));
  }
  function calculate(counts, settings = {}) {
    const values = Object.keys(plans).map(key => {
      const count = Number(counts[key] ?? 0);
      if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Use quantidades inteiras, a partir de zero.');
      return [key, count];
    });
    const clients = values.reduce((sum, item) => sum + item[1], 0);
    const revenue = values.reduce((sum, item) => sum + item[1] * plans[item[0]], 0);
    const audience = Number(settings.audience ?? 2000);
    const otherCosts = Number(settings.otherCosts ?? 0);
    if (!Number.isSafeInteger(audience) || audience < 1) throw new RangeError('Informe um público maior que zero.');
    if (!Number.isFinite(otherCosts) || otherCosts < 0) throw new RangeError('Informe custos a partir de zero.');
    if (!Number.isSafeInteger(clients) || !Number.isSafeInteger(revenue * 100) || !Number.isSafeInteger(Math.round(otherCosts * 100))) throw new RangeError('O valor informado excede a precisão da calculadora.');
    const averageTicket = clients > 0 ? revenue / clients : 289;
    const retainedPerClientB = averageTicket * .9;
    const setupClients = Math.ceil(7000 / retainedPerClientB);
    const setupAndBaseClients = Math.ceil((8500 + otherCosts) / retainedPerClientB);
    const launchA = roundMoney(revenue * .4);
    const launchB = roundMoney(7000 + revenue * .1);
    return Object.freeze({ clients, revenue, launchA, launchB,
      recurring: roundMoney(1500 + revenue * .15), audience, otherCosts,
      conversionPercent: roundMoney(clients / audience * 100), averageTicket: roundMoney(averageTicket),
      ticketBasis: clients > 0 ? 'mix atual' : 'mix de referência 40% / 40% / 20%',
      savingB: roundMoney(launchA - launchB),
      baroneCashB: roundMoney(revenue - launchB - 1500 - otherCosts),
      setupClients, setupAndBaseClients,
      setupConversion: roundMoney(setupClients / audience * 100),
      setupAndBaseConversion: roundMoney(setupAndBaseClients / audience * 100),
      proposalParityRevenue: 23333.33
    });
  }
  const model = Object.freeze({ plans, calculate, distribute });
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  else scope.BiaModel = model;
})(typeof window !== 'undefined' ? window : globalThis);
