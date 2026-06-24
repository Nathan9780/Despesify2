import React, { useState } from "react";
import { Link } from "react-router-dom";

export function Investors() {
  // Dados mockados
  const [investors] = useState([
    {
      id: 1,
      name: "João Investimentos LTDA",
      type: "Pessoa Jurídica",
      invested: 50000,
      participation: 10,
      projects: 3,
      status: "active",
      lastContact: "2026-06-20",
      avatar: "JI",
    },
    {
      id: 2,
      name: "Carlos Silva",
      type: "Pessoa Física",
      invested: 25000,
      participation: 5,
      projects: 2,
      status: "active",
      lastContact: "2026-06-18",
      avatar: "CS",
    },
    {
      id: 3,
      name: "Empresa XYZ",
      type: "Pessoa Jurídica",
      invested: 75000,
      participation: 15,
      projects: 4,
      status: "active",
      lastContact: "2026-06-15",
      avatar: "EX",
    },
    {
      id: 4,
      name: "Fundo Imobiliário Alpha",
      type: "Pessoa Jurídica",
      invested: 100000,
      participation: 20,
      projects: 5,
      status: "active",
      lastContact: "2026-06-10",
      avatar: "FI",
    },
    {
      id: 5,
      name: "Maria Santos",
      type: "Pessoa Física",
      invested: 15000,
      participation: 3,
      projects: 1,
      status: "inactive",
      lastContact: "2026-05-28",
      avatar: "MS",
    },
  ]);

  const [proposals] = useState([
    {
      id: 1,
      investor: "Carlos Silva",
      offer: 20000,
      requestedReturn: 15,
      status: "analysis",
      date: "2026-06-22",
      project: "Ampliação da Empresa",
    },
    {
      id: 2,
      investor: "João Investimentos LTDA",
      offer: 50000,
      requestedReturn: 12,
      status: "approved",
      date: "2026-06-19",
      project: "Loft Distrito Histórico",
    },
    {
      id: 3,
      investor: "Empresa XYZ",
      offer: 30000,
      requestedReturn: 18,
      status: "rejected",
      date: "2026-06-14",
      project: "Reforma da Casa",
    },
    {
      id: 4,
      investor: "Fundo Imobiliário Alpha",
      offer: 80000,
      requestedReturn: 10,
      status: "analysis",
      date: "2026-06-23",
      project: "Cobertura Duplex",
    },
  ]);

  const [publicProjects] = useState([
    {
      id: 1,
      name: "Ampliação da Empresa",
      goal: 500000,
      raised: 150000,
      progress: 30,
      investors: 12,
      expectedReturn: 18,
      category: "Comercial",
    },
    {
      id: 2,
      name: "Loft Distrito Histórico",
      goal: 300000,
      raised: 120000,
      progress: 40,
      investors: 8,
      expectedReturn: 15,
      category: "Residencial",
    },
    {
      id: 3,
      name: "Parque Urbano",
      goal: 800000,
      raised: 200000,
      progress: 25,
      investors: 15,
      expectedReturn: 20,
      category: "Público",
    },
  ]);

  const [opportunities] = useState([
    {
      id: 1,
      text: "Novo investidor interessado no projeto 'Ampliação'",
      time: "5 min",
      type: "new",
    },
    {
      id: 2,
      text: "Proposta recebida de Fundo Imobiliário Alpha",
      time: "1 hora",
      type: "proposal",
    },
    {
      id: 3,
      text: "Investimento de R$ 50.000 aprovado",
      time: "3 horas",
      type: "approved",
    },
    {
      id: 4,
      text: "Meta de captação do projeto 'Loft' atingiu 40%",
      time: "1 dia",
      type: "milestone",
    },
  ]);

  const [chatMessages] = useState([
    {
      id: 1,
      from: "João Investimentos LTDA",
      message:
        "Olá, tenho interesse no projeto de ampliação. Podemos agendar uma reunião?",
      time: "2 horas",
      unread: true,
    },
    {
      id: 2,
      from: "Carlos Invest",
      message: "Gostaria de discutir a proposta de investimento no Loft.",
      time: "5 horas",
      unread: false,
    },
  ]);

  // Estatísticas
  const totalRaised = investors.reduce((sum, i) => sum + i.invested, 0);
  const totalInvestors = investors.length;
  const publicProjectsCount = publicProjects.length;
  const pendingProposals = proposals.filter(
    (p) => p.status === "analysis",
  ).length;

  // Status labels
  const proposalStatus = {
    analysis: {
      label: "⏳ Em análise",
      color: "bg-yellow-100 text-yellow-700",
    },
    approved: { label: "✅ Aprovado", color: "bg-green-100 text-green-700" },
    rejected: { label: "❌ Recusado", color: "bg-red-100 text-red-700" },
  };

  const investorStatus = {
    active: "🟢 Ativo",
    inactive: "🔴 Inativo",
  };

  // Gráfico de evolução (mock)
  const chartData = [
    { month: "Jan", value: 20000 },
    { month: "Fev", value: 35000 },
    { month: "Mar", value: 50000 },
    { month: "Abr", value: 75000 },
    { month: "Mai", value: 110000 },
    { month: "Jun", value: 150000 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }
        .badge-glow {
          background: rgba(41, 128, 185, 0.12);
          color: #2980B9;
          border: 1px solid rgba(41, 128, 185, 0.25);
          box-shadow: 0 0 16px rgba(41, 128, 185, 0.1);
        }
        .badge-glow-secondary {
          background: rgba(52, 152, 219, 0.12);
          color: #3498DB;
          border: 1px solid rgba(52, 152, 219, 0.25);
          box-shadow: 0 0 16px rgba(52, 152, 219, 0.1);
        }
        .badge-glow-success {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.25);
          box-shadow: 0 0 16px rgba(34, 197, 94, 0.1);
        }
        .btn-primary-glow {
          transition: all 0.25s ease;
        }
        .btn-primary-glow:hover {
          box-shadow: 0 0 24px rgba(41, 128, 185, 0.4);
          transform: translateY(-1px);
        }
        .btn-outline-glow {
          transition: all 0.25s ease;
        }
        .btn-outline-glow:hover {
          box-shadow: 0 0 20px rgba(41, 128, 185, 0.2);
          background: rgba(41, 128, 185, 0.04);
        }
        .icon-glow {
          filter: drop-shadow(0 0 8px rgba(41, 128, 185, 0.15));
          transition: filter 0.3s ease;
        }
        .icon-glow:hover {
          filter: drop-shadow(0 0 16px rgba(41, 128, 185, 0.3));
        }
        .number-glow {
          text-shadow: 0 0 20px rgba(41, 128, 185, 0.15);
        }
        .notif-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(41, 128, 185, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(41, 128, 185, 0); }
          100% { box-shadow: 0 0 0 0 rgba(41, 128, 185, 0); }
        }
        .chart-bar {
          transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Cabeçalho */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Investidores</h1>
          <p className="text-sm text-gray-500">
            Gerencie captações, propostas e relacionamento com investidores.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              person_add
            </span>
            Novo Investidor
          </button>
          <button className="btn-outline-glow px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
            <span className="material-symbols-outlined text-lg">public</span>
            Vitrine
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Total Captado
          </p>
          <p className="text-xl font-bold text-green-600">
            R$ {totalRaised.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">groups</span>
            Investidores
          </p>
          <p className="text-xl font-bold text-gray-800">{totalInvestors}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              folder_open
            </span>
            Projetos Públicos
          </p>
          <p className="text-xl font-bold text-gray-800">
            {publicProjectsCount}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">pending</span>
            Propostas Pendentes
          </p>
          <p className="text-xl font-bold text-orange-500">
            {pendingProposals}
          </p>
        </div>
      </div>

      {/* Meta de Captação */}
      <div
        className="glass-card rounded-xl p-5 mb-6 animate-fade-up"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">
                target
              </span>
              Meta de Captação
            </h3>
            <p className="text-sm text-gray-500">
              Acompanhe o progresso da sua meta de investimentos.
            </p>
          </div>
          <div className="mt-2 sm:mt-0 text-sm">
            <span className="font-bold text-green-600">
              R$ {totalRaised.toLocaleString()}
            </span>
            <span className="text-gray-500"> de </span>
            <span className="font-bold text-gray-800">R$ 500.000</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{Math.round((totalRaised / 500000) * 100)}% concluído</span>
            <span>Faltam R$ {(500000 - totalRaised).toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min((totalRaised / 500000) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Grid principal: Investidores + Propostas + Chat + Vitrine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda: Investidores (2 colunas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lista de Investidores */}
          <div
            className="glass-card rounded-xl p-5 animate-fade-up"
            style={{ animationDelay: "0.20s" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  groups
                </span>
                Investidores
              </h3>
              <Link to="#" className="text-sm text-blue-600 hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {investors.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white/50 rounded-xl p-3 border border-gray-200 hover:shadow transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {inv.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {inv.name}
                        </p>
                        <p className="text-xs text-gray-500">{inv.type}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-600">
                      {investorStatus[inv.status]}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                    <div className="bg-gray-50 rounded p-1 text-center">
                      <p className="font-bold text-blue-600">
                        R$ {inv.invested.toLocaleString()}
                      </p>
                      <span className="text-gray-400">Investido</span>
                    </div>
                    <div className="bg-gray-50 rounded p-1 text-center">
                      <p className="font-bold text-gray-700">
                        {inv.participation}%
                      </p>
                      <span className="text-gray-400">Participação</span>
                    </div>
                    <div className="bg-gray-50 rounded p-1 text-center">
                      <p className="font-bold text-gray-700">{inv.projects}</p>
                      <span className="text-gray-400">Projetos</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-lg text-xs font-medium">
                      💬 Conversar
                    </button>
                    <button className="flex-1 border border-gray-300 rounded-lg py-1 text-xs hover:bg-gray-50">
                      📊 Histórico
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div
            className="glass-card rounded-xl p-5 animate-fade-up"
            style={{ animationDelay: "0.30s" }}
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-green-600">
                trending_up
              </span>
              Evolução dos Investimentos
            </h3>
            <div className="flex items-end gap-3 h-40">
              {chartData.map((item) => {
                const maxValue = 160000;
                const height = (item.value / maxValue) * 100;
                return (
                  <div
                    key={item.month}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="w-full flex justify-center">
                      <div
                        className="chart-bar w-8 bg-gradient-to-t from-green-400 to-blue-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: "4px" }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">
                      {item.month}
                    </span>
                    <span className="text-[8px] text-gray-400">
                      R$ {(item.value / 1000).toFixed(0)}k
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna direita: Propostas + Chat + Vitrine */}
        <div className="space-y-4">
          {/* Propostas Recebidas */}
          <div
            className="glass-card rounded-xl p-4 animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-orange-500">
                  description
                </span>
                Propostas Recebidas
              </h3>
              <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                {pendingProposals} pendentes
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/50 rounded-lg p-3 border border-gray-200 hover:shadow transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {p.investor}
                      </p>
                      <p className="text-[10px] text-gray-500">{p.project}</p>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full ${proposalStatus[p.status].color}`}
                    >
                      {proposalStatus[p.status].label}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Oferta: R$ {p.offer.toLocaleString()}</span>
                    <span>Retorno: {p.requestedReturn}%</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-xs font-medium">
                      ✅ Aceitar
                    </button>
                    <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded text-xs font-medium">
                      ❌ Recusar
                    </button>
                    <button className="flex-1 border border-gray-300 rounded py-1 text-xs hover:bg-gray-50">
                      💬 Negociar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Central de Conversas (Chat) */}
          <div
            className="glass-card rounded-xl p-4 animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm mb-3">
              <span className="material-symbols-outlined text-blue-600">
                chat
              </span>
              Conversas Recentes
            </h3>
            <div className="space-y-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 p-2 rounded-lg hover:bg-blue-50 transition ${msg.unread ? "bg-blue-50/50 border-l-4 border-blue-500" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                    {msg.from
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-xs font-medium text-gray-800">
                        {msg.from}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {msg.message}
                    </p>
                  </div>
                  {msg.unread && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 notif-dot"></span>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-2 w-full btn-outline-glow border border-gray-300 rounded-lg py-1.5 text-xs font-medium hover:bg-gray-50">
              Abrir Chat Completo
            </button>
          </div>

          {/* Vitrine de Projetos Públicos */}
          <div
            className="glass-card rounded-xl p-4 animate-fade-up"
            style={{ animationDelay: "0.40s" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-purple-600">
                  storefront
                </span>
                Projetos Públicos
              </h3>
              <Link
                to="/investors/vitrine"
                className="text-xs text-blue-600 hover:underline"
              >
                Ver vitrine
              </Link>
            </div>
            <div className="space-y-2">
              {publicProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/50 rounded-lg p-3 border border-gray-200 hover:shadow transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-500">{p.category}</p>
                    </div>
                    <span className="badge-glow-secondary text-[9px] px-2 py-0.5 rounded-full">
                      {p.investors} investidores
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Meta: R$ {p.goal.toLocaleString()}</span>
                      <span>Captado: R$ {p.raised.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                      <span>Progresso</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${p.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-green-600">
                      Retorno previsto: {p.expectedReturn}%
                    </span>
                    <button className="text-blue-600 hover:underline">
                      🔍 Ver Projeto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Oportunidades (notificações) */}
      <div
        className="glass-card rounded-xl p-4 mt-6 animate-fade-up"
        style={{ animationDelay: "0.45s" }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-orange-500">
              notifications_active
            </span>
            Oportunidades
          </h3>
          <span className="w-2 h-2 bg-orange-500 rounded-full notif-dot"></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-orange-50 transition border-l-4 border-orange-400"
            >
              <span className="material-symbols-outlined text-orange-400 text-sm">
                notifications
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-800">{opp.text}</p>
                <span className="text-[10px] text-gray-400">
                  {opp.time} atrás
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
