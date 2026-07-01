import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/layout/ui/Logo";

export function PlanSelection() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleConfirmPlan = () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // 1. Update currentUser
      const updatedUser = { ...user, plan: selectedPlan };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // 2. Update users list in database (localStorage)
      const usersStr = localStorage.getItem("users");
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const updatedUsers = users.map((u) =>
          u.email.toLowerCase() === user.email.toLowerCase()
            ? { ...u, plan: selectedPlan }
            : u,
        );
        localStorage.setItem("users", JSON.stringify(updatedUsers));
      }

      setIsSubmitting(false);
      navigate("/dashboard");
    }, 1000);
  };

  const plans = [
    {
      key: "citizen",
      title: "Plano Pessoal",
      icon: "home",
      iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
      badge: "Pessoas Físicas",
      ideal: "Ideal para pessoas que desejam organizar projetos particulares.",
      indications: [
        "Construção de residência",
        "Reformas",
        "Projetos pessoais",
        "Controle financeiro doméstico",
      ],
      benefits: [
        "Gestão de despesas",
        "Controle de materiais",
        "Organização de tarefas",
        "Controle de pagamentos para prestadores de serviço",
        "Busca de fornecedores próximos",
        "Acompanhamento do orçamento",
      ],
    },
    {
      key: "enterprise",
      title: "Plano Empresarial",
      icon: "business",
      iconBg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
      badge: "Empresas & Equipes",
      ideal:
        "Ideal para empreendedores e empresas que buscam crescimento e organização.",
      indications: [
        "Administração de empresas",
        "Gestão de equipes",
        "Controle de múltiplos projetos",
        "Planejamento financeiro empresarial",
      ],
      benefits: [
        "Gestão financeira avançada",
        "Controle de funcionários e operários",
        "Gestão de tarefas e produtividade",
        "Controle de receitas e despesas",
        "Relatórios gerenciais",
        "Busca de fornecedores",
        "Conexão com investidores",
        "Parcerias entre empresas",
      ],
    },
    {
      key: "investor",
      title: "Plano Investidor",
      icon: "payments",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
      badge: "Investimentos",
      ideal:
        "Ideal para pessoas ou organizações interessadas em investir em novos projetos.",
      indications: [
        "Investidores iniciantes",
        "Investidores experientes",
        "Empresas de investimento",
      ],
      benefits: [
        "Acesso à vitrine de projetos",
        "Busca por oportunidades de investimento",
        "Comunicação com empreendedores",
        "Avaliação de propostas",
        "Histórico de negociações",
        "Acompanhamento de investimentos",
      ],
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-16 px-6 relative overflow-hidden font-body flex flex-col justify-center">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Logo
            variant="icon"
            className="mx-auto mb-6 shadow-lg"
            imgClassName="w-14 h-14"
          />
          <h2 className="font-title text-3xl font-bold text-on-surface">
            Seja bem-vindo ao Despesify 2, {user.name}!
          </h2>
          <p className="font-body text-sm text-on-surface-variant mt-3 px-4">
            Para personalizar sua experiência, escolha o plano que melhor
            representa seus objetivos. Esta escolha poderá ser alterada
            posteriormente nas configurações de sua conta.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            return (
              <button
                key={plan.key}
                onClick={() => handlePlanSelect(plan.key)}
                className={`text-left bg-white dark:bg-inverse-surface/5 border rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative group shadow-sm hover:shadow-md ${
                  isSelected
                    ? "border-primary ring-2 ring-primary scale-[1.02] bg-primary-container/5 dark:bg-primary-container/10"
                    : "border-outline-variant/40 hover:border-primary-fixed-dim"
                }`}
              >
                {/* Active check indicator */}
                {isSelected && (
                  <span className="absolute top-4 right-4 bg-primary text-on-primary rounded-full p-0.5 flex items-center justify-center animate-scaleIn">
                    <span className="material-symbols-outlined text-[18px]">
                      check
                    </span>
                  </span>
                )}

                <div>
                  {/* Plan Icon and Badge */}
                  <div className="flex justify-between items-start mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center shadow-sm`}
                    >
                      <span className="material-symbols-outlined text-[28px]">
                        {plan.icon}
                      </span>
                    </div>
                    <span className="font-label text-[10px] font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full uppercase">
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className="font-title text-xl font-bold text-on-surface mb-2">
                    {plan.title}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant mb-6 leading-relaxed">
                    {plan.ideal}
                  </p>

                  {/* Indicado Para */}
                  <div className="mb-6">
                    <h4 className="font-label text-xs font-bold text-on-surface uppercase tracking-wider mb-2 border-b border-outline-variant/20 pb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        campaign
                      </span>
                      Indicado para:
                    </h4>
                    <ul className="space-y-1.5">
                      {plan.indications.map((ind, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-xs font-label text-on-surface-variant"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefícios */}
                  <div>
                    <h4 className="font-label text-xs font-bold text-on-surface uppercase tracking-wider mb-2 border-b border-outline-variant/20 pb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        done_all
                      </span>
                      Benefícios inclusos:
                    </h4>
                    <ul className="space-y-2">
                      {plan.benefits.map((ben, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs font-label text-on-surface"
                        >
                          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">
                            check_circle
                          </span>
                          <span className="leading-tight">{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-outline-variant/20 w-full text-center">
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-label text-xs font-bold transition-colors w-full ${
                      isSelected
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface group-hover:bg-primary-fixed-dim"
                    }`}
                  >
                    {isSelected ? "Plano Selecionado" : "Selecionar Plano"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleConfirmPlan}
            disabled={!selectedPlan || isSubmitting}
            className="px-10 py-4 bg-primary text-on-primary font-label font-bold text-sm rounded-xl shadow-lg hover:bg-primary/95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              <>
                Finalizar Escolha e Acessar Dashboard
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </>
            )}
          </button>
          <p className="font-label text-[10px] text-on-surface-variant opacity-60 mt-3">
            Você pode alterar seu plano a qualquer momento na aba de
            Configurações do seu perfil.
          </p>
        </div>
      </div>
    </div>
  );
}
