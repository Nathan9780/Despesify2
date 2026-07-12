import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useInvestors } from "../hooks/useInvestors";
import { useProposals } from "../hooks/useProposals";
import { usePublicProjects } from "../hooks/usePublicProjects";
import { useDashboard } from "../hooks/useDashboard";
import { useInvestments } from "../hooks/useInvestments";
import { useInvitations } from "../hooks/useInvitations";
import toast from "react-hot-toast";

export function Investors() {
  // Dados reais com cache otimizado (React Query já faz cache)
  const {
    investors,
    isLoading: investorsLoading,
    error: investorsError,
  } = useInvestors();
  const {
    proposals,
    isLoading: proposalsLoading,
    error: proposalsError,
  } = useProposals();
  const {
    publicProjects,
    isLoading: publicLoading,
    error: publicError,
  } = usePublicProjects();
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboard();

  const { balance, addBalance, investments: myInvestments } = useInvestments();
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");

  const [showRoiModal, setShowRoiModal] = useState(false);
  const [roiInvestor, setRoiInvestor] = useState(null);

  // Sistema de convites
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitationsPanel, setShowInvitationsPanel] = useState(false);
  const [inviteForm, setInviteForm] = useState({ receiver_email: "", message: "" });
  const {
    receivedInvitations,
    sentInvitations,
    sendInvitation,
    respondInvitation,
  } = useInvitations();

  const pendingReceived = receivedInvitations.filter(i => i.status === "pending");

  const handleAddBalance = (e) => {
    e.preventDefault();
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) return;
    addBalance(parseFloat(balanceAmount));
    setBalanceAmount("");
    setShowAddBalance(false);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.receiver_email.trim()) return;
    try {
      await sendInvitation.mutateAsync({
        receiver_email: inviteForm.receiver_email.trim(),
        message: inviteForm.message,
        sender_role: "enterprise",
      });
      toast.success(`Solicitação enviada para ${inviteForm.receiver_email}!`);
      setInviteForm({ receiver_email: "", message: "" });
      setShowInviteModal(false);
    } catch (err) {
      toast.error(err.message || "Erro ao enviar solicitação.");
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await respondInvitation.mutateAsync({ id, status });
      toast.success(status === "accepted" ? "Solicitação aceita!" : "Solicitação recusada.");
    } catch (err) {
      toast.error(err.message || "Erro ao responder solicitação.");
    }
  };

  // Oportunidades (notificações) - dados estáticos
  const opportunities = useMemo(
    () => [
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
    ],
    [],
  );

  // Chat - dados estáticos
  const chatMessages = useMemo(
    () => [
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
    ],
    [],
  );

  // ===== ESTATÍSTICAS MEMOIZADAS =====
  const stats = useMemo(() => {
    const totalRaised =
      investors?.reduce((sum, i) => sum + (i.invested || 0), 0) || 0;
    const totalInvestors = investors?.length || 0;
    const publicProjectsCount = publicProjects?.length || 0;
    const pendingProposals =
      proposals?.filter((p) => p.status === "analysis").length || 0;
    const fundingGoal = dashboardData?.investments?.goal || 500000;

    return {
      totalRaised,
      totalInvestors,
      publicProjectsCount,
      pendingProposals,
      fundingGoal,
    };
  }, [investors, publicProjects, proposals, dashboardData]);

  // ===== GRÁFICO MEMOIZADO =====
  const chartData = useMemo(() => {
    const baseData = [
      { month: "Jan", value: 20000 },
      { month: "Fev", value: 35000 },
      { month: "Mar", value: 50000 },
      { month: "Abr", value: 75000 },
      { month: "Mai", value: 110000 },
    ];
    return [...baseData, { month: "Jun", value: stats.totalRaised || 150000 }];
  }, [stats.totalRaised]);

  // ===== STATUS LABELS =====
  const proposalStatus = useMemo(
    () => ({
      analysis: {
        label: "⏳ Em análise",
        color: "bg-yellow-100 text-yellow-700",
      },
      approved: { label: "✅ Aprovado", color: "bg-green-100 text-green-700" },
      rejected: { label: "❌ Recusado", color: "bg-red-100 text-red-700" },
    }),
    [],
  );

  const investorStatus = useMemo(
    () => ({
      active: "🟢 Ativo",
      inactive: "🔴 Inativo",
    }),
    [],
  );

  // ===== ESTADO DE LOADING COMBINADO =====
  const isLoading =
    investorsLoading || proposalsLoading || publicLoading || dashboardLoading;

  // ===== TRATAMENTO DE ERRO =====
  const error =
    investorsError || proposalsError || publicError || dashboardError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando investidores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-red-400 block">
            error
          </span>
          <p className="text-xl font-semibold text-red-600 mt-4">
            Erro ao carregar dados
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {error.message || "Ocorreu um erro inesperado."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
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
          <button onClick={() => setShowAddBalance(true)} className="btn-outline-glow px-4 py-2 border border-green-300 text-green-600 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-50">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Adicionar Saldo
          </button>
          <button onClick={() => setShowInviteModal(true)} className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">person_add</span>
            Convidar Investidor
          </button>
          <button
            onClick={() => setShowInvitationsPanel(true)}
            className="relative btn-outline-glow px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            Solicitações
            {pendingReceived.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingReceived.length}
              </span>
            )}
          </button>
          <Link to="/vitrine">
            <button className="btn-outline-glow px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
              <span className="material-symbols-outlined text-lg">public</span>
              Vitrine
            </button>
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            Meu Saldo
          </p>
          <p className="text-xl font-bold text-blue-600">
            R$ {balance.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Total Captado
          </p>
          <p className="text-xl font-bold text-green-600">
            R$ {stats.totalRaised.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">groups</span>
            Investidores
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.totalInvestors}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              folder_open
            </span>
            Projetos Públicos
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.publicProjectsCount}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">pending</span>
            Propostas Pendentes
          </p>
          <p className="text-xl font-bold text-orange-500">
            {stats.pendingProposals}
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
              R$ {stats.totalRaised.toLocaleString()}
            </span>
            <span className="text-gray-500"> de </span>
            <span className="font-bold text-gray-800">
              R$ {stats.fundingGoal.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>
              {Math.min(
                Math.round((stats.totalRaised / stats.fundingGoal) * 100),
                100,
              )}
              % concluído
            </span>
            <span>
              Faltam R${" "}
              {Math.max(
                stats.fundingGoal - stats.totalRaised,
                0,
              ).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min((stats.totalRaised / stats.fundingGoal) * 100, 100)}%`,
              }}
            />
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
              {investors && investors.length > 0 ? (
                investors.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white/50 rounded-xl p-3 border border-gray-200 hover:shadow transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {inv.avatar || inv.name?.charAt(0) || "I"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {inv.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inv.type || "Investidor"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-green-600">
                        {inv.status === "active" ? "🟢 Ativo" : "🔴 Inativo"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                      <div className="bg-gray-50 rounded p-1 text-center">
                        <p className="font-bold text-blue-600">
                          R$ {inv.invested?.toLocaleString() || "0"}
                        </p>
                        <span className="text-gray-400">Investido</span>
                      </div>
                      <div className="bg-gray-50 rounded p-1 text-center">
                        <p className="font-bold text-gray-700">
                          {inv.participation || 0}%
                        </p>
                        <span className="text-gray-400">Participação</span>
                      </div>
                      <div className="bg-gray-50 rounded p-1 text-center">
                        <p className="font-bold text-gray-700">
                          {inv.projects || 0}
                        </p>
                        <span className="text-gray-400">Projetos</span>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-lg text-xs font-medium">
                        💬 Conversar
                      </button>
                      <button
                        onClick={() => { setRoiInvestor(inv); setShowRoiModal(true); }}
                        className="flex-1 border border-gray-300 rounded-lg py-1 text-xs hover:bg-gray-50"
                      >
                        📊 Histórico
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <p>Nenhum investidor vinculado.</p>
                  <button onClick={() => setShowInviteModal(true)} className="mt-2 text-blue-600 hover:underline">
                    Convidar primeiro investidor
                  </button>
                </div>
              )}
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
                const maxValue = Math.max(
                  ...chartData.map((d) => d.value),
                  160000,
                );
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
                      />
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
                {stats.pendingProposals} pendentes
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
              {proposals && proposals.length > 0 ? (
                proposals.map((p) => (
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
                        className={`text-[9px] px-2 py-0.5 rounded-full ${proposalStatus[p.status]?.color || "bg-gray-100 text-gray-600"}`}
                      >
                        {proposalStatus[p.status]?.label || "⏳ Em análise"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Oferta: R$ {p.offer?.toLocaleString() || "0"}</span>
                      <span>Retorno: {p.requestedReturn || 0}%</span>
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
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhuma proposta recebida.
                </div>
              )}
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
              {publicProjects && publicProjects.length > 0 ? (
                publicProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/50 rounded-lg p-3 border border-gray-200 hover:shadow transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-gray-800">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {p.category}
                        </p>
                      </div>
                      <span className="badge-glow-secondary text-[9px] px-2 py-0.5 rounded-full">
                        {p.investors || 0} investidores
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Meta: R$ {p.goal?.toLocaleString() || "0"}</span>
                        <span>
                          Captado: R$ {p.raised?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                        <span>Progresso</span>
                        <span>{p.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${p.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-green-600">
                        Retorno previsto: {p.expectedReturn || 0}%
                      </span>
                      <Link
                        to={`/projects/${p.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        🔍 Ver Projeto
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhum projeto público disponível.
                </div>
              )}
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

      {/* Modal ROI Histórico */}
      {showRoiModal && roiInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowRoiModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">📊 ROI - {roiInvestor.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Relatório de Retorno sobre Investimento</p>
              </div>
              <button onClick={() => setShowRoiModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {(() => {
              const invested = roiInvestor.invested || 0;
              const estimatedReturn = roiInvestor.estimatedReturn || invested * 1.25;
              const currentValue = roiInvestor.currentValue || estimatedReturn;
              const roiPercent = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;
              const investmentDate = roiInvestor.investmentDate || roiInvestor.created_at || new Date().toISOString();
              const months = ["Mês 1","Mês 2","Mês 3","Mês 4","Mês 5","Mês 6"];
              const growthData = months.map((m, i) => ({
                month: m,
                value: Math.round(invested + (currentValue - invested) * ((i + 1) / months.length)),
              }));
              const maxVal = Math.max(...growthData.map(d => d.value), invested);
              return (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Investido</p>
                      <p className="text-lg font-bold text-blue-600">R$ {invested.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Valor Atual</p>
                      <p className="text-lg font-bold text-green-600">R$ {currentValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">ROI</p>
                      <p className={`text-lg font-bold ${roiPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roiPercent >= 0 ? '+' : ''}{roiPercent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Data do Investimento</p>
                      <p className="text-lg font-bold text-gray-700">{new Date(investmentDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Evolução do Investimento</p>
                    <div className="flex items-end gap-2 h-32">
                      {growthData.map(d => {
                        const height = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
                        return (
                          <div key={d.month} className="flex flex-col items-center flex-1">
                            <div className="w-full flex justify-center">
                              <div className="chart-bar w-6 bg-gradient-to-t from-green-400 to-blue-500 rounded-t" style={{ height: `${height}%`, minHeight: '4px' }} />
                            </div>
                            <span className="text-[9px] text-gray-500 mt-1">{d.month}</span>
                            <span className="text-[7px] text-gray-400">R${(d.value / 1000).toFixed(0)}k</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Adicionar Saldo */}
      {showAddBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddBalance(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Adicionar Saldo</h3>
              <button onClick={() => setShowAddBalance(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddBalance}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Ex: 10000"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
              >
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Convidar Investidor */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Convidar Investidor</h3>
                <p className="text-sm text-gray-500 mt-0.5">O investidor receberá uma solicitação e poderá aceitar ou recusar.</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSendInvite}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do Investidor *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.receiver_email}
                  onChange={e => setInviteForm({ ...inviteForm, receiver_email: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="investidor@email.com"
                />
                <p className="text-xs text-gray-400 mt-1">O usuário precisa ter uma conta no sistema.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (opcional)</label>
                <textarea
                  value={inviteForm.message}
                  onChange={e => setInviteForm({ ...inviteForm, message: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] resize-none"
                  placeholder="Olá! Gostaria de convidar você para investir em nossos projetos..."
                />
              </div>
              <button
                type="submit"
                disabled={sendInvitation.isPending}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                {sendInvitation.isPending ? "Enviando..." : "Enviar Solicitação"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Painel de Solicitações */}
      {showInvitationsPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowInvitationsPanel(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Solicitações</h3>
              <button onClick={() => setShowInvitationsPanel(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Recebidas */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-[18px]">inbox</span>
                  Recebidas
                  {pendingReceived.length > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingReceived.length} pendentes</span>
                  )}
                </h4>
                {receivedInvitations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma solicitação recebida.</p>
                ) : (
                  <div className="space-y-3">
                    {receivedInvitations.map(inv => (
                      <div key={inv.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-800">De: {inv.sender_id?.substring(0, 8)}...</p>
                            {inv.message && <p className="text-xs text-gray-500 mt-1 italic">"{inv.message}"</p>}
                            <p className="text-xs text-gray-400 mt-1">{new Date(inv.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {inv.status === 'pending' ? '⏳ Pendente' : inv.status === 'accepted' ? '✅ Aceita' : '❌ Recusada'}
                          </span>
                        </div>
                        {inv.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleRespond(inv.id, 'accepted')}
                              disabled={respondInvitation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              ✅ Aceitar
                            </button>
                            <button
                              onClick={() => handleRespond(inv.id, 'rejected')}
                              disabled={respondInvitation.isPending}
                              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              ❌ Recusar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enviadas */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">send</span>
                  Enviadas
                </h4>
                {sentInvitations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma solicitação enviada.</p>
                ) : (
                  <div className="space-y-2">
                    {sentInvitations.map(inv => (
                      <div key={inv.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{inv.receiver_email}</p>
                          <p className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {inv.status === 'pending' ? '⏳ Pendente' : inv.status === 'accepted' ? '✅ Aceita' : '❌ Recusada'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
