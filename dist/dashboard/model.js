(function (scope) {
  'use strict';
  const defaults = {
    version: 1, horizon: 2, scenario: 'base', payoutMode: 'dividendos', audience: 2000, conversion: 20, collection: 100,
    plans: [
      { id: 'barbearia', name: 'Barbearia', beta: 199, regular: 299, weight: 40 },
      { id: 'escola', name: 'Escola', beta: 299, regular: 399, weight: 40 },
      { id: 'hibrido', name: 'Híbrido', beta: 449, regular: 599, weight: 20 }
    ],
    gateway: 3.89, gatewayFixed: 0, refunds: 0, tax: 6,
    acquisitions: [40, 70, 100, 140, 180], churn: 2.5, betaMonths: 12, betaReprice: true,
    prolabore: 1500, distribute: 50,
    variableCost: 32, onboarding: 35, infra: 1800, overhead: 1500,
    devMinimum: 1, devCapacity: 1500, devCost: 10000, costInflation: 5, settlementDays: 30,
    supportCapacity: 250, supportCost: 4500, cac: 180, launchMarketing: 0, initialCash: 0,
    universe: 1300000, marketFit: 35, payingFit: 40,
    marketplaceStart: 25, marketplaceAdoption: 15, marketplaceTicket: 180, marketplaceTake: 12, marketplaceOrders: 1,
    eventStart: 13, eventTickets: 2000, eventTicket: 400, eventTake: 8, eventFrequency: 1,
    feeOnGmv: true, splitOtherRevenue: true, visionStart: 13, visionAdoption: 15, visionPrice: 0, visionCost: 2,
    implementationEnabled: false, implementationRate: 5, implementationPrice: 790, implementationShare: 75, implementationCost: 350,
    multipleLow: 2, multipleBase: 3, multipleHigh: 5, riskDiscount: 35, cashAdjustment: 0, debt: 0,
    preMoney: 0, investment: 100000,
    partners: [
      { id: 'barone', name: 'Barone', role: 'Founder', share: 80, locked: false },
      { id: 'ivan', name: 'Ivan Nogueira', role: 'Founder', share: 20, locked: true }
    ]
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const percentFields = new Set(['conversion','collection','gateway','refunds','tax','churn','distribute','marketFit','payingFit','marketplaceAdoption','marketplaceTake','eventTake','visionAdoption','implementationRate','implementationShare','riskDiscount','costInflation']);
  const limits = { audience: [0, 10000000], horizon: [1, 5], betaMonths: [1, 60], supportCapacity: [1, 1000000], devCapacity: [1, 1000000], eventFrequency: [0, 12], universe: [0, 100000000], marketplaceStart: [1, 61], eventStart: [1, 61], visionStart: [1, 61], settlementDays: [0,90], eventTickets: [0,1000000], devMinimum: [0,100], marketplaceOrders: [0,100], multipleLow: [0,30], multipleBase: [0,30], multipleHigh: [0,30] };
  function normalize(input = {}) {
    const state = clone(defaults);
    for (const [key, fallback] of Object.entries(defaults)) {
      if (typeof fallback === 'number') {
        const candidate = Number(input[key] ?? fallback);
        const [min, max] = limits[key] || (percentFields.has(key) ? [0, 100] : [0, 1000000000]);
        state[key] = Math.max(min, Math.min(max, Number.isFinite(candidate) ? candidate : fallback));
      } else if (typeof fallback === 'boolean') state[key] = typeof input[key] === 'boolean' ? input[key] : fallback;
    }
    state.horizon = [1,2,5].includes(state.horizon) ? state.horizon : 2;
    state.audience = Math.round(state.audience);
    state.betaMonths = Math.round(state.betaMonths);
    for (const key of ['marketplaceStart','eventStart','visionStart','eventTickets','devMinimum']) state[key] = Math.round(state[key]);
    state.eventFrequency = [0,1,2,3,4,6,12].includes(state.eventFrequency) ? state.eventFrequency : 1;
    state.scenario = ['base','conservador','expansao','personalizado'].includes(input.scenario) ? input.scenario : 'base';
    state.payoutMode = input.payoutMode === 'coproducao' ? 'coproducao' : 'dividendos';
    state.acquisitions = defaults.acquisitions.map((fallback, i) => Math.max(0, Math.min(1000000, Number.isFinite(Number(input.acquisitions?.[i])) ? Number(input.acquisitions[i]) : fallback)));
    state.plans = defaults.plans.map((fallback, i) => {
      const entry = input.plans?.[i] || {};
      const valid = (key, max) => Math.max(0, Math.min(max, Number.isFinite(Number(entry[key])) ? Number(entry[key]) : fallback[key]));
      return { ...fallback, beta: valid('beta',100000), regular: valid('regular',100000), weight: valid('weight',100000) };
    });
    if (!state.plans.some(p => p.weight > 0)) state.plans.forEach((p,i) => { p.weight = defaults.plans[i].weight; });
    if (Array.isArray(input.partners)) {
      const others = input.partners.filter(p => p && p.id !== 'ivan').slice(0,19).map((p,i) => ({
        id: i === 0 ? 'barone' : 'partner-' + i,
        name: String(p.name || (i === 0 ? 'Barone' : 'Sócio ' + i)).slice(0,60),
        role: p.role === 'Founder' ? 'Founder' : 'Sócio',
        share: Math.max(0, Number.isFinite(Number(p.share)) ? Math.min(80,Number(p.share)) : 0), locked: false
      }));
      if (!others.length) others.push(clone(defaults.partners[0]));
      const sum = others.reduce((v,p) => v+p.share,0);
      others.forEach((p,i) => { p.share = sum > 0 ? p.share/sum*80 : (i === 0 ? 80 : 0); });
      state.partners = [others[0], clone(defaults.partners[1]), ...others.slice(1)];
    }
    return state;
  }
  function split(total, weights) {
    const sum = weights.reduce((a,b) => a+b,0) || 1;
    const raw = weights.map(w => total*w/sum);
    const result = raw.map(Math.floor);
    const ranking = raw.map((_,i) => i).sort((a,b) => raw[b]-result[b]-(raw[a]-result[a]) || a-b);
    for (let left = total-result.reduce((a,b) => a+b,0), i=0; i<left; i++) result[ranking[i%ranking.length]]++;
    return result;
  }
  function resizePartner(partners, id, value) {
    const result = clone(partners);
    const target = result.find(p => p.id === id);
    if (!target || target.locked) return result;
    const peers = result.filter(p => !p.locked && p.id !== id);
    if (!peers.length) { target.share = 80; return result; }
    const requested = Math.max(0,Math.min(80,Number(value)||0));
    const total = peers.reduce((sum,p) => sum+p.share,0);
    target.share = requested;
    peers.forEach((p,i) => { p.share = total > 0 ? p.share/total*(80-requested) : (i===0 ? 80-requested : 0); });
    result.find(p => p.id==='ivan').share=20;
    return result;
  }
  function addPartner(partners, name, share = 5) {
    if (partners.length>=20) throw new RangeError('Use até 20 participantes na simulação.');
    const result=clone(partners);
    let index=1; while(result.some(p=>p.id==='new-'+index)) index++;
    const id='new-'+index;
    result.push({id,name:String(name || 'Sócio '+index).slice(0,60),role:'Sócio',share:0,locked:false});
    return resizePartner(result,id,share);
  }
  function removePartner(partners,id) {
    if (id==='ivan' || id==='barone') return clone(partners);
    const result=clone(partners).filter(p=>p.id!==id);
    const sum=result.filter(p=>!p.locked).reduce((v,p)=>v+p.share,0);
    result.filter(p=>!p.locked).forEach((p,i)=>{p.share=sum>0 ? p.share/sum*80 : (i===0?80:0);});
    return result;
  }
  function round(partners,preMoney,investment) {
    if (!(preMoney>0 && investment>0)) return {valid:false,reason:'Defina um valor pré-money e um aporte positivos.'};
    const investor=investment/(preMoney+investment)*100;
    if (investor>80+1e-9) return {valid:false,reason:'O investidor ultrapassaria os 80% disponíveis. Ajuste aporte ou pré-money para preservar Ivan em 20%.'};
    const result=clone(partners).map(p=>({...p,share:p.locked?20:p.share*(80-investor)/80}));
    result.push({id:'investor',name:'Novo investidor',role:'Sócio',share:investor,locked:false});
    return {valid:true,preMoney,postMoney:preMoney+investment,investment,investor,partners:result};
  }
  function calculate(input, compare = true) {
    const s=normalize(input);
    const weights=s.plans.map(p=>p.weight), sum=weights.reduce((a,b)=>a+b,0);
    const betaArpu=s.plans.reduce((a,p)=>a+p.beta*p.weight/sum,0);
    const regularArpu=s.plans.reduce((a,p)=>a+p.regular*p.weight/sum,0);
    const signups=Math.floor(s.audience*s.conversion/100);
    const paid=Math.floor(signups*s.collection/100);
    const counts=split(paid,weights);
    const launchGross=counts.reduce((v,n,i)=>v+n*s.plans[i].beta,0);
    const initialArpu=paid>0?launchGross/paid:betaArpu;
    const sam=Math.floor(s.universe*s.marketFit/100*s.payingFit/100);
    const timeline=[];
    let beta=paid, regular=0, cash=s.initialCash, cumulativeResult=0, cumulativeDividends=0, minCash=cash;
    const partnerTotals=Object.fromEntries(s.partners.map(p=>[p.id,0]));
    for(let month=1;month<=60;month++) {
      const year=Math.ceil(month/12);
      const inflation=Math.pow(1+s.costInflation/100,year-1);
      const lost=month===1?0:(beta+regular)*s.churn/100;
      if(month>1){beta*=1-s.churn/100;regular*=1-s.churn/100;}
      const requested=month===1?0:s.acquisitions[year-1];
      const newClients=month===1?paid:Math.min(requested,Math.max(0,sam-beta-regular));
      if(month>1) regular+=newClients;
      const clients=beta+regular;
      const betaPrice=month<=s.betaMonths || !s.betaReprice ? initialArpu : regularArpu;
      const grossSaas=month===1?launchGross:beta*betaPrice+regular*regularArpu;
      const visionBuyers=month>=s.visionStart && s.visionPrice>0?clients*s.visionAdoption/100:0;
      const visionRevenue=visionBuyers*s.visionPrice;
      const mrr=grossSaas+visionRevenue;
      const refunds=mrr*s.refunds/100;
      const orders=month>=s.marketplaceStart?clients*s.marketplaceAdoption/100*s.marketplaceOrders:0;
      const marketplaceGmv=orders*s.marketplaceTicket;
      const marketplaceRevenue=marketplaceGmv*s.marketplaceTake/100;
      const eventDue=s.eventFrequency>0 && month>=s.eventStart && (month-s.eventStart)%(12/s.eventFrequency)===0;
      const tickets=eventDue?s.eventTickets:0;
      const eventGmv=tickets*s.eventTicket;
      const eventRevenue=eventGmv*s.eventTake/100;
      const implementations=s.implementationEnabled?newClients*s.implementationRate/100:0;
      const implementationRevenue=implementations*s.implementationPrice;
      const revenue=mrr-refunds+marketplaceRevenue+eventRevenue+implementationRevenue;
      const feeSaas=mrr*s.gateway/100+clients*s.gatewayFixed;
      const feeMarketplace=(s.feeOnGmv?marketplaceGmv:marketplaceRevenue)*s.gateway/100+orders*s.gatewayFixed;
      const feeEvent=(s.feeOnGmv?eventGmv:eventRevenue)*s.gateway/100+tickets*s.gatewayFixed;
      const feeImplementation=implementationRevenue*s.gateway/100+implementations*s.gatewayFixed;
      const implementationTransfer=Math.max(0,implementationRevenue-feeImplementation)*s.implementationShare/100;
      const gateway=feeSaas+feeMarketplace+feeEvent+feeImplementation;
      const taxes=revenue*s.tax/100;
      const support=Math.ceil(clients/s.supportCapacity-1e-10);
      const developers=Math.max(s.devMinimum,Math.ceil(clients/s.devCapacity-1e-10));
      const fixed=s.prolabore+(s.infra+s.overhead+support*s.supportCost+developers*s.devCost)*inflation;
      const variable=(clients*s.variableCost+visionBuyers*s.visionCost)*inflation;
      const onboarding=newClients*s.onboarding*inflation;
      const marketing=month===1?s.launchMarketing:newClients*s.cac*inflation;
      const eligibleSplit=Math.max(0,mrr-refunds-feeSaas+(s.splitOtherRevenue?marketplaceRevenue+eventRevenue-feeMarketplace-feeEvent:0));
      const producer=s.partners.find(p=>p.id==='barone');
      const coproduction=s.payoutMode==='coproducao'?eligibleSplit*(100-producer.share)/100:0;
      const implementationCost=implementations*s.implementationCost*inflation;
      const expenses=gateway+taxes+fixed+variable+onboarding+marketing+coproduction+implementationTransfer;
      if([revenue,expenses].some(value=>!Number.isFinite(value)||Math.abs(value)>Number.MAX_SAFE_INTEGER/100)) throw new RangeError('O cenário excede a precisão financeira disponível. Reduza quantidades ou valores.');
      const result=revenue-expenses;
      const available=Math.min(Math.max(0,result),Math.max(0,cash+result),Math.max(0,cumulativeResult+result-cumulativeDividends));
      const dividends=s.payoutMode==='dividendos'?available*s.distribute/100:0;
      cumulativeDividends+=dividends;
      cash+=result-dividends;
      cumulativeResult+=result;
      minCash=Math.min(minCash,cash);
      const allocations=s.partners.map(p=>({id:p.id,name:p.name,share:p.share,dividends:dividends*p.share/100,split:s.payoutMode==='coproducao'?eligibleSplit*p.share/100:0,implementation:p.id==='ivan'?implementationTransfer:0,implementationCost:p.id==='ivan'?implementationCost:0}));
      allocations.forEach(p=>{partnerTotals[p.id]+=s.payoutMode==='coproducao'?p.split:p.dividends;});
      const recurringSplit=s.payoutMode==='coproducao'?Math.max(0,mrr-refunds-feeSaas)*(100-producer.share)/100:0;
      const contribution=mrr-refunds-feeSaas-(mrr-refunds)*s.tax/100-variable-recurringSplit;
      timeline.push({month,year,clients,newClients,lost,beta,regular,mrr,arr:mrr*12,grossSaas,visionRevenue,marketplaceGmv,marketplaceRevenue,eventGmv,eventRevenue,implementations,implementationRevenue,implementationTransfer,feeImplementation,refunds,revenue,gateway,feeSaas,taxes,support,developers,fixed,variable,onboarding,marketing,coproduction,eligibleSplit,implementationCost,expenses,result,dividends,cash,cumulativeResult,allocations,contribution,contributionPerClient:clients>0?contribution/clients:0});
    }
    const years=[1,2,3,4,5].map(year=>{
      const rows=timeline.slice((year-1)*12,year*12);
      const last=rows[11];
      const sumKey=key=>rows.reduce((v,r)=>v+r[key],0);
      return {year,clients:last.clients,mrr:last.mrr,arr:last.arr,cash:last.cash,revenue:sumKey('revenue'),result:sumKey('result'),dividends:sumKey('dividends'),gateway:sumKey('gateway'),taxes:sumKey('taxes'),coproduction:sumKey('coproduction'),marketplaceGmv:sumKey('marketplaceGmv'),marketplaceRevenue:sumKey('marketplaceRevenue'),eventGmv:sumKey('eventGmv'),eventRevenue:sumKey('eventRevenue'),implementationRevenue:sumKey('implementationRevenue'),implementationTransfer:sumKey('implementationTransfer'),implementationCost:sumKey('implementationCost'),marketing:sumKey('marketing'),newClients:sumKey('newClients'),support:last.support,developers:last.developers,allocations:s.partners.map(p=>({...p,dividends:rows.reduce((v,r)=>v+(r.allocations.find(a=>a.id===p.id)?.dividends||0),0),split:rows.reduce((v,r)=>v+(r.allocations.find(a=>a.id===p.id)?.split||0),0),implementation:rows.reduce((v,r)=>v+(r.allocations.find(a=>a.id===p.id)?.implementation||0),0)}))};
    });
    const selected=years[s.horizon-1];
    const last=timeline[s.horizon*12-1];
    const valuations=[s.multipleLow,s.multipleBase,s.multipleHigh].map(multiple=>{
      const enterprise=selected.arr*multiple*(1-s.riskDiscount/100);
      return {multiple,enterprise,equity:Math.max(0,enterprise+s.cashAdjustment-s.debt)};
    });
    if(valuations.some(value=>!Number.isFinite(value.equity)||value.equity>Number.MAX_SAFE_INTEGER/100)) throw new RangeError('O valuation excede a precisão disponível. Reduza as premissas.');
    const launch=timeline[0];
    const launchFee=launchGross*s.gateway/100+paid*s.gatewayFixed;
    const launchNet=launchGross-launchFee;
    const ivan=launch.allocations.find(p=>p.id==='ivan');
    const riskWarnings=[];
    if(sam<paid) riskWarnings.push('As vendas do evento ultrapassam o mercado atendível escolhido. Revise o recorte de mercado.');
    if(last.clients>=sam && sam>0) riskWarnings.push('A aquisição atingiu o mercado atendível. O modelo limita novas adesões ao espaço disponível.');
    if(s.riskDiscount===0) riskWarnings.push('Valuation sem desconto de risco: a BIA ainda precisa comprovar retenção e execução.');
    if(s.marketplaceTake<s.gateway && s.feeOnGmv) riskWarnings.push('A comissão do marketplace não cobre nem a taxa percentual do checkout sobre o GMV.');
    if(s.eventTake<s.gateway && s.feeOnGmv) riskWarnings.push('A comissão dos ingressos não cobre a taxa percentual do checkout sobre a bilheteria.');
    const requiredCapital=Math.max(0,-minCash);
    const output={state:s,signups,paid,counts,betaArpu:initialArpu,regularArpu,sam,launchGross,launchFee,launchNet,launch,timeline,years,selected,valuations,partnerTotals,requiredCapital,riskWarnings,
      launchIvan:(s.payoutMode==='coproducao'?ivan.split:ivan.dividends)+s.prolabore+launch.implementationTransfer,
      retention12:Math.pow(1-s.churn/100,12)*100,
      ltv:s.churn>0 && last.contributionPerClient>0?last.contributionPerClient/(s.churn/100):null,
      cacPayback:last.contributionPerClient>0?s.cac*Math.pow(1+s.costInflation/100,s.horizon-1)/last.contributionPerClient:null,
      breakEven:last.contributionPerClient>0?Math.ceil(last.fixed/last.contributionPerClient):null,
      marketShare:sam>0?last.clients/sam*100:0,
      settlementReserve:(launch.fixed+launch.variable+launch.onboarding+launch.marketing+launch.taxes)*Math.min(90,s.settlementDays)/30,
      round:round(s.partners,s.preMoney,s.investment)
    };
    if(compare){
      const other=calculate({...s,payoutMode:s.payoutMode==='dividendos'?'coproducao':'dividendos'},false);
      const summarize=result=>({mode:result.state.payoutMode,launch:result.launch,launchIvan:result.launchIvan,selected:result.selected,years:result.years,requiredCapital:result.requiredCapital});
      output.comparison=[summarize(output),summarize(other)].sort((a,b)=>a.mode==='dividendos'?-1:1);
    }
    return output;
  }
  const api={defaults:()=>clone(defaults),normalize,calculate,split,resizePartner,addPartner,removePartner,round,money};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else scope.BiaBP=api;
})(typeof window!=='undefined'?window:globalThis);
