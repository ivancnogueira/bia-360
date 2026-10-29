import { ArrowUpRight } from 'lucide-react';
import { asset } from '../data/product';
export function FinalCTA() {
  return <section className="final-section" aria-labelledby="final-title"><div className="final-inner"><div className="final-copy"><p className="section-kicker"><span>07</span> / SEU PRÓXIMO PASSO</p><h2 id="final-title">Seu negócio tem<br /><em>um próximo nível.</em></h2><p>Descubra como a BIA pode fazer parte da sua barbearia, da sua escola ou das duas.</p><a className="button" href="#planos">Conhecer os planos <ArrowUpRight size={18} aria-hidden="true" /></a><small>Escolha a opção que faz sentido para o seu negócio.</small></div><img src={asset('/images/bia.png')} alt="" aria-hidden="true" /></div></section>;
}
