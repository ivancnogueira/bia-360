export const siteConfig = {
  name: 'BIA 360',
  shortName: 'BIA',
  title: 'BIA 360 | Inteligencia Artificial para Barbearias e Escolas de Barbeiros',
  description: 'Plataforma com inteligencia artificial para barbearias e escolas de barbeiros. Atendimento no WhatsApp, agendamento de servicos, CRM de clientes e gestao completa da sua operacao.',
  url: 'https://ivancnogueira.github.io/bia-360/vendas/',
  domain: 'ivancnogueira.github.io',
  basePath: '/bia-360/vendas',
  locale: 'pt_BR',
  language: 'pt-BR',
  themeColor: '#08070d',
  backgroundColor: '#08070d',
  creator: 'Barone Academy',
  publisher: 'Barone Academy',
  supportWhatsApp: 'https://wa.me/554163491573',
  supportPhone: '+55 41 6349-1573',
  geo: {
    region: 'BR-PR',
    placename: 'Curitiba',
    latitude: -25.4284,
    longitude: -49.2733,
  },
};

export const seoKeywords = {
  primary: [
    'sistema para barbearia',
    'software para barbearia',
    'inteligencia artificial para barbearias',
    'ia para barbearia',
    'atendimento whatsapp barbearia',
    'agendamento barbearia whatsapp',
    'gestao de barbearia',
    'sistema para escola de barbeiros',
    'assistente virtual para barbeiros',
    'bia 360',
  ],
  secondary: [
    'crm para barbearia',
    'aplicativo para barbearia',
    'comanda eletronica barbearia',
    'controle de comissao de barbeiros',
    'rodizio de barbeiros',
    'sistema de agendamento online barbearia',
    'venda de cursos de barbeiro',
    'gestao de turmas escola de barbeiros',
    'software barbearia brasil',
    'plataforma barbearia 360',
    'barone academy bia 360',
    'robo para barbearia whatsapp',
    'automacao de mensagens barbearia',
    'marketing para barbearia',
    'fidelizacao de clientes barbearia',
  ],
  longTail: [
    'como automatizar atendimento de barbearia no whatsapp',
    'melhor sistema para barbearia com inteligencia artificial',
    'como organizar agenda de barbeiros pelo whatsapp',
    'plataforma completa para escola e barbearia hibrida',
    'atendimento automatico 24 horas para barbearias',
    'como vender mais cursos de barbeiro no whatsapp',
    'sistema integrado de barbearia e escola profissionalizante',
    'software para barbearias com gestao financeira e comanda',
    'inteligencia artificial que agenda clientes para barbearia',
    'assistente de ia que responde clientes de barbearia',
    'como gerenciar barbearia pelo celular sem aplicativo',
    'ferramenta de gestao para barbeiros e educadores',
    'sistema com inteligencia artificial e visagismo para barbeiros',
    'automacao de lembrete de horario para clientes de barbearia',
    'programa para barbearia facil de usar no whatsapp',
  ],
  geo: [
    'sistema para barbearia em Sao Paulo',
    'sistema para barbearia em Curitiba',
    'software para barbearias no Parana',
    'sistema para barbearias no Rio de Janeiro',
    'gestao de barbearias em Belo Horizonte',
    'software para barbearia no Brasil',
    'sistema para barbeiros em todo o Brasil',
  ],
  aeo: [
    'O que e a BIA 360 e como ela funciona',
    'Qual e o melhor software com inteligencia artificial para barbearias',
    'Como a BIA 360 agenda cortes de cabelo pelo WhatsApp',
    'Quais sao os planos e precos da BIA 360',
    'Como a BIA 360 ajuda escolas de barbeiros a preencher turmas',
    'A BIA 360 precisa de aplicativo instalado no celular',
    'Como funciona a transferencia de atendimento para humanos na BIA 360',
  ],
};

export const allKeywordsString = [
  ...seoKeywords.primary,
  ...seoKeywords.secondary,
  ...seoKeywords.longTail,
  ...seoKeywords.geo,
].join(', ');

export const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Barone Academy',
  alternateName: 'BIA 360',
  url: siteConfig.url,
  logo: `${siteConfig.url}images/logo.png`,
  image: `${siteConfig.url}images/bia.png`,
  description: siteConfig.description,
  address: {
    '@type': 'PostalAddress',
    addressLocality: siteConfig.geo.placename,
    addressRegion: 'PR',
    addressCountry: 'BR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: siteConfig.supportPhone,
    contactType: 'customer support',
    availableLanguage: 'Portuguese',
  },
};

export const jsonLdSoftwareApplication = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BIA 360',
  operatingSystem: 'Web, WhatsApp, iOS, Android',
  applicationCategory: 'BusinessApplication',
  url: siteConfig.url,
  image: `${siteConfig.url}images/bia.png`,
  description: siteConfig.description,
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'BRL',
    lowPrice: '199',
    highPrice: '449',
    offerCount: '3',
    offers: [
      {
        '@type': 'Offer',
        name: 'Plano Barbearia',
        price: '199',
        priceCurrency: 'BRL',
        description: 'Atendimento com IA, agenda integrada, CRM de clientes e gestao pelo WhatsApp.',
        availability: 'https://schema.org/InStock',
        url: `${siteConfig.url}#planos`,
      },
      {
        '@type': 'Offer',
        name: 'Plano Escola',
        price: '299',
        priceCurrency: 'BRL',
        description: 'Catalogo de cursos, turmas, vagas, interessados e gestao conectada ao WhatsApp.',
        availability: 'https://schema.org/InStock',
        url: `${siteConfig.url}#planos`,
      },
      {
        '@type': 'Offer',
        name: 'Plano Hibrido',
        price: '449',
        priceCurrency: 'BRL',
        description: 'Jornada completa de barbearia e escola com atendimento por inteligencia artificial.',
        availability: 'https://schema.org/InStock',
        url: `${siteConfig.url}#planos`,
      },
    ],
  },
  featureList: [
    'Atendimento no WhatsApp com inteligencia artificial',
    'Transferencia automatica para equipe humana',
    'Agenda por servico e profissional',
    'Cadastro e historico de clientes',
    'Gestao por conversa no WhatsApp',
    'Catalogo de cursos e organizacao de turmas',
    'Controle de comandas e financeiro',
  ],
};

export const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'A BIA atende clientes pelo WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A BIA foi pensada para conectar o atendimento pelo WhatsApp a inteligencia artificial e permitir a transferencia da conversa para uma pessoa da equipe. A ativacao do canal depende da configuracao aplicavel.',
      },
    },
    {
      '@type': 'Question',
      name: 'O que posso fazer como gestor pelo WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A proposta e conversar com a BIA para consultar informacoes e apoiar tarefas do negocio, como agenda, clientes e resultados. As acoes disponiveis dependem das permissoes e dos recursos liberados para sua operacao.',
      },
    },
    {
      '@type': 'Question',
      name: 'Preciso instalar um aplicativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A experiencia foi pensada para combinar conversas pelo WhatsApp com um painel acessivel pelo navegador, sem exigir um aplicativo nativo.',
      },
    },
    {
      '@type': 'Question',
      name: 'A BIA hospeda minhas aulas online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O foco da BIA para escolas e organizar ofertas, interessados, turmas e vagas. As aulas online podem continuar na plataforma que o educador ja utiliza.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como funciona a condicao de lancamento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Os valores apresentados sao uma proposta para o lancamento e ainda dependem de confirmacao. A proposta preve a condicao por 12 meses a partir da ativacao. Limites, renovacao e condicoes finais serao informados antes da contratacao.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quando comeca a cobranca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A proposta preve o inicio da mensalidade na ativacao. O processo de entrada e as condicoes de cobranca serao confirmados antes da contratacao.',
      },
    },
    {
      '@type': 'Question',
      name: 'Os recursos em evolucao ja estao incluidos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sao possibilidades para etapas futuras, ainda sem datas ou condicoes de acesso confirmadas. A disponibilidade de cada recurso sera informada quando houver definicao.',
      },
    },
  ],
};

export const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: siteConfig.url,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Como Funciona',
      item: `${siteConfig.url}#como-funciona`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Recursos',
      item: `${siteConfig.url}#recursos`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Para Quem',
      item: `${siteConfig.url}#para-quem`,
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'Planos',
      item: `${siteConfig.url}#planos`,
    },
    {
      '@type': 'ListItem',
      position: 6,
      name: 'Duvidas',
      item: `${siteConfig.url}#duvidas`,
    },
  ],
};

export const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BIA 360',
  url: siteConfig.url,
  inLanguage: 'pt-BR',
  description: siteConfig.description,
  publisher: {
    '@type': 'Organization',
    name: 'Barone Academy',
  },
};
