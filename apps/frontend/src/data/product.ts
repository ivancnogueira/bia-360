export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;

// Preencher com os links definitivos de checkout quando forem disponibilizados.
export const checkoutLinks: Record<'Barbearia' | 'Escola' | 'Híbrido', string | null> = {
  Barbearia: null,
  Escola: null,
  Híbrido: null,
};

export const supportWhatsApp = 'https://wa.me/554163491573';

export const plans = [
  { name: 'Barbearia', description: 'Para transformar conversas em horários organizados.', monthly: 199, features: ['Atendimento com IA e transferência humana', 'Agenda por serviço e profissional', 'Cadastro e histórico de clientes', 'Gestão conectada ao WhatsApp'] },
  { name: 'Escola', description: 'Para levar mais interessados até a próxima turma.', monthly: 299, features: ['Catálogo de cursos e datas', 'Funil de interessados', 'Organização de turmas e vagas', 'Gestão conectada ao WhatsApp'] },
  { name: 'Híbrido', description: 'Para quem une a cadeira à sala de aula.', monthly: 449, features: ['Jornada de barbearia e escola', 'Atendimento com inteligência artificial', 'Agenda, clientes, turmas e interessados', 'Gestão conectada ao WhatsApp'] },
] as const;

export const roadmap = [
  { title: 'Visagismo e colorimetria com IA', description: 'Possibilidades para apoiar a experiência e o conhecimento técnico.' },
  { title: 'Recomendações de tratamentos', description: 'Novas formas de apoiar a escolha de cuidados para cada cliente.' },
  { title: 'Marketplace de produtos', description: 'Uma vitrine para conectar profissionais, negócios e produtos.' },
  { title: 'Eventos e conexões', description: 'Experiências para aproximar negócios, educação e oportunidades no ecossistema.' },
] as const;

export const faqs = [
  { question: 'A BIA atende clientes pelo WhatsApp?', answer: 'A BIA foi pensada para conectar o atendimento pelo WhatsApp à inteligência artificial e permitir a transferência da conversa para uma pessoa da equipe. A ativação do canal depende da configuração aplicável.' },
  { question: 'O que posso fazer como gestor pelo WhatsApp?', answer: 'A proposta é conversar com a BIA para consultar informações e apoiar tarefas do negócio, como agenda, clientes e resultados. As ações disponíveis dependem das permissões e dos recursos liberados para sua operação.' },
  { question: 'Preciso instalar um aplicativo?', answer: 'A experiência foi pensada para combinar conversas pelo WhatsApp com um painel acessível pelo navegador, sem exigir um aplicativo nativo.' },
  { question: 'A BIA hospeda minhas aulas online?', answer: 'O foco da BIA para escolas é organizar ofertas, interessados, turmas e vagas. As aulas online podem continuar na plataforma que o educador já utiliza.' },
  { question: 'Como funciona a condição de lançamento?', answer: 'Os valores apresentados são uma proposta para o lançamento e ainda dependem de confirmação. A proposta prevê a condição por 12 meses a partir da ativação. Limites, renovação e condições finais serão informados antes da contratação.' },
  { question: 'Quando começa a cobrança?', answer: 'A proposta prevê o início da mensalidade na ativação. O processo de entrada e as condições de cobrança serão confirmados antes da contratação.' },
  { question: 'Os recursos em evolução já estão incluídos?', answer: 'São possibilidades para etapas futuras, ainda sem datas ou condições de acesso confirmadas. A disponibilidade de cada recurso será informada quando houver definição.' },
] as const;
