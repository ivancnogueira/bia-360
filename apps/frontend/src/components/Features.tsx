import { BadgePercent, BarChart3, Bot, CalendarDays, CalendarRange, CircleDollarSign, ClipboardList, GraduationCap, LayoutDashboard, Megaphone, MessageCircle, Package, ReceiptText, Repeat2, Scissors, Ticket, UsersRound } from 'lucide-react';

const featureGroups = [
  {
    number: '01', label: 'GESTÃO DA BARBEARIA',
    title: 'O dia a dia da operação, organizado.',
    description: 'Da agenda aos produtos, mais clareza para cuidar de cada parte do negócio.',
    features: [
      { icon: CalendarDays, title: 'Agenda e serviços', description: 'Organize serviços, horários, duração e disponibilidade de cada profissional.' },
      { icon: Scissors, title: 'Cadastro de profissionais', description: 'Reúna os dados da equipe e organize profissionais, serviços e rotinas de atendimento.' },
      { icon: Repeat2, title: 'Rodízio e fila', description: 'Organize a ordem dos profissionais e acompanhe a distribuição dos atendimentos.' },
      { icon: Package, title: 'Produtos e estoque', description: 'Cadastre produtos e acompanhe a movimentação do estoque da sua operação.' },
      { icon: ReceiptText, title: 'Comandas e caixa', description: 'Reúna serviços e produtos na comanda e acompanhe entradas e saídas do caixa.' },
      { icon: CircleDollarSign, title: 'Financeiro e contas', description: 'Organize os valores a pagar e a receber para acompanhar o movimento do negócio.' },
      { icon: BadgePercent, title: 'Comissões e resultados', description: 'Organize as comissões da equipe e acompanhe os resultados do negócio.' },
      { icon: BarChart3, title: 'Relatórios e indicadores', description: 'Reúna informações da operação para ter uma visão mais clara dos resultados.' },
      { icon: Ticket, title: 'Pacotes e recorrência', description: 'Tenha uma visão das ofertas e pacotes pensados para aproximar seus clientes.' },
    ],
  },
  {
    number: '02', label: 'ATENDIMENTO E RELACIONAMENTO',
    title: 'Conversas que se tornam oportunidades.',
    description: 'Atendimento, acompanhamento e gestão conectados ao canal que seus clientes já usam.',
    features: [
      { icon: Bot, title: 'Atendimento com inteligência artificial', description: 'Acolha contatos no WhatsApp com apoio da BIA e encaminhe a conversa para sua equipe.' },
      { icon: MessageCircle, title: 'Gestão pelo WhatsApp', description: 'Converse com a BIA para consultar informações e cuidar da rotina de onde você estiver.' },
      { icon: UsersRound, title: 'CRM e histórico de clientes', description: 'Cadastre clientes e acompanhe conversas, contatos e oportunidades com mais contexto.' },
      { icon: Megaphone, title: 'Relacionamento e acompanhamento', description: 'Organize lembretes e ações de relacionamento para manter as oportunidades em movimento.' },
    ],
  },
  {
    number: '03', label: 'ESCOLA E ADMINISTRAÇÃO',
    title: 'Ensine, venda e acompanhe em um só lugar.',
    description: 'Uma visão integrada para quem também transforma conhecimento em cursos e turmas.',
    features: [
      { icon: GraduationCap, title: 'Cursos e ofertas', description: 'Apresente seus cursos, datas e ofertas para organizar a jornada comercial.' },
      { icon: CalendarRange, title: 'Turmas e vagas', description: 'Organize as próximas turmas e acompanhe as vagas disponíveis.' },
      { icon: ClipboardList, title: 'Interessados e matrículas', description: 'Acompanhe quem quer aprender e o andamento das oportunidades de matrícula.' },
      { icon: LayoutDashboard, title: 'Painel e acessos', description: 'Acompanhe informações pelo navegador e organize o acesso da equipe conforme seus papéis.' },
    ],
  },
] as const;

const featureCount = featureGroups.reduce((total, group) => total + group.features.length, 0);

export function Features() {
  let featureNumber = 0;
  return <section id="recursos" className="sales-section features-section" aria-labelledby="features-title"><div className="section-inner">
    <div className="section-intro"><div><p className="section-kicker"><span>02</span> / RECURSOS DA BIA 360</p><h2 id="features-title">Seu negócio inteiro.<br /><em>Em uma só direção.</em></h2></div><p>Conheça os recursos pensados para conectar operação, atendimento, gestão e educação.</p></div>
    <p className="section-note">Os recursos variam por plano. Algumas funcionalidades estão em desenvolvimento e sua disponibilidade será informada antes da contratação.</p>
    <div className="feature-groups">{featureGroups.map(group => <div className="feature-group" key={group.number}>
      <div className="feature-group-heading"><div><p><span>{group.number}</span> / {group.label}</p><h3>{group.title}</h3></div><p>{group.description}</p></div>
      <div className="feature-grid">{group.features.map(({icon: Icon, title, description}) => {
        featureNumber += 1;
        return <article className="feature-card" key={title}><div className="feature-top"><Icon size={24} strokeWidth={1.6} aria-hidden="true" /><span>{String(featureNumber).padStart(2, '0')} / {featureCount}</span></div><h4>{title}</h4><p>{description}</p></article>;
      })}</div>
    </div>)}</div>
  </div></section>;
}
