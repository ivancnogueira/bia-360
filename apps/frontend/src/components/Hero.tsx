import { ArrowUpRight, AudioLines, Command, MessageCircle, CalendarDays, Users } from 'lucide-react';
import { asset } from '../data/product';
export function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-grid" aria-hidden="true" />
    <div className="hero-word" aria-hidden="true">NEXT LEVEL</div>
    <div className="hero-copy">
      <p className="eyebrow"><span className="live" /> IA PARA BARBEARIAS E ESCOLAS DE BARBEIROS</p>
      <h1 id="hero-title">Pare de ser a recepção <em>do seu próprio negócio.</em></h1>
      <p className="hero-promise">Você cuida dos cortes e das aulas. A BIA conecta atendimento, agenda e vendas.</p>
      <p className="hero-description">Uma plataforma com inteligência artificial para atender clientes no WhatsApp, organizar horários e acompanhar interessados nos seus cursos.</p>
      <div className="hero-differential">
        <h2>Faça a gestão completa do seu negócio <span>pelo WhatsApp.</span></h2>
        <p>Até entre um atendimento e outro.</p>
      </div>
      <div className="hero-benefits"><span><MessageCircle size={13} /> IA no WhatsApp</span><span><CalendarDays size={13} /> Agenda integrada</span><span><Users size={13} /> CRM de clientes e alunos</span></div>
      <div className="hero-actions"><a className="button" href="#planos">Conhecer os planos <ArrowUpRight size={18} /></a><a className="hero-secondary" href="#como-funciona">Ver como funciona ↓</a></div>
    </div>
    <div className="hero-visual">
      <img className="hero-person" src={asset('/images/bia.png')} alt="BIA, assistente virtual da BIA 360" fetchPriority="high" />
      <div className="hero-side glass"><Command aria-hidden="true" /><span>BARBEARIA<br />ESCOLA + HÍBRIDO</span><p>Do agendamento<br />à próxima matrícula.</p></div>
      <div className="floating glass" id="previa"><AudioLines size={25} aria-hidden="true" /><div><small>GESTÃO POR CONVERSA NO WHATSAPP</small><strong>“BIA, quais são meus horários de amanhã?”</strong></div></div>
    </div>
    <div className="hero-bottom"><span>01 / CONHEÇA SUA NOVA ASSISTENTE</span><span>BARBEARIA + ESCOLA / BIA 360</span></div>
  </section>;
}
