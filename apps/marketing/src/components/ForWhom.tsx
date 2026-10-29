import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Scissors } from 'lucide-react';
const audiences = [
  { icon: Scissors, label: 'BARBEARIA', number: '01', title: 'Para quem vive a cadeira.', text: 'Organize os horários, acompanhe os clientes e dê espaço para a equipe fazer o que sabe melhor.', points: ['Agenda por profissional', 'Atendimento e histórico', 'Rotina mais organizada'] },
  { icon: GraduationCap, label: 'ESCOLA', number: '02', title: 'Para quem ensina e transforma.', text: 'Acompanhe a jornada de quem demonstra interesse nos cursos e organize as próximas turmas.', points: ['Ofertas e interessados', 'Turmas e vagas', 'Venda de cursos'] },
  { icon: BriefcaseBusiness, label: 'HÍBRIDO', number: '03', title: 'Para quem faz os dois.', text: 'Conecte a operação da barbearia à frente de educação em uma mesma visão do negócio.', points: ['Serviços e educação', 'Clientes e alunos', 'Uma visão integrada'] },
] as const;
export function ForWhom() {
  return <section id="para-quem" className="sales-section audience-section" aria-labelledby="audience-title"><div className="section-inner">
    <div className="section-intro"><div><p className="section-kicker"><span>03</span> / PARA QUEM É A BIA</p><h2 id="audience-title">O seu negócio é único.<br /><em>A BIA acompanha o ritmo.</em></h2></div><p>Escolha a jornada que faz sentido para o seu momento, seja atendendo, ensinando ou fazendo os dois.</p></div>
    <div className="audience-grid">{audiences.map(({icon: Icon, label, number, title, text, points}) => <article className="audience-card" key={label}><div className="audience-top"><Icon size={27} strokeWidth={1.5} aria-hidden="true" /><span>{number} / {label}</span></div><h3>{title}</h3><p>{text}</p><ul>{points.map(point => <li key={point}>{point}</li>)}</ul><a href="#planos">Ver plano {label.toLowerCase()} <ArrowUpRight size={16} aria-hidden="true" /></a></article>)}</div>
  </div></section>;
}
