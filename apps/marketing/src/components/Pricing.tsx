import { ArrowUpRight, Check } from 'lucide-react';
import { checkoutLinks, plans } from '../data/product';

export function Pricing() {
  return <section id="planos" className="sales-section pricing-section" aria-labelledby="pricing-title"><div className="section-inner">
    <div className="section-intro"><div><p className="section-kicker"><span>04</span> / PLANOS</p><h2 id="pricing-title">Escolha a BIA<br /><em>para o seu negócio.</em></h2></div><p>Três caminhos para começar, de acordo com a sua operação.</p></div>
    <div className="launch-ribbon"><span>CONDIÇÃO DE LANÇAMENTO</span><p>Valores mensais propostos, sujeitos à confirmação antes da contratação.</p></div>
    <div className="pricing-grid">{plans.map((plan, index) => <article className={`plan-card${index === 2 ? ' is-featured' : ''}`} key={plan.name}>
      <div className="plan-label"><span>{index === 2 ? 'BARBEARIA + ESCOLA' : 'BIA 360 / PLANO'}</span><span>0{index + 1}</span></div>
      <h3>{plan.name}</h3><p className="plan-description">{plan.description}</p><div className="plan-price"><small>R$</small><strong>{plan.monthly}</strong><span>/ mês</span></div><p className="plan-price-note">Valor mensal proposto</p>
      <ul>{plan.features.map(feature => <li key={feature}><Check size={16} aria-hidden="true" /> <span>{feature}</span></li>)}</ul>
      {checkoutLinks[plan.name] ? <a className={`plan-action${index === 2 ? ' plan-action-primary' : ''}`} href={checkoutLinks[plan.name] ?? undefined}>Assinar {plan.name}<ArrowUpRight size={17} aria-hidden="true" /></a> : <button className="plan-action plan-action-pending" type="button" disabled aria-label={`Checkout do plano ${plan.name} em preparação`}>Checkout em preparação <ArrowUpRight size={17} aria-hidden="true" /></button>}
    </article>)}</div>
    <p className="pricing-disclaimer">A proposta de lançamento prevê esses valores por 12 meses a partir da ativação. Disponibilidade, limites, custos adicionais e renovação serão confirmados antes da contratação. A mensalidade está prevista para começar na ativação.</p>
  </div></section>;
}
