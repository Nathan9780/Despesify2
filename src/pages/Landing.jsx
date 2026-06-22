import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Landing() {
  // Carousel for quotes
  const quotes = [
    {
      text: "Grandes projetos fracassam quando a informação se perde. O Despesify 2 transforma dados dispersos em decisões inteligentes.",
      highlight: "decisões inteligentes"
    },
    {
      text: "Planeje melhor. Controle melhor. Construa melhor.",
      highlight: "Construa melhor"
    },
    {
      text: "Tudo o que seu projeto precisa, em uma única plataforma.",
      highlight: "única plataforma"
    },
    {
      text: "Do planejamento ao investimento: gestão completa para transformar ideias em realidade.",
      highlight: "transformar ideias em realidade"
    }
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Features list
  const features = [
    {
      id: "finance",
      title: "Gestão Financeira",
      description: "Controle completo de receitas, despesas, investimentos e acompanhamento de orçamento em tempo real.",
      icon: "account_balance_wallet",
      color: "from-blue-500/20 to-cyan-500/20",
      accent: "text-blue-600",
      details: "Visualize gráficos de fluxo de caixa, classifique despesas por categorias personalizadas e receba alertas automáticos de desvio orçamentário."
    },
    {
      id: "projects",
      title: "Gestão de Projetos",
      description: "Criação, organização e acompanhamento visual de projetos pessoais ou empresariais de ponta a ponta.",
      icon: "folder_shared",
      color: "from-purple-500/20 to-indigo-500/20",
      accent: "text-purple-600",
      details: "Defina marcos (milestones), crie cronogramas dinâmicos e centralize todos os documentos de engenharia, arquitetura ou design em um só lugar."
    },
    {
      id: "tasks",
      title: "Gestão de Tarefas",
      description: "Organização das atividades diárias através de quadros Kanban interativos e fáceis de usar.",
      icon: "splitscreen",
      color: "from-pink-500/20 to-rose-500/20",
      accent: "text-pink-600",
      details: "Arraste e solte cartões, atribua responsáveis, adicione checklists de subtarefas e defina prazos de entrega integrados ao calendário."
    },
    {
      id: "team",
      title: "Gestão de Mão de Obra",
      description: "Cadastro, contratação simplificada e acompanhamento do rendimento e escala de profissionais.",
      icon: "group",
      color: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-600",
      details: "Monitore folhas de pagamento, gerencie contratos de prestação de serviços e avalie a performance da sua equipe de campo ou de escritório."
    },
    {
      id: "materials",
      title: "Controle de Materiais",
      description: "Monitoramento de compras, controle de estoque físico, quantidades e variação de custos.",
      icon: "inventory_2",
      color: "from-teal-500/20 to-emerald-500/20",
      accent: "text-teal-600",
      details: "Registre notas fiscais de compra, acompanhe a entrega de materiais em canteiros de obras e veja o custo médio ponderado de cada item."
    },
    {
      id: "suppliers",
      title: "Busca de Fornecedores",
      description: "Localização rápida de lojas, distribuidores e prestadores de serviço com base na proximidade física.",
      icon: "local_shipping",
      color: "from-red-500/20 to-orange-500/20",
      accent: "text-red-600",
      details: "Filtre fornecedores por raio de distância, consulte avaliações de outros usuários e solicite orçamentos automáticos em lote."
    },
    {
      id: "investors",
      title: "Conexão com Investidores",
      description: "Divulgação de projetos qualificados e busca de aportes de potenciais investidores interessados.",
      icon: "payments",
      color: "from-green-500/20 to-emerald-500/20",
      accent: "text-green-600",
      details: "Apresente metas financeiras claras, envie relatórios estruturados de progresso e receba propostas diretamente pela plataforma."
    },
    {
      id: "centralization",
      title: "Centralização Total",
      description: "Todos os dados do projeto estruturados e organizados em um único local, otimizando a tomada de decisão.",
      icon: "hub",
      color: "from-cyan-500/20 to-blue-500/20",
      accent: "text-cyan-600",
      details: "Esqueça planilhas perdidas no e-mail ou mensagens de WhatsApp desconexas. O Despesify 2 unifica o ecossistema do seu projeto."
    }
  ];

  const [activeFeature, setActiveFeature] = useState(features[0]);

  // Plan accordion states
  const [openUseCase, setOpenUseCase] = useState({
    citizen: false,
    enterprise: false,
    investor: false
  });

  const toggleUseCase = (plan) => {
    setOpenUseCase(prev => ({
      ...prev,
      [plan]: !prev[plan]
    }));
  };

  // Why choose details state
  const [selectedWhyNode, setSelectedWhyNode] = useState("finance");

  const whyNodes = {
    finance: { title: "Gestão Financeira", desc: "Integração direta com o orçamento do projeto. Cada compra de material ou pagamento de mão de obra debita automaticamente da sua verba planejada, alertando caso ultrapasse a estimativa." },
    projects: { title: "Gestão de Projetos", desc: "Monitore prazos vinculando as tarefas do Kanban às etapas do projeto. Se uma tarefa atrasar, o impacto no cronograma geral é calculado e exibido imediatamente." },
    teams: { title: "Gestão de Equipes", desc: "Associe profissionais do projeto a tarefas específicas. Saiba exatamente quem está alocado em qual atividade e o custo por hora de cada participante." },
    materials: { title: "Controle de Materiais", desc: "Compare preços de materiais orçados vs. comprados. O sistema gera alertas caso um fornecedor esteja cobrando acima da média do mercado da sua região." },
    suppliers: { title: "Busca de Fornecedores", desc: "Localize parceiros com base no CEP do projeto. Encontre lojas próximas para reduzir fretes e acelerar o fornecimento." },
    investors: { title: "Oportunidades de Investimento", desc: "Exporte relatórios financeiros e de tarefas auditáveis diretamente para investidores externos, aumentando a confiança e transparência da parceria." }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen relative overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Background Decor Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/15 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-tertiary/10 blur-[130px] pointer-events-none"></div>

      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 bg-white/70 dark:bg-inverse-surface/10 backdrop-blur-md border border-outline-variant/30 rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-title text-title text-sm shadow-md">D</div>
          <div>
            <h1 className="font-title text-lg font-bold leading-none text-primary">Despesify 2</h1>
            <p className="font-label text-[10px] text-on-surface-variant opacity-70">Unified Management</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#problema" className="text-sm font-label text-on-surface-variant hover:text-primary transition-colors">O Problema</a>
          <a href="#solucao" className="text-sm font-label text-on-surface-variant hover:text-primary transition-colors">Como Funciona</a>
          <a href="#planos" className="text-sm font-label text-on-surface-variant hover:text-primary transition-colors">Nossos Planos</a>
          <a href="#diferenciais" className="text-sm font-label text-on-surface-variant hover:text-primary transition-colors">Por Que Nós?</a>
        </nav>
        <div>
          <Link 
            to="/dashboard" 
            className="px-5 py-2.5 bg-primary text-on-primary font-label text-xs font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 group"
          >
            Acessar Plataforma
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[85vh] relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary-container/30 mb-8 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <span className="text-xs font-label text-primary font-medium tracking-wide">Uma Plataforma Totalmente Integrada</span>
        </div>
        
        {/* Carousel Quotes */}
        <div className="h-56 md:h-44 flex items-center justify-center max-w-4xl mx-auto mb-8 relative">
          {quotes.map((quote, idx) => {
            const isActive = idx === currentQuoteIndex;
            const parts = quote.text.split(quote.highlight);
            return (
              <div
                key={idx}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                  isActive 
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                    : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                }`}
              >
                <h2 className="font-title text-3xl md:text-5xl lg:text-6xl text-on-background leading-tight md:leading-tight">
                  {parts[0]}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary underline decoration-secondary/30">
                    {quote.highlight}
                  </span>
                  {parts[1]}
                </h2>
              </div>
            );
          })}
        </div>

        {/* Carousel Dots */}
        <div className="flex gap-2.5 mb-12">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuoteIndex(idx)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                idx === currentQuoteIndex 
                  ? 'bg-primary w-8 shadow-sm' 
                  : 'bg-outline-variant/60 hover:bg-outline-variant'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-label font-bold text-sm rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/95 transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            Iniciar Agora Grátis
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">rocket_launch</span>
          </Link>
          <a
            href="#planos"
            className="w-full sm:w-auto px-8 py-4 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-label font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Conhecer Planos
            <span className="material-symbols-outlined text-lg">local_offer</span>
          </a>
        </div>
      </section>

      {/* O Problema Section */}
      <section id="problema" className="py-24 bg-surface-container-low border-y border-outline-variant/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold mb-3 font-label">O Desafio</h2>
            <h3 className="font-title text-3xl md:text-4xl text-on-surface font-extrabold mb-4">O Caos de Múltiplas Ferramentas</h3>
            <p className="font-body text-on-surface-variant text-base">
              Atualmente, pessoas e empresas enfrentam dificuldades sérias para gerenciar projetos devido à fragmentação de atividades em sistemas isolados.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            {/* Left Column: Fragmented vs Unified visual representation */}
            <div className="lg:col-span-6 space-y-6">
              <h4 className="font-title text-xl font-bold text-on-surface">Ferramentas Fragmentadas</h4>
              
              <div className="relative p-6 bg-white dark:bg-inverse-surface/5 border border-error/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <span className="absolute -top-3 right-4 bg-error text-on-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Antigo Modo</span>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">table_view</span>
                    <span className="text-sm font-label text-on-surface-variant">Controle Financeiro em **planilhas manuais** vulneráveis a erros</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">pending_actions</span>
                    <span className="text-sm font-label text-on-surface-variant">Tarefas organizadas em **aplicativos separados** sem conexão financeira</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">chat</span>
                    <span className="text-sm font-label text-on-surface-variant">Contratação de profissionais por **mensagens de rede social** dispersas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">map</span>
                    <span className="text-sm font-label text-on-surface-variant">Busca por fornecedores exigindo **pesquisas manuais** no Google ou mapas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">monetization_on</span>
                    <span className="text-sm font-label text-on-surface-variant">Procura por investidores ocorrendo em **indicações ou redes informais**</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 text-error bg-error/10 p-4 rounded-xl border border-error/20">
                <span className="material-symbols-outlined">warning</span>
                <p className="font-label text-xs font-semibold">Como consequência, muitos projetos ultrapassam o orçamento, atrasam cronogramas e falham na gestão.</p>
              </div>
            </div>

            {/* Right Column: Consequences Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { title: "Perda de Tempo", desc: "Alternar entre 5+ aplicativos consome horas produtivas diariamente.", icon: "schedule_send" },
                { title: "Falta de Organização", desc: "Sem centralização, os prazos e prioridades tornam-se confusos.", icon: "grid_view" },
                { title: "Descontrole Financeiro", desc: "Atrasos em registros geram furos de caixa inesperados.", icon: "trending_down" },
                { title: "Informações Espalhadas", desc: "Documentos e conversas ficam perdidos em chats ou e-mails.", icon: "filter_hdr" },
                { title: "Risco de Erros Financeiros", desc: "Fórmulas erradas em planilhas levam a prejuízos gravíssimos.", icon: "rule" },
                { title: "Isolamento Comercial", desc: "Dificuldade em expor projetos para parceiros e investidores.", icon: "hub" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-inverse-surface/5 p-5 rounded-xl border border-outline-variant/40 shadow-sm hover:border-error/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-lg bg-error-container/20 flex items-center justify-center text-error mb-4">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h5 className="font-subtitle text-sm font-bold text-on-surface mb-1 flex items-center gap-1.5">
                      <span className="text-error">✅</span> {item.title}
                    </h5>
                    <p className="font-body text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como Resolvemos Section */}
      <section id="solucao" className="py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold mb-3 font-label">A Solução</h2>
            <h3 className="font-title text-3xl md:text-4xl text-on-surface font-extrabold mb-4">Centralização Inteligente</h3>
            <p className="font-body text-on-surface-variant text-base">
              O Despesify 2 unifica todas as necessidades de gestão em um único ambiente moderno, conectando os pilares de qualquer projeto de sucesso.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Features Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feat) => {
                const isSelected = activeFeature.id === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeature(feat)}
                    className={`text-left p-5 rounded-xl border transition-all duration-300 group flex items-start gap-4 ${
                      isSelected 
                        ? 'bg-primary-container/20 border-primary shadow-md scale-[1.02]' 
                        : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary-fixed-dim hover:bg-surface-container-low shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center ${feat.accent} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{feat.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-subtitle text-sm font-bold text-on-surface mb-1">{feat.title}</h4>
                      <p className="font-body text-xs text-on-surface-variant line-clamp-2">{feat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Selected Feature Details (Premium Sandbox Card) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/15 flex items-center justify-center text-primary mb-6 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">{activeFeature.icon}</span>
              </div>
              <span className="text-[10px] font-label font-bold text-primary tracking-widest uppercase mb-2 block">Destaque de Recurso</span>
              <h3 className="font-title text-xl font-bold text-on-surface mb-4">{activeFeature.title}</h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
                {activeFeature.description}
              </p>
              <div className="bg-white dark:bg-inverse-surface/5 p-4 rounded-xl border border-outline-variant/40 mb-6">
                <h5 className="font-label text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Como isso te ajuda na prática:
                </h5>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  {activeFeature.details}
                </p>
              </div>
              <Link
                to="/dashboard"
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-label text-xs font-bold text-center block hover:bg-primary/95 transition-all shadow-sm active:scale-95"
              >
                Testar Funcionalidade
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section id="planos" className="py-24 bg-surface-container-low border-y border-outline-variant/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold mb-3 font-label">Nossos Planos</h2>
            <h3 className="font-title text-3xl md:text-4xl text-on-surface font-extrabold mb-4">Escolha a Solução Ideal</h3>
            <p className="font-body text-on-surface-variant text-base">
              Apresentamos estruturas completas desenvolvidas especialmente para diferentes necessidades e momentos de projeto.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Citizen Plan */}
            <div className="bg-white dark:bg-inverse-surface/5 border border-outline-variant/30 rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">home</span>
                  </div>
                  <span className="font-label text-[10px] font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full uppercase">Pessoa Física</span>
                </div>
                <h4 className="font-title text-2xl font-bold text-on-surface mb-2">Plano Cidadão</h4>
                <p className="font-body text-xs text-on-surface-variant mb-6">
                  Destinado a organizar projetos pessoais, reformas, construções residenciais ou controlar gastos do cotidiano.
                </p>

                <div className="space-y-4 mb-8">
                  <h5 className="font-label text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2">O que oferece:</h5>
                  <ul className="space-y-2">
                    {["Controle financeiro simplificado", "Criação de projetos pessoais", "Organização de tarefas Kanban", "Controle de materiais", "Busca de fornecedores próximos", "Acompanhamento de orçamento", "Relatórios básicos"].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-label text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 mb-8">
                  <h5 className="font-label text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2">Benefícios:</h5>
                  <ul className="space-y-2">
                    {["✔ Mais organização", "✔ Menos desperdício", "✔ Melhor planejamento financeiro", "✔ Controle total da obra ou projeto"].map((ben, i) => (
                      <li key={i} className="text-xs font-label text-on-surface font-semibold flex items-center gap-2">
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                {/* Use case accordion */}
                <div className="mb-6">
                  <button 
                    onClick={() => toggleUseCase("citizen")} 
                    className="flex justify-between items-center w-full py-2 text-xs font-label text-primary font-bold hover:underline"
                  >
                    <span>{openUseCase.citizen ? "Ocultar Exemplo de Uso" : "Ver Exemplo de Uso"}</span>
                    <span className="material-symbols-outlined text-[16px]">{openUseCase.citizen ? "expand_less" : "expand_more"}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 bg-surface-container/30 rounded-lg border border-outline-variant/20 ${openUseCase.citizen ? 'max-h-40 p-4 mt-2' : 'max-h-0 opacity-0'}`}>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      Uma pessoa que está construindo sua casa pode controlar gastos com materiais, acompanhar serviços contratados, organizar etapas da construção e localizar fornecedores próximos.
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="w-full py-3.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary rounded-xl font-label text-xs font-bold text-center block transition-all shadow-sm active:scale-95"
                >
                  Começar Plano Cidadão
                </Link>
              </div>
            </div>

            {/* Enterprise Plan (Featured) */}
            <div className="bg-inverse-surface border-2 border-primary rounded-2xl p-8 flex flex-col justify-between shadow-xl relative scale-105 z-10 hover:-translate-y-1 transition-all duration-300 text-white">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">Mais Recomendado</span>
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
                    <span className="material-symbols-outlined text-[28px]">business</span>
                  </div>
                  <span className="font-label text-[10px] font-bold text-primary-fixed bg-primary-fixed-dim/20 px-2.5 py-1 rounded-full uppercase">Pessoa Jurídica</span>
                </div>
                <h4 className="font-title text-2xl font-bold mb-2 text-white">Plano Empresarial</h4>
                <p className="font-body text-xs text-outline-variant mb-6">
                  Perfeito para micro, pequenas e médias empresas que necessitam de rigoroso controle administrativo e operacional.
                </p>

                <div className="space-y-4 mb-8">
                  <h5 className="font-label text-xs font-bold uppercase tracking-wider border-b border-outline-variant/20 pb-2 text-primary-fixed">O que oferece:</h5>
                  <ul className="space-y-2">
                    {["Gestão financeira avançada", "Controle de receitas e despesas", "Gestão de funcionários e equipe", "Controle de estoque de materiais", "Gestão de projetos simultâneos", "Kanban corporativo integrado", "Relatórios e dashboards gerenciais"].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-label text-outline-variant">
                        <span className="material-symbols-outlined text-primary-fixed text-[16px]">check_circle</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 mb-8">
                  <h5 className="font-label text-xs font-bold uppercase tracking-wider border-b border-outline-variant/20 pb-2 text-primary-fixed">Benefícios:</h5>
                  <ul className="space-y-2">
                    {["✔ Maior produtividade", "✔ Melhor controle financeiro", "✔ Redução de custos operacionais", "✔ Visão completa do negócio em tempo real"].map((ben, i) => (
                      <li key={i} className="text-xs font-label font-semibold flex items-center gap-2 text-white">
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                {/* Use case accordion */}
                <div className="mb-6">
                  <button 
                    onClick={() => toggleUseCase("enterprise")} 
                    className="flex justify-between items-center w-full py-2 text-xs font-label text-primary-fixed font-bold hover:underline"
                  >
                    <span>{openUseCase.enterprise ? "Ocultar Exemplo de Uso" : "Ver Exemplo de Uso"}</span>
                    <span className="material-symbols-outlined text-[16px]">{openUseCase.enterprise ? "expand_less" : "expand_more"}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 bg-white/5 rounded-lg border border-outline/25 ${openUseCase.enterprise ? 'max-h-40 p-4 mt-2' : 'max-h-0 opacity-0'}`}>
                    <p className="font-body text-xs text-outline-variant leading-relaxed">
                      Uma empresa de construção pode gerenciar vários projetos ao mesmo tempo, controlar equipes, acompanhar custos de materiais e monitorar o andamento das obras.
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary/90 rounded-xl font-label text-xs font-bold text-center block transition-all shadow-md active:scale-95"
                >
                  Assinar Plano Empresarial
                </Link>
              </div>
            </div>

            {/* Investor Plan */}
            <div className="bg-white dark:bg-inverse-surface/5 border border-outline-variant/30 rounded-2xl p-8 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary-fixed/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[28px]">payments</span>
                  </div>
                  <span className="font-label text-[10px] font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full uppercase">Investimentos</span>
                </div>
                <h4 className="font-title text-2xl font-bold text-on-surface mb-2">Plano Investidor</h4>
                <p className="font-body text-xs text-on-surface-variant mb-6">
                  Ideal para pessoas físicas ou jurídicas focadas em descobrir novas oportunidades de negócios em projetos promissores.
                </p>

                <div className="space-y-4 mb-8">
                  <h5 className="font-label text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2">O que oferece:</h5>
                  <ul className="space-y-2">
                    {["Acesso à vitrine de projetos públicos", "Busca refinada por categoria", "Visualização de metas financeiras", "Análise de relatórios de progresso", "Comunicação interna com criadores", "Histórico de propostas estruturado", "Acompanhamento de negociações"].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-label text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 mb-8">
                  <h5 className="font-label text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2">Benefícios:</h5>
                  <ul className="space-y-2">
                    {["✔ Descoberta de oportunidades", "✔ Contato direto com proponentes", "✔ Ambiente de análise centralizado", "✔ Transparência e segurança na negociação"].map((ben, i) => (
                      <li key={i} className="text-xs font-label font-semibold flex items-center gap-2">
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                {/* Use case accordion */}
                <div className="mb-6">
                  <button 
                    onClick={() => toggleUseCase("investor")} 
                    className="flex justify-between items-center w-full py-2 text-xs font-label text-secondary font-bold hover:underline"
                  >
                    <span>{openUseCase.investor ? "Ocultar Exemplo de Uso" : "Ver Exemplo de Uso"}</span>
                    <span className="material-symbols-outlined text-[16px]">{openUseCase.investor ? "expand_less" : "expand_more"}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 bg-surface-container/30 rounded-lg border border-outline-variant/20 ${openUseCase.investor ? 'max-h-40 p-4 mt-2' : 'max-h-0 opacity-0'}`}>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      Um investidor interessado em projetos de tecnologia pode visualizar propostas cadastradas na plataforma, entrar em contato com os responsáveis e negociar aportes financeiros.
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="w-full py-3.5 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-on-secondary rounded-xl font-label text-xs font-bold text-center block transition-all shadow-sm active:scale-95"
                >
                  Cadastrar como Investidor
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Por Que Escolher (Interactive Graph / Node Section) */}
      <section id="diferenciais" className="py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold mb-3 font-label">Diferenciais</h2>
            <h3 className="font-title text-3xl md:text-4xl text-on-surface font-extrabold mb-4">Por que escolher o Despesify 2?</h3>
            <p className="font-body text-on-surface-variant text-base">
              Somos mais do que um sistema financeiro comum. Somos a engrenagem que conecta e potencializa cada parte do seu projeto.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Interactive Graph representation */}
            <div className="lg:col-span-6 flex justify-center items-center relative py-10 min-h-[350px]">
              
              {/* Central Circle */}
              <div className="w-28 h-28 rounded-full bg-primary flex flex-col justify-center items-center text-on-primary text-center font-bold font-title text-sm shadow-[0_0_30px_rgba(0,97,147,0.3)] z-10 border-4 border-white">
                <span className="text-[10px] font-label font-semibold opacity-85 leading-none">PROJETO</span>
                <span className="text-sm tracking-wide leading-none mt-1">Despesify 2</span>
              </div>

              {/* Surrounding Nodes */}
              {[
                { id: "finance", label: "Finanças", icon: "account_balance_wallet", angle: "0" },
                { id: "projects", label: "Projetos", icon: "folder_shared", angle: "60" },
                { id: "teams", label: "Equipes", icon: "group", angle: "120" },
                { id: "materials", label: "Materiais", icon: "inventory_2", angle: "180" },
                { id: "suppliers", label: "Fornecedores", icon: "local_shipping", angle: "240" },
                { id: "investors", label: "Investidores", icon: "payments", angle: "300" }
              ].map((node) => {
                const angleRad = (node.angle * Math.PI) / 180;
                const radius = 135; // px distance from center
                const x = radius * Math.cos(angleRad);
                const y = radius * Math.sin(angleRad);
                
                const isSelected = selectedWhyNode === node.id;

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedWhyNode(node.id)}
                    className={`absolute w-16 h-16 rounded-full flex flex-col justify-center items-center transition-all duration-300 z-20 ${
                      isSelected 
                        ? 'bg-secondary text-on-secondary shadow-lg border-2 border-white scale-110' 
                        : 'bg-white dark:bg-inverse-surface/10 text-on-surface-variant hover:bg-surface-container hover:text-primary border border-outline-variant/40 shadow-sm scale-100'
                    }`}
                    style={{
                      transform: `translate(${x}px, ${y}px)`
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">{node.icon}</span>
                    <span className="text-[9px] font-label font-bold mt-1 leading-none">{node.label}</span>
                  </button>
                );
              })}

              {/* Connecting Lines Canvas / SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#006193" />
                    <stop offset="100%" stopColor="#326286" />
                  </linearGradient>
                </defs>
                <circle cx="50%" cy="50%" r="135" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="50%" y2="50%" stroke="#006193" strokeWidth="2" />
              </svg>
            </div>

            {/* Explanation box */}
            <div className="lg:col-span-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
              <span className="text-[10px] font-label font-bold text-secondary tracking-widest uppercase mb-2 block">Integração Prática</span>
              <h4 className="font-title text-xl font-bold text-on-surface mb-4">
                Conexão: {whyNodes[selectedWhyNode].title}
              </h4>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {whyNodes[selectedWhyNode].desc}
              </p>
              
              <div className="mt-8 flex flex-wrap gap-2">
                {Object.keys(whyNodes).map((nodeId) => (
                  <button
                    key={nodeId}
                    onClick={() => setSelectedWhyNode(nodeId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-label font-semibold border transition-all ${
                      selectedWhyNode === nodeId 
                        ? 'bg-secondary/15 border-secondary text-secondary' 
                        : 'bg-white dark:bg-inverse-surface/5 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {whyNodes[nodeId].title}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-on-primary text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-title text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Pronto para transformar a gestão dos seus projetos?
          </h2>
          <p className="font-body text-base text-primary-fixed/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Diga adeus às planilhas soltas e à perda de dados. Simplifique seus processos do planejamento ao investimento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary hover:bg-primary-fixed font-label font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              Acessar Aplicativo
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-high py-12 px-6 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary font-title text-sm font-bold">D</div>
            <div>
              <h5 className="font-title text-base font-bold text-on-surface">Despesify 2</h5>
              <p className="font-label text-[10px] text-on-surface-variant opacity-75">Planeje, controle e transforme projetos em resultados.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-label text-on-surface-variant">
            <a href="#problema" className="hover:text-primary transition-colors">O Problema</a>
            <a href="#solucao" className="hover:text-primary transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
            <a href="#diferenciais" className="hover:text-primary transition-colors">Diferenciais</a>
          </div>
          <div>
            <p className="font-label text-[11px] text-on-surface-variant opacity-60">
              © {new Date().getFullYear()} Despesify 2. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
