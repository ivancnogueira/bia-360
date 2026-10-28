(function () {
  'use strict';
  const doc=document, BP=window.BiaBP, storageKey='bia-bp-20261028-v1';
  const colors=['#b5ef8a','#b5a2fc','#edc18a','#88bcf5','#e29ccd','#7cdbcf','#d1cf87'];
  const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
  const precise=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2});
  const number=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
  const decimal=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2});
  const compact=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1});
  const currency=value=>Number.isFinite(value)?brl.format(value):'Não estimado';
  const exact=value=>Number.isFinite(value)?precise.format(value):'Não estimado';
  const pct=value=>decimal.format(value)+'%';
  const count=value=>number.format(value);
  const $=id=>doc.getElementById(id);
  const set=(id,value)=>{$(id).textContent=value;};
  function el(tag,className,text){const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  let state=loadState(), current, saveTimer, toastTimer, resizeTimer;
  function loadState(){
    try {
      if(location.hash.startsWith('#scenario=')){
        const encoded=location.hash.slice(10);
        if(encoded.length>60000)throw new Error('Cenário muito grande.');
        return BP.normalize(JSON.parse(decodeURIComponent(escape(atob(encoded.replace(/-/g,'+').replace(/_/g,'/'))))));
      }
      const stored=localStorage.getItem(storageKey);
      if(stored)return BP.normalize(JSON.parse(stored));
    }catch(_){ }
    return BP.defaults();
  }
  function toast(message){set('toast',message);$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},4300);}
  function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));set('saved-status','Salvo neste navegador');}catch(_){set('saved-status','Memória local indisponível');}},220);}
  function makeField(key,label,options={}){
    const wrapper=el('label','field'+(options.suffix?' has-suffix':'')+(options.prefix?' has-prefix':''));
    wrapper.append(el('span','',label));
    const container=el('span','field-input');
    const input=doc.createElement(key==='eventFrequency'?'select':'input');
    if(key==='eventFrequency'){
      [0,1,2,3,4,6,12].forEach(value=>{const option=el('option','',String(value));option.value=value;input.append(option);});
    }else input.type='number';
    input.min=options.min??0; input.max=options.max??1000000000; input.step=options.step??1;
    input.inputMode=options.step && options.step<1?'decimal':'numeric';
    if(options.arrayIndex!==undefined){input.dataset.arrayIndex=options.arrayIndex;input.id='acquisition-'+options.arrayIndex;}
    else if(options.planIndex!==undefined){input.dataset.planIndex=options.planIndex;input.dataset.planKey=key;input.id='plan-'+options.planIndex+'-'+key;}
    else{input.dataset.field=key;input.id='field-'+key;}
    wrapper.htmlFor=input.id;
    if(options.prefix)container.append(el('span','input-prefix',options.prefix));
    container.append(input);
    if(options.suffix)container.append(el('span','input-suffix',options.suffix));
    wrapper.append(container);
    if(options.help)wrapper.append(el('small','',options.help));
    return wrapper;
  }
  const percent={suffix:'%',step:.1,max:100}, cash={prefix:'R$',step:1};
  const schemas={
    'launch-controls':[
      ['audience','Participantes no BSV',{suffix:'pessoas',max:10000000}],
      ['conversion','Adesão à oferta',{...percent,help:'Premissa do evento, não previsão validada.'}],
      ['collection','Adesões com pagamento',{...percent,help:'Proporção que paga a primeira mensalidade.'}],
      ['betaMonths','Condição beta',{suffix:'meses',min:1,max:60}]
    ],
    'checkout-controls':[
      ['gateway','Taxa percentual Greenn',{...percent,step:.01}],['gatewayFixed','Tarifa por cobrança',{...cash,step:.01}],
      ['refunds','Reembolsos previstos',percent],['tax','Provisão tributária', {...percent,help:'Hipótese da operação, confirme o regime aplicável.'}]
    ],
    'retention-controls':[
      ['churn','Cancelamento mensal',{...percent,step:.1}],['distribute','Resultado disponível a distribuir',{...percent,help:'Só no modo dividendos. O restante fica no negócio.'}]
    ],
    'cost-controls':[
      ['prolabore','Pró-labore mensal de Ivan',{...cash,help:'Garantido mesmo sem vendas; separado da participação.'}],
      ['variableCost','IA e uso por conta / mês',cash],['onboarding','Ativação por novo cliente',cash],['infra','Infraestrutura fixa / mês',cash],
      ['overhead','Administrativo / mês',cash],['devMinimum','Equipe dev mínima',{suffix:'pessoas',max:100}],
      ['devCost','Custo por dev / mês',cash],['devCapacity','Contas por profissional dev',{suffix:'contas',min:1}],
      ['supportCost','Custo por suporte / mês',cash],['supportCapacity','Contas por suporte',{suffix:'contas',min:1}],
      ['cac','Aquisição por novo cliente',cash],['launchMarketing','Divulgação alocada ao lançamento',cash],
      ['costInflation','Reajuste anual dos custos',{...percent,help:'Não reajusta automaticamente o pró-labore.'}],
      ['settlementDays','Prazo de repasse estimado',{suffix:'dias',max:90,help:'Reserva de giro; não muda o mês econômico.'}],
      ['initialCash','Caixa inicial disponível',cash]
    ],
    'market-controls':[
      ['universe','Universo amplo de referência',{suffix:'CNPJs',max:100000000}],
      ['marketFit','Negócios compatíveis com a oferta',{...percent,help:'Hipótese de recorte, não estatística oficial.'}],
      ['payingFit','Com perfil para contratar',{...percent,help:'Filtra o recorte anterior; evita tratar todo CNPJ como venda.'}]
    ],
    'valuation-controls':[
      ['multipleLow','Múltiplo de sensibilidade baixo',{suffix:'× ARR',step:.1,max:30}],
      ['multipleBase','Múltiplo do cenário base',{suffix:'× ARR',step:.1,max:30}],
      ['multipleHigh','Múltiplo de sensibilidade alto',{suffix:'× ARR',step:.1,max:30}],
      ['riskDiscount','Ajuste de risco',{...percent,help:'Hipótese de redução, não índice de mercado.'}],
      ['cashAdjustment','Caixa livre para valuation',cash],['debt','Dívida financeira a deduzir',cash]
    ],
    'round-controls':[['preMoney','Pré-money para a rodada',cash],['investment','Aporte do investidor',cash]],
    'vision-controls':[
      ['visionStart','Começa no mês',{min:1,max:61}],['visionAdoption','Clientes aderentes',percent],
      ['visionPrice','Add-on por mês',{...cash,help:'Zero até validar uma oferta paga.'}],['visionCost','Custo extra por aderente',cash]
    ],
    'marketplace-controls':[
      ['marketplaceStart','Começa no mês',{min:1,max:61}],['marketplaceAdoption','Contas compradoras',percent],
      ['marketplaceTicket','Ticket por pedido',cash],['marketplaceOrders','Pedidos por conta / mês',{step:.1,max:100}],['marketplaceTake','Comissão da BIA',percent]
    ],
    'event-controls':[
      ['eventStart','Primeira edição no mês',{min:1,max:61}],['eventFrequency','Edições por ano',{max:12,help:'0, 1, 2, 3, 4, 6 ou 12.'}],
      ['eventTickets','Ingressos por edição',{suffix:'unid.',max:1000000}],['eventTicket','Preço do ingresso',cash],['eventTake','Comissão da BIA',percent]
    ],
    'implementation-controls':[
      ['implementationPrice','Preço da implementação',cash],['implementationRate','Novos clientes que contratam',percent],
      ['implementationShare','Parcela de Ivan',{...percent,help:'Proposta inicial: 75% após checkout.'}],
      ['implementationCost','Apoio contratado por entrega',{...cash,help:'Sai da parcela de Ivan, não da parcela dos Barone.'}]
    ]
  };
  for(const [id,fields]of Object.entries(schemas))fields.forEach(args=>$(id).append(makeField(...args)));
  for(let i=0;i<5;i++)$('acquisition-controls').append(makeField('', 'Ano '+(i+1),{arrayIndex:i,suffix:'clientes',help:'novos / mês'}));
  state.plans.forEach((plan,i)=>{
    const row=el('div','plan-row'),name=el('div','plan-name');
    name.append(el('i'),el('span','',plan.name)); const counter=el('small','count');counter.id='plan-count-'+i;name.lastChild.append(counter);row.append(name);
    row.append(makeField('weight','Mix relativo',{planIndex:i,suffix:'%',max:100000,step:1}),makeField('beta','Beta · R$',{planIndex:i,step:.01,max:100000}),makeField('regular','Depois · R$',{planIndex:i,step:.01,max:100000}));
    $('plan-editor').append(row);
  });
  function syncControls(){
    doc.querySelectorAll('[data-field]').forEach(input=>{
      const value=state[input.dataset.field];
      if(input.type==='checkbox')input.checked=Boolean(value);
      else if(doc.activeElement!==input)input.value=value;
    });
    doc.querySelectorAll('[data-array-index]').forEach(input=>{if(doc.activeElement!==input)input.value=state.acquisitions[Number(input.dataset.arrayIndex)];});
    doc.querySelectorAll('[data-plan-index]').forEach(input=>{if(doc.activeElement!==input)input.value=state.plans[Number(input.dataset.planIndex)][input.dataset.planKey];});
    $('scenario').value=state.scenario;
    doc.querySelectorAll('[data-horizon]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.horizon)===state.horizon)));
    doc.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===state.payoutMode)));
    doc.querySelectorAll('[data-implementation-share]').forEach(button=>button.classList.toggle('primary',Number(button.dataset.implementationShare)===state.implementationShare));
  }
  function metric(parent,label,value,note){const row=el('div','metric-line'),left=el('div');left.append(el('span','',label));if(note)left.append(el('small','',note));row.append(left,el('strong','',value));parent.append(row);}
  function tableRow(parent,values,className){const row=el('tr',className);values.forEach(value=>{const cell=el('td');if(value instanceof Node)cell.append(value);else cell.textContent=value;row.append(cell);});parent.append(row);return row;}
  function renderLaunch(r){
    const launch=r.launch,isSplit=state.payoutMode==='coproducao';
    set('launch-signups',count(r.signups));set('launch-paid',count(r.paid));set('launch-ticket',exact(r.betaArpu));
    state.plans.forEach((p,i)=>set('plan-count-'+i,count(r.counts[i])+' assinaturas · '+pct(p.weight/state.plans.reduce((a,p)=>a+p.weight,0)*100)));
    const rows=[['Primeiras mensalidades',r.launchGross,'income']];
    if(launch.implementationRevenue>0)rows.push(['Serviços de implementação',launch.implementationRevenue,'income']);
    rows.push(['Checkout de todas as receitas',-launch.gateway,''],['Provisão tributária',-launch.taxes,''],['Pró-labore de Ivan',-state.prolabore,''],['Equipe, infraestrutura e administrativo',-(launch.fixed-state.prolabore),''],['IA, uso e ativação',-(launch.variable+launch.onboarding),'']);
    if(launch.marketing>0)rows.push(['Divulgação do lançamento',-launch.marketing,'']);
    if(launch.coproduction>0)rows.push(['Repasse aos coprodutores',-launch.coproduction,'split-row']);
    if(launch.implementationTransfer>0)rows.push(['Repasse da implementação a Ivan',-launch.implementationTransfer,'split-row']);
    const root=$('launch-waterfall');root.replaceChildren();
    rows.forEach(([label,value,type])=>{const row=el('div','waterfall-row '+type);row.append(el('span','',label),el('strong','',exact(value)));const bar=el('span','waterfall-bar'),inner=el('i');inner.style.width=Math.min(100,Math.max(0,Math.abs(value)/Math.max(1,launch.revenue)*100))+'%';bar.append(inner);row.append(bar);root.append(row);});
    set('launch-mode-badge',isSplit?'COPRODUÇÃO':'DIVIDENDOS');set('launch-profit',exact(launch.result));$('launch-profit').classList.toggle('negative',launch.result<0);
    set('launch-ivan',exact(r.launchIvan));set('launch-ivan-note','Pró-labore + '+(isSplit?'split de assinaturas':'dividendos')+(launch.implementationTransfer>0?' + implementação':''));
    const barone=launch.allocations.find(p=>p.id==='barone');
    set('launch-barone-label',isSplit?'Barone: repasse do gateway':'Barone: dividendos');set('launch-barone',exact(isSplit?barone.split:barone.dividends));
    set('launch-barone-note',isSplit?'Antes dos custos que ficam com a operação':'Depois dos custos e da reserva para reinvestir');
    const compare=$('payout-comparison');compare.replaceChildren();
    const div=r.comparison.find(c=>c.mode==='dividendos'),cop=r.comparison.find(c=>c.mode==='coproducao');
    const ivanPayout=c=>{const p=c.launch.allocations.find(p=>p.id==='ivan');return c.mode==='dividendos'?p.dividends:p.split;};
    const values=[
      ['Base da participação','Resultado e caixa disponíveis','Assinaturas após checkout e reembolsos'],
      ['Parcela do resultado disponível distribuída',pct(state.distribute),'Não se aplica ao split'],
      ['Parcela de Ivan, sem pró-labore',exact(ivanPayout(div)),exact(ivanPayout(cop))],
      ['Pró-labore garantido',exact(state.prolabore),exact(state.prolabore)],
      ['Implementação para Ivan',exact(div.launch.implementationTransfer),exact(cop.launch.implementationTransfer)],
      ['Total recebido por Ivan',exact(div.launchIvan),exact(cop.launchIvan),'highlight'],
      ['Após apoio de implementação, antes de tributos pessoais',exact(div.launchIvan-div.launch.implementationCost),exact(cop.launchIvan-cop.launch.implementationCost)],
      ['Resultado da operação após repasses',exact(div.launch.result),exact(cop.launch.result)],
      ['Caixa retido após distribuição',exact(div.launch.cash),exact(cop.launch.cash)]
    ];values.forEach(row=>tableRow(compare,row.slice(0,3),row[3]));
    const perFee=state.implementationPrice*state.gateway/100+state.gatewayFixed;
    const afterCheckout=Math.max(0,state.implementationPrice-perFee),transfer=afterCheckout*state.implementationShare/100;
    const target=$('implementation-results');target.replaceChildren();
    [['Repasse por entrega a Ivan',exact(transfer)],['Depois do apoio contratado',exact(transfer-state.implementationCost)],['Parcela da operação, antes de tributos',exact(afterCheckout-transfer)],['Serviços simulados no lançamento',state.implementationEnabled?count(launch.implementations):'Não incluídos']].forEach(([label,value])=>{const item=el('div');item.append(el('span','',label),el('strong','',value));target.append(item);});
  }
  function renderSummary(r){
    const s=r.selected,years=state.horizon,isSplit=state.payoutMode==='coproducao';
    set('hero-barone',pct(state.partners.find(p=>p.id==='barone').share));
    set('kpi-launch',currency(r.launchGross));set('kpi-launch-clients',count(r.paid)+' assinantes');
    set('kpi-net',currency(r.launchNet));set('kpi-fee',pct(state.gateway)+(state.gatewayFixed?' + '+exact(state.gatewayFixed)+' por cobrança':' de taxa')+', antes dos demais custos');
    set('kpi-mrr',currency(s.mrr));set('kpi-mrr-note','Ano '+years+' · '+count(s.clients)+' contas ativas');
    set('kpi-valuation',compact.format(r.valuations[1].equity));set('kpi-valuation-note','Ano '+years+' · sensibilidade, não valor atual');
    set('mode-description',isSplit?'20% de Ivan sobre receita própria elegível após checkout. Implementação tem regra própria.':'20% de Ivan sobre o resultado distribuível, depois dos custos. Pró-labore à parte.');
    set('bia-insight','No cenário atual, '+count(r.signups)+' adesões geram '+currency(r.launchGross)+' em primeiras mensalidades. Ao final de '+years+' '+(years===1?'ano':'anos')+', são '+count(s.clients)+' contas ativas. '+(isSplit?'O split gera repasse mesmo antes da apuração de lucro.':'A distribuição exige resultado positivo e caixa disponível.'));
    const warnings=$('warnings');warnings.replaceChildren();warnings.hidden=!r.riskWarnings.length;r.riskWarnings.forEach(text=>warnings.append(el('p','',text)));
    doc.querySelector('.nav-pill').textContent=count(r.paid);
    set('forecast-clients',count(s.clients));set('forecast-revenue',currency(s.revenue));set('forecast-cash',currency(s.cash));set('forecast-funding',currency(r.requiredCapital));
    $('forecast-cash').classList.toggle('negative',s.cash<0);
    set('unit-horizon','ANO '+years);set('chart-period',years*12+' meses · '+(isSplit?'coprodução':'dividendos')+' · receita própria sem GMV');
    const unit=$('unit-economics');unit.replaceChildren();const last=r.timeline[years*12-1];
    metric(unit,'Contribuição mensal por conta',exact(last.contributionPerClient),'Após uso, checkout e provisão tributária'+(isSplit?' e split.':'.'));
    metric(unit,'Retenção em 12 meses',pct(r.retention12),'Consequência do churn mensal escolhido.');
    metric(unit,'LTV de contribuição',r.ltv===null?'Não estimado':currency(r.ltv),'Antes de custos fixos e sem desconto de fluxos futuros.');
    metric(unit,'Prazo de retorno do CAC',r.cacPayback===null?'Não estimado':decimal.format(r.cacPayback)+' meses','Aquisição dividida pela contribuição mensal.');
    metric(unit,'Equilíbrio com a estrutura do período',r.breakEven===null?'Não atingível':count(r.breakEven)+' contas');
    metric(unit,'Reserva para o prazo de repasse',currency(r.settlementReserve),'Estimativa inicial de giro para '+count(state.settlementDays)+' dias.');
    const yearTable=$('year-table');yearTable.replaceChildren();
    const periods=[r.years[0],r.years[1],r.years[4]];
    const row=(label,key,format=currency)=>tableRow(yearTable,[label,...periods.map(y=>format(y[key]))]);
    row('Clientes ativos no fim do ano','clients',count);row('MRR de software no fim do ano','mrr');row('ARR de software, MRR × 12','arr');row('Receita própria do ano','revenue');row('Resultado da operação no ano','result');row('Caixa acumulado retido','cash');
    tableRow(yearTable,['Ivan: '+(isSplit?'split':'dividendos')+' do ano',...periods.map(y=>currency(y.allocations.find(p=>p.id==='ivan')[isSplit?'split':'dividends']))]);
    tableRow(yearTable,['Pró-labore de Ivan no ano',...periods.map(()=>currency(state.prolabore*12))]);
    tableRow(yearTable,['Ivan: implementação no ano',...periods.map(y=>currency(y.implementationTransfer))]);
    row('Suporte no fim do ano','support',value=>count(value)+' pessoas');row('Equipe dev no fim do ano','developers',value=>count(value)+' pessoas');
    const dividendScenario=r.comparison.find(c=>c.mode==='dividendos'),splitScenario=r.comparison.find(c=>c.mode==='coproducao');
    for(const [label,scenario,key] of [['Ivan total: cenário dividendos',dividendScenario,'dividends'],['Ivan total: cenário coprodução',splitScenario,'split']]){
      tableRow(yearTable,[label,...[0,1,4].map(index=>{const year=scenario.years[index],ivan=year.allocations.find(p=>p.id==='ivan');return currency(ivan[key]+state.prolabore*12+year.implementationTransfer);})]);
    }
    tableRow(yearTable,['Operação: resultado no cenário dividendos',...[0,1,4].map(index=>currency(dividendScenario.years[index].result))]);
    tableRow(yearTable,['Operação: resultado no cenário coprodução',...[0,1,4].map(index=>currency(splitScenario.years[index].result))]);
  }
  function renderChart(r){
    const root=$('forecast-chart');root.replaceChildren();
    const w=Math.max(320,root.clientWidth||960),h=w<520?210:265;
    const left=w<520?55:70,right=16,top=18,bottom=31,rows=r.timeline.slice(0,state.horizon*12);
    let low=Math.min(0,...rows.map(v=>v.result)),high=Math.max(1,...rows.map(v=>Math.max(v.revenue,v.result)));
    const step=Math.pow(10,Math.floor(Math.log10(high||1)))/2;high=Math.ceil(high/step)*step;low=Math.floor(low/step)*step;
    const x=i=>left+i/(rows.length-1)*(w-left-right),y=value=>top+(high-value)/(high-low||1)*(h-top-bottom);
    const ns='http://www.w3.org/2000/svg';
    const svg=(tag,attrs,text)=>{const node=doc.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs||{}))node.setAttribute(key,String(value));if(text!==undefined)node.textContent=text;return node;};
    const chart=svg('svg',{viewBox:'0 0 '+w+' '+h,role:'img','aria-label':'Receita mensal e resultado em '+state.horizon+' anos'});
    chart.append(svg('title',{},'Cenário financeiro, valores nominais em reais. A tabela e o CSV oferecem os dados.'));
    const defs=svg('defs'),gradient=svg('linearGradient',{id:'bp-area-gradient',x1:'0',y1:'0',x2:'0',y2:'1'});gradient.append(svg('stop',{offset:'0%','stop-color':colors[0],'stop-opacity':'.16'}),svg('stop',{offset:'100%','stop-color':colors[0],'stop-opacity':'0'}));defs.append(gradient);chart.append(defs);
    for(let i=0;i<=4;i++){const value=low+(high-low)*i/4,yy=y(value);chart.append(svg('line',{x1:left,y1:yy,x2:w-right,y2:yy,stroke:'#26364b','stroke-width':1,'stroke-dasharray':'3 6'}),svg('text',{x:left-10,y:yy+3,'text-anchor':'end',fill:'#7188a7','font-family':'Manrope, sans-serif','font-size':w<520?8:10},compact.format(value)));}
    const path=key=>rows.map((row,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(row[key]).toFixed(1)).join(' ');
    chart.append(svg('path',{d:path('revenue')+' L'+x(rows.length-1)+','+y(0)+' L'+x(0)+','+y(0)+' Z',fill:'url(#bp-area-gradient)',stroke:'none'}));
    chart.append(svg('path',{d:path('revenue'),fill:'none',stroke:colors[0],'stroke-width':2.3,'stroke-linejoin':'round'}),svg('path',{d:path('result'),fill:'none',stroke:colors[1],'stroke-width':2,'stroke-linejoin':'round'}));
    const ticks=w<520?4:6;
    for(let i=0;i<=ticks;i++){const index=Math.round(i/ticks*(rows.length-1));chart.append(svg('text',{x:x(index),y:h-8,'text-anchor':'middle',fill:'#7188a7','font-family':'Manrope, sans-serif','font-size':9},'M'+rows[index].month));}
    rows.forEach((row,i)=>{const dot=svg('circle',{cx:x(i),cy:y(row.revenue),r:6,fill:'transparent',stroke:'none',tabindex:'0','aria-label':'Mês '+row.month+': receita '+exact(row.revenue)+', resultado '+exact(row.result)});dot.append(svg('title',{},'Mês '+row.month+' | Receita: '+exact(row.revenue)+' | Resultado: '+exact(row.result)));chart.append(dot);});
    root.append(chart);
  }
  function renderPartners(r){
    const table=$('partners-table'),sameRows=table.children.length===state.partners.length && [...table.children].every((row,i)=>row.dataset.partnerId===state.partners[i].id);
    if(!sameRows){
      table.replaceChildren();
      state.partners.forEach((partner,index)=>{
        const row=el('tr');row.dataset.partnerId=partner.id;
        const nameCell=el('td'),nameWrap=el('div','partner-name'),dot=el('i','partner-dot');dot.style.background=colors[index%colors.length];
        const nameContainer=el('div'),name=doc.createElement('input');name.value=partner.name;name.dataset.partnerName=partner.id;name.maxLength=60;name.setAttribute('aria-label','Nome do participante '+(index+1));name.readOnly=partner.id==='ivan';
        nameContainer.append(name,el('small','',partner.role+(partner.locked?' · protegido':'')));nameWrap.append(dot,nameContainer);nameCell.append(nameWrap);
        const shareCell=el('td'),shareWrap=el('div','share-input'),share=doc.createElement('input');share.type='number';share.min=0;share.max=80;share.step='any';share.dataset.partnerShare=partner.id;share.disabled=partner.locked||state.partners.length===2;share.setAttribute('aria-label','Participação de '+partner.name);shareWrap.append(share,el('span','','%'));shareCell.append(shareWrap);
        const value=el('td');value.dataset.equityValue=partner.id;
        const action=el('td');if(partner.id!=='ivan'&&partner.id!=='barone'){const remove=el('button','icon-button delete-partner');remove.dataset.removePartner=partner.id;remove.setAttribute('aria-label','Remover '+partner.name);remove.textContent='×';action.append(remove);}
        row.append(nameCell,shareCell,value,action);table.append(row);
      });
    }
    state.partners.forEach((partner,index)=>{
      const row=table.children[index],input=row.querySelector('[data-partner-share]'),name=row.querySelector('[data-partner-name]');
      if(doc.activeElement!==input)input.value=Number(partner.share.toFixed(4));
      if(doc.activeElement!==name)name.value=partner.name;
      row.querySelector('[data-equity-value]').textContent=currency(r.valuations[1].equity*partner.share/100);
    });
    let start=0;
    $('equity-donut').style.background='conic-gradient('+state.partners.map((p,i)=>{const end=start+p.share;const part=colors[i%colors.length]+' '+start+'% '+end+'%';start=end;return part;}).join(',')+')';
    $('equity-donut').setAttribute('aria-label',state.partners.map(p=>p.name+': '+pct(p.share)).join('; '));
    set('equity-total','TOTAL '+pct(state.partners.reduce((sum,p)=>sum+p.share,0)));
    set('equity-context','Valor indicativo por participante: cenário base do ano '+state.horizon+'. Cotas arredondadas na exibição; o cálculo preserva 100%.');
    const isSplit=state.payoutMode==='coproducao',receipts=$('partner-receipts');receipts.replaceChildren();
    set('partner-receipt-period','ANO '+state.horizon);set('partner-payout-heading',isSplit?'Repasse do gateway no ano':'Dividendos do ano');
    set('partner-receipt-subtitle',isSplit?'Repasses da receita própria elegível. O repasse do produtor ainda custeia a operação.':'Distribuição do resultado disponível, mantendo a reserva escolhida.');
    r.selected.allocations.forEach(p=>{
      const payout=isSplit?p.split:p.dividends,prolabore=p.id==='ivan'?state.prolabore*12:0;
      let note=p.id==='barone'&&isSplit?'Antes dos custos da operação':currency(payout+prolabore+p.implementation)+' recebidos';
      if(p.id==='ivan'&&p.implementation>0)note+='; descontar '+currency(r.selected.implementationCost)+' de apoio contratado';
      tableRow(receipts,[p.name,pct(p.share),currency(payout),currency(prolabore),note]);
    });
    set('partner-receipt-note',isSplit?'Ivan e demais coprodutores recebem a parcela elegível; o saldo de Barone deve pagar a estrutura. Não adicionamos dividendos por cima do split. Implementação tem repasse próprio e tributos pessoais não são apurados.':'Ivan recebe pró-labore mais sua parte dos dividendos e eventual implementação. A implementação remunera a execução; o custo de apoio contratado por Ivan sai dessa parcela.');
    $('add-partner').disabled=state.partners.length>=20;
  }
  function renderMarket(r){
    set('market-sam',count(r.sam));set('market-share',pct(r.marketShare));set('market-horizon','Do recorte ao final de '+state.horizon+' '+(state.horizon===1?'ano':'anos'));set('market-clients-note',count(r.selected.clients)+' contas ativas após aquisição e cancelamentos.');
    const funnel=$('market-funnel');funnel.replaceChildren();
    [['Referência ampla',count(state.universe)],['Perfil compatível',count(state.universe*state.marketFit/100)],['Mercado atendível',count(r.sam)],['Contas no cenário',count(r.selected.clients)]].forEach(([label,value],i)=>{if(i)funnel.append(el('b','','›'));const block=el('div');block.append(el('span','',label),el('strong','',value));funnel.append(block);});
  }
  function renderValuation(r){
    set('valuation-horizon','SENSIBILIDADE · ANO '+state.horizon);
    const cards=$('valuation-cards');cards.replaceChildren();
    r.valuations.forEach((value,i)=>{const card=el('article','valuation-card'+(i===1?' featured':'')),top=el('div','valuation-top');top.append(el('span','',['Faixa baixa','Cenário base','Faixa alta'][i]),el('strong','',decimal.format(value.multiple)+'× ARR'));card.append(top,el('strong','',compact.format(value.equity)),el('p','',pct(state.riskDiscount)+' de ajuste de risco. Caixa e dívida considerados à parte.'));const share=el('div','ivan-value');share.append(el('span','','Ivan · 20% de equity'),el('b','',currency(value.equity*.2)));card.append(share);cards.append(card);});
    const roundSummary=$('round-summary'),roundTable=$('round-table');roundSummary.replaceChildren();roundTable.replaceChildren();
    if(!r.round.valid){roundSummary.append(el('div','round-empty',r.round.reason));roundTable.append(el('div','round-empty','As cotas atuais não mudam. Preencha uma rodada compatível para visualizar a simulação.'));}
    else{
      metric(roundSummary,'Pré-money simulado',currency(r.round.preMoney));metric(roundSummary,'Aporte',currency(r.round.investment));metric(roundSummary,'Pós-money',currency(r.round.postMoney));metric(roundSummary,'Fatia do novo investidor',pct(r.round.investor));
      r.round.partners.forEach(p=>{const row=el('div','round-row'+(p.id==='ivan'?' ivan':''));row.append(el('span','',p.name),el('strong','',pct(p.share)));roundTable.append(row);});
    }
  }
  function renderRevenue(r){
    set('revenue-year','ANO '+state.horizon);const y=r.selected,root=$('revenue-mix');root.replaceChildren();
    const rows=r.timeline.slice((state.horizon-1)*12,state.horizon*12),software=rows.reduce((v,row)=>v+row.mrr-row.refunds,0);
    [['Assinaturas e add-on',software],['Comissão marketplace',y.marketplaceRevenue],['Comissão ingressos BSV',y.eventRevenue],['Implementação, antes do repasse',y.implementationRevenue]].forEach(([label,value])=>{const item=el('div','revenue-item'),line=el('div');line.append(el('span','',label),el('strong','',currency(value)));const track=el('span'),fill=el('i');fill.style.width=(y.revenue>0?Math.max(0,value/y.revenue*100):0)+'%';track.append(fill);item.append(line,track);root.append(item);});
    const gmv=$('gmv-summary');gmv.replaceChildren();[['GMV de produtos, fora do ARR: ',y.marketplaceGmv],['Bilheteria do organizador, fora do ARR: ',y.eventGmv]].forEach(([label,value])=>{const p=el('p','',label);p.append(el('b','',currency(value)));gmv.append(p);});
  }
  function render(){
    try{current=BP.calculate(state);}catch(error){toast(error.message||'Revise as premissas informadas.');return;}
    state=current.state;syncControls();renderSummary(current);renderLaunch(current);renderPartners(current);renderMarket(current);renderValuation(current);renderRevenue(current);renderChart(current);persist();
  }
  doc.addEventListener('input',event=>{
    const input=event.target;
    if(input.type==='number' && (input.value==='' || !Number.isFinite(input.valueAsNumber) || input.valueAsNumber<Number(input.min||0) || (input.max!==''&&input.valueAsNumber>Number(input.max)))){input.setAttribute('aria-invalid','true');return;}
    if(input.type==='number')input.removeAttribute('aria-invalid');
    if(input.dataset.partnerShare){if(!Number.isFinite(input.valueAsNumber))return;state.partners=BP.resizePartner(state.partners,input.dataset.partnerShare,input.valueAsNumber);render();return;}
    if(input.dataset.partnerName){const partner=state.partners.find(p=>p.id===input.dataset.partnerName);if(partner&&!partner.locked){partner.name=input.value.slice(0,60);persist();}return;}
    if(input.dataset.field){if(input.type==='checkbox')state[input.dataset.field]=input.checked;else{const numeric=input.tagName==='SELECT'?Number(input.value):input.valueAsNumber;if(!Number.isFinite(numeric))return;state[input.dataset.field]=numeric;}state.scenario='personalizado';render();}
    else if(input.dataset.arrayIndex!==undefined){if(!Number.isFinite(input.valueAsNumber))return;state.acquisitions[Number(input.dataset.arrayIndex)]=input.valueAsNumber;state.scenario='personalizado';render();}
    else if(input.dataset.planIndex!==undefined){if(!Number.isFinite(input.valueAsNumber))return;state.plans[Number(input.dataset.planIndex)][input.dataset.planKey]=input.valueAsNumber;state.scenario='personalizado';render();}
  });
  doc.addEventListener('change',event=>{if(event.target.dataset.partnerName)render();});
  doc.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.horizon){state.horizon=Number(button.dataset.horizon);render();}
    else if(button.dataset.mode){state.payoutMode=button.dataset.mode;render();}
    else if(button.dataset.implementationShare){state.implementationShare=Number(button.dataset.implementationShare);render();}
    else if(button.dataset.removePartner){state.partners=BP.removePartner(state.partners,button.dataset.removePartner);render();}
    else if(button.dataset.close){$(button.dataset.close).close();}
    else if(button.dataset.export){exportFile(button.dataset.export);$('export-dialog').close();}
  });
  $('scenario').addEventListener('change',event=>{
    const name=event.target.value;state.scenario=name;
    if(name==='base'){state.acquisitions=[40,70,100,140,180];state.churn=2.5;}
    else if(name==='conservador'){state.acquisitions=[20,35,50,70,90];state.churn=4;}
    else if(name==='expansao'){state.acquisitions=[60,105,150,210,270];state.churn=1.5;}
    render();toast('Aquisição e churn atualizados. As demais premissas foram preservadas.');
  });
  $('add-partner').addEventListener('click',()=>{
    const existing=state.partners.length-2,name=existing<3?'Sócio '+['X','Y','Z'][existing]:'Sócio '+(existing+1);
    state.partners=BP.addPartner(state.partners,name,5);render();toast('Novo sócio com 5%. Os demais foram ajustados; Ivan segue com 20%.');
  });
  $('public-fee-button').addEventListener('click',()=>{state.gateway=4.99;state.gatewayFixed=1;render();toast('Cenário de tabela pública carregado. A condição de 3,89% continua editável.');});
  $('future-value-button').addEventListener('click',()=>{state.preMoney=BP.money(current.valuations[1].equity);render();toast('Valuation futuro inserido como hipótese da rodada. Não é preço atual validado.');});
  $('reset-button').addEventListener('click',()=>$('reset-dialog').showModal());
  $('confirm-reset').addEventListener('click',()=>{state=BP.defaults();history.replaceState(null,'',location.pathname+location.search);render();$('reset-dialog').close();toast('Cenário inicial restaurado.');});
  function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const link=el('a');link.href=url;link.download=name;doc.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function exportFile(type){
    if(type==='pdf'){window.print();return;}
    if(type==='json'){download('bia-bp-premissas.json',JSON.stringify(state,null,2),'application/json;charset=utf-8');return;}
    const headers=['Mes','Periodo','Modelo','Clientes ativos','Novos clientes','MRR software','Receita propria','GMV marketplace','Receita marketplace','Bilheteria BSV','Receita ingressos','Receita implementacao','Repasse implementacao Ivan','Custo apoio Ivan','Checkout','Provisao tributos','Custos fixos','Custos variaveis','Onboarding','Marketing','Split coprodutores','Resultado operacao','Dividendos','Caixa retido','Prolabore Ivan'];
    const numeric=value=>Number(value).toFixed(2).replace('.',',');
    const csv=[headers.join(';'),...current.timeline.map(row=>{
      const date=new Intl.DateTimeFormat('pt-BR',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(2026,9+row.month,1)));
      return [row.month,date,state.payoutMode,...[row.clients,row.newClients,row.mrr,row.revenue,row.marketplaceGmv,row.marketplaceRevenue,row.eventGmv,row.eventRevenue,row.implementationRevenue,row.implementationTransfer,row.implementationCost,row.gateway,row.taxes,row.fixed,row.variable,row.onboarding,row.marketing,row.coproduction,row.result,row.dividends,row.cash,state.prolabore].map(numeric)].join(';');
    })].join('\r\n');download('bia-bp-fluxo-60-meses.csv','\uFEFF'+csv,'text/csv;charset=utf-8');
  }
  $('export-button').addEventListener('click',()=>$('export-dialog').showModal());
  $('json-button').addEventListener('click',()=>exportFile('json'));$('csv-button').addEventListener('click',()=>exportFile('csv'));$('print-button').addEventListener('click',()=>exportFile('pdf'));
  $('import-button').addEventListener('click',()=>$('import-file').click());
  $('import-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{if(file.size>100000)throw new Error();const data=JSON.parse(await file.text());if(!data||!Array.isArray(data.plans)||!Array.isArray(data.partners))throw new Error();state=BP.normalize(data);render();toast('Cenário importado. A proteção de Ivan em 20% foi preservada.');}
    catch(_){toast('Não foi possível importar. Use um JSON de premissas exportado pelo dashboard.');}
    event.target.value='';
  });
  $('share-button').addEventListener('click',async()=>{
    const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(state)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const url=location.origin+location.pathname+'#scenario='+encoded;
    try{await navigator.clipboard.writeText(url);toast('Link do cenário copiado. Quem abrir verá estas premissas.');}
    catch(_){const area=doc.createElement('textarea');area.value=url;area.style.position='fixed';area.style.left='-9999px';doc.body.append(area);area.select();const copied=doc.execCommand('copy');area.remove();toast(copied?'Link do cenário copiado.':'Não foi possível copiar. Exporte o JSON para compartilhar o cenário.');}
  });
  const closeMenu=()=>{$('sidebar').classList.remove('open');$('mobile-backdrop').hidden=true;$('menu-button').setAttribute('aria-expanded','false');};
  $('menu-button').addEventListener('click',()=>{const open=!$('sidebar').classList.contains('open');$('sidebar').classList.toggle('open',open);$('mobile-backdrop').hidden=!open;$('menu-button').setAttribute('aria-expanded',String(open));});
  $('mobile-backdrop').addEventListener('click',closeMenu);
  doc.querySelectorAll('.sidebar nav a').forEach(link=>link.addEventListener('click',closeMenu));
  doc.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){doc.querySelectorAll('.sidebar nav a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));}});},{rootMargin:'-15% 0px -65% 0px',threshold:0});
    doc.querySelectorAll('main>section').forEach(section=>observer.observe(section));
  }
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>renderChart(current),140);});
  render();
})();
