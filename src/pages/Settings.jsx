import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
export function Settings() {
  // Estado das abas
  const [activeTab, setActiveTab] = useState("perfil");

  const currentUserStr = localStorage.getItem("currentUser");
  const storedUser = currentUserStr ? JSON.parse(currentUserStr) : {};

  // Dados do usuário
  const [user, setUser] = useState({
    id: storedUser.id || null,
    name: storedUser.name || "Nathan Silva",
    email: storedUser.email || "nathan@despesify.com",
    phone: "(31) 99999-9999",
    bio: "CEO e fundador do Despesify 2",
    avatar: storedUser.name ? storedUser.name.substring(0, 2).toUpperCase() : "NS",
    type: storedUser.plan === "enterprise" ? "enterprise" : storedUser.plan === "investor" ? "investor" : "individual",
    plan: storedUser.plan || "citizen",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
        if (data) {
          setUser(prev => ({
            ...prev,
            id: data.id,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            bio: data.bio || prev.bio,
            avatar: data.avatar_url || data.name?.substring(0, 2).toUpperCase() || prev.avatar,
            plan: data.plan || prev.plan,
            type: data.plan === "enterprise" ? "enterprise" : data.plan === "investor" ? "investor" : "individual",
          }));
        }
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async () => {
    if (!user.id) return toast.error("Autenticação não encontrada no Supabase (usando modo local)");
    
    const { error } = await supabase.from('profiles').update({
      name: user.name,
      phone: user.phone,
      bio: user.bio
    }).eq('id', user.id);

    if (error) {
      toast.error("Erro ao atualizar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  const changePlan = async (newPlanId) => {
    setUser({ ...user, plan: newPlanId });
    if (currentUserStr) {
      const u = JSON.parse(currentUserStr);
      u.plan = newPlanId;
      localStorage.setItem("currentUser", JSON.stringify(u));
    } else {
      localStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email, plan: newPlanId }));
    }
    
    if (user.id) {
       await supabase.from('profiles').update({ plan: newPlanId }).eq('id', user.id);
    }
    
    toast.success("Plano atualizado com sucesso! Redirecionando...", { duration: 2000 });
    setTimeout(() => {
        window.location.href = "/dashboard";
    }, 800);
  };

  // Configurações
  const [settings, setSettings] = useState({
    currency: "BRL",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    supplierRadius: 10,
    theme: "light", // light | dark | system
    primaryColor: "blue", // blue | green | purple
    payrollDate: 5,
    defaultPaymentMethod: "bank_transfer",
    costCenter: "Construção",
    projectPublic: true,
    fundingGoal: 500000,
    notifications: {
      newInvestors: true,
      newMessages: true,
      pendingPayments: true,
      lowStock: true,
      newProposals: true,
    },
    permissions: {
      createTasks: true,
      editMaterials: false,
      viewFinancials: true,
      chatWithInvestors: false,
    },
    integrations: {
      googleMaps: true,
      googleLogin: true,
      googleDrive: false,
      whatsapp: false,
    },
  });

  // Tabs disponíveis
  const tabs = [
    { id: "perfil", label: "Perfil", icon: "person" },
    { id: "conta", label: "Tipo de Conta", icon: "badge" },
    { id: "plano", label: "Plano e Assinatura", icon: "credit_card" },
    { id: "preferencias", label: "Preferências", icon: "settings" },
    { id: "notificacoes", label: "Notificações", icon: "notifications" },
    { id: "financeiro", label: "Financeiro", icon: "payments" },
    { id: "equipe", label: "Equipe", icon: "groups" },
    { id: "investidores", label: "Investidores", icon: "payments" },
    { id: "exportacao", label: "Exportação", icon: "file_download" },
    { id: "integracoes", label: "Integrações", icon: "link" },
    { id: "seguranca", label: "Segurança", icon: "security" },
    { id: "aparencia", label: "Aparência", icon: "palette" },
    { id: "perigo", label: "Zona de Perigo", icon: "warning" },
  ];

  // Handlers para toggles
  const toggleNotification = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const togglePermission = (key) => {
    setSettings({
      ...settings,
      permissions: {
        ...settings.permissions,
        [key]: !settings.permissions[key],
      },
    });
  };

  const toggleIntegration = (key) => {
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        [key]: !settings.integrations[key],
      },
    });
  };

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
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }
        .badge-glow {
          background: rgba(41, 128, 185, 0.12);
          color: #2980B9;
          border: 1px solid rgba(41, 128, 185, 0.25);
          box-shadow: 0 0 16px rgba(41, 128, 185, 0.1);
        }
        .badge-glow-success {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.25);
          box-shadow: 0 0 16px rgba(34, 197, 94, 0.1);
        }
        .badge-glow-danger {
          background: rgba(220, 38, 38, 0.12);
          color: #dc2626;
          border: 1px solid rgba(220, 38, 38, 0.25);
          box-shadow: 0 0 16px rgba(220, 38, 38, 0.1);
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
        .tab-active {
          background: rgba(41, 128, 185, 0.08);
          color: #2980B9;
          border-right: 3px solid #2980B9;
        }
        .toggle-switch {
          width: 44px;
          height: 24px;
          background: #d1d5db;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: background 0.3s ease;
          flex-shrink: 0;
        }
        .toggle-switch.active {
          background: #2980B9;
        }
        .toggle-switch .toggle-knob {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle-switch.active .toggle-knob {
          transform: translateX(20px);
        }
        .sidebar-tab {
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 10px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #4b5563;
        }
        .sidebar-tab:hover {
          background: rgba(41, 128, 185, 0.05);
          color: #1f2937;
        }
        .sidebar-tab.active {
          background: rgba(41, 128, 185, 0.08);
          color: #2980B9;
          font-weight: 500;
        }
        .sidebar-tab .material-symbols-outlined {
          font-size: 20px;
        }
        .danger-zone {
          border: 1px solid rgba(220, 38, 38, 0.2);
          background: rgba(220, 38, 38, 0.03);
        }
      `}</style>

      {/* Cabeçalho */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
          <p className="text-sm text-gray-500">
            Gerencie suas preferências e configurações do sistema.
          </p>
        </div>
        <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium mt-3 sm:mt-0">
          Salvar Alterações
        </button>
      </div>

      {/* Layout principal: sidebar + conteúdo */}
      <div
        className="glass-card rounded-2xl overflow-hidden animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Sidebar de abas */}
          <div className="w-full md:w-64 lg:w-72 bg-white/30 backdrop-blur-sm p-4 border-b md:border-b-0 md:border-r border-gray-200/50 overflow-y-auto scrollbar-hide">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conteúdo da aba ativa */}
          <div className="flex-1 p-6 bg-white/20 backdrop-blur-sm overflow-y-auto max-h-[70vh]">
            {/* ===== PERFIL ===== */}
            {activeTab === "perfil" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">Perfil</h2>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Alterar Foto
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou GIF. Máx 2MB.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={user.phone}
                      onChange={(e) => setUser({...user, phone: e.target.value})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <input
                      type="text"
                      value={user.bio}
                      onChange={(e) => setUser({...user, bio: e.target.value})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    />
                  </div>
                </div>
                <button onClick={handleUpdateProfile} className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Atualizar Perfil
                </button>
              </div>
            )}

            {/* ===== TIPO DE CONTA ===== */}
            {activeTab === "conta" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Tipo de Conta
                </h2>
                <p className="text-sm text-gray-500">
                  Selecione o perfil que melhor descreve seu uso.
                </p>
                <div className="space-y-3">
                  {[
                    {
                      id: "individual",
                      label: "Pessoa Física",
                      desc: "Controle de projetos pessoais e reformas.",
                    },
                    {
                      id: "enterprise",
                      label: "Empresa",
                      desc: "Gestão completa para construtoras e empresas.",
                    },
                    {
                      id: "investor",
                      label: "Investidor",
                      desc: "Acesso à vitrine de projetos e oportunidades.",
                    },
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setUser({ ...user, type: option.id })}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                        user.type === option.id
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${user.type === option.id ? "border-blue-500" : "border-gray-300"}`}
                      >
                        {user.type === option.id && (
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Salvar Tipo
                </button>
              </div>
            )}

            {/* ===== PLANO E ASSINATURA ===== */}
            {activeTab === "plano" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Plano e Assinatura
                </h2>
                <div className="glass-card rounded-xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Plano Atual</p>
                      <p className="text-2xl font-bold text-blue-600 capitalize">
                        {user.plan}
                      </p>
                    </div>
                    <span className="badge-glow-success px-3 py-1 rounded-full text-xs font-medium">
                      Ativo
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/50 rounded p-3 text-center">
                      <p className="text-gray-500">Projetos</p>
                      <p className="font-bold text-gray-800">5 / ilimitado</p>
                    </div>
                    <div className="bg-white/50 rounded p-3 text-center">
                      <p className="text-gray-500">Armazenamento</p>
                      <p className="font-bold text-gray-800">2 GB / 10 GB</p>
                    </div>
                    <div className="bg-white/50 rounded p-3 text-center">
                      <p className="text-gray-500">Usuários</p>
                      <p className="font-bold text-gray-800">1 / 5</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "investor",
                      name: "Investidor",
                      price: "R$ 0",
                      features: ["Acesso à Vitrine", "Visualização de Projetos", "Painel Exclusivo"],
                    },
                    {
                      id: "citizen",
                      name: "Cidadão (Pessoal)",
                      price: "R$ 29,90/mês",
                      features: [
                        "Dashboard e Relatórios",
                        "Gerenciamento de Projetos",
                        "Gestão de Equipe e Materiais",
                      ],
                    },
                    {
                      id: "enterprise",
                      name: "Empresarial",
                      price: "Sob consulta",
                      features: ["Tudo do Cidadão", "Tarefas em Kanban", "Módulo Fornecedores"],
                    },
                  ].map((plan) => (
                    <div
                      key={plan.id}
                      className={`glass-card rounded-xl p-4 text-center hover-lift ${user.plan === plan.id ? "border-2 border-blue-500" : ""}`}
                    >
                      <h4 className="font-bold text-gray-800">{plan.name}</h4>
                      <p className="text-lg font-bold text-blue-600">
                        {plan.price}
                      </p>
                      <ul className="mt-2 text-xs text-gray-500 space-y-1">
                        {plan.features.map((f, i) => (
                          <li key={i}>✓ {f}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => changePlan(plan.id)}
                        className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition ${user.plan === plan.id ? "bg-blue-100 text-blue-600 cursor-default" : "btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white"}`}
                      >
                        {user.plan === plan.id
                          ? "Atual"
                          : "Selecionar"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PREFERÊNCIAS ===== */}
            {activeTab === "preferencias" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Preferências
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Moeda
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) =>
                        setSettings({ ...settings, currency: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    >
                      <option value="BRL">R$ Real Brasileiro</option>
                      <option value="USD">$ Dólar Americano</option>
                      <option value="EUR">€ Euro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Idioma
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        setSettings({ ...settings, language: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fuso Horário
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        setSettings({ ...settings, timezone: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    >
                      <option value="America/Sao_Paulo">
                        Brasília (GMT-3)
                      </option>
                      <option value="America/New_York">
                        Nova York (GMT-4)
                      </option>
                      <option value="Europe/London">Londres (GMT+1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Raio de busca de fornecedores
                    </label>
                    <select
                      value={settings.supplierRadius}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          supplierRadius: parseInt(e.target.value),
                        })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Salvar Preferências
                </button>
              </div>
            )}

            {/* ===== NOTIFICAÇÕES ===== */}
            {activeTab === "notificacoes" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Notificações
                </h2>
                <p className="text-sm text-gray-500">
                  Gerencie quais notificações você deseja receber.
                </p>
                <div className="space-y-3">
                  {Object.entries(settings.notifications).map(
                    ([key, value]) => {
                      const labels = {
                        newInvestors: "Novos Investidores",
                        newMessages: "Novas Mensagens",
                        pendingPayments: "Pagamentos Pendentes",
                        lowStock: "Estoque Baixo",
                        newProposals: "Novas Propostas",
                      };
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 bg-white/50 rounded-xl"
                        >
                          <span className="text-sm text-gray-700">
                            {labels[key]}
                          </span>
                          <div
                            className={`toggle-switch ${value ? "active" : ""}`}
                            onClick={() => toggleNotification(key)}
                          >
                            <div className="toggle-knob"></div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* ===== FINANCEIRO ===== */}
            {activeTab === "financeiro" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Configurações Financeiras
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Salário Padrão
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Forma de Pagamento Padrão
                    </label>
                    <select
                      value={settings.defaultPaymentMethod}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultPaymentMethod: e.target.value,
                        })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    >
                      <option value="bank_transfer">
                        Transferência Bancária
                      </option>
                      <option value="pix">PIX</option>
                      <option value="credit_card">Cartão de Crédito</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data de Fechamento
                    </label>
                    <input
                      type="number"
                      value={settings.payrollDate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payrollDate: parseInt(e.target.value),
                        })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                      min={1}
                      max={31}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Centro de Custo
                    </label>
                    <input
                      type="text"
                      value={settings.costCenter}
                      onChange={(e) =>
                        setSettings({ ...settings, costCenter: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    />
                  </div>
                </div>
                <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Salvar Financeiro
                </button>
              </div>
            )}

            {/* ===== EQUIPE ===== */}
            {activeTab === "equipe" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Configuração de Equipe
                </h2>
                <p className="text-sm text-gray-500">
                  Permissões dos membros da equipe.
                </p>
                <div className="space-y-3">
                  {Object.entries(settings.permissions).map(([key, value]) => {
                    const labels = {
                      createTasks: "Criar tarefas",
                      editMaterials: "Editar materiais",
                      viewFinancials: "Visualizar financeiro",
                      chatWithInvestors: "Conversar com investidores",
                    };
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-xl"
                      >
                        <span className="text-sm text-gray-700">
                          {labels[key]}
                        </span>
                        <div
                          className={`toggle-switch ${value ? "active" : ""}`}
                          onClick={() => togglePermission(key)}
                        >
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Salvar Permissões
                </button>
              </div>
            )}

            {/* ===== INVESTIDORES ===== */}
            {activeTab === "investidores" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Configurações de Investidores
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                    <span className="text-sm text-gray-700">
                      Projeto Público (visível na vitrine)
                    </span>
                    <div
                      className={`toggle-switch ${settings.projectPublic ? "active" : ""}`}
                      onClick={() =>
                        setSettings({
                          ...settings,
                          projectPublic: !settings.projectPublic,
                        })
                      }
                    >
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Meta de Captação (R$)
                    </label>
                    <input
                      type="number"
                      value={settings.fundingGoal}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          fundingGoal: parseInt(e.target.value),
                        })
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                    />
                  </div>
                </div>
                <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Salvar Configurações
                </button>
              </div>
            )}

            {/* ===== EXPORTAÇÃO ===== */}
            {activeTab === "exportacao" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">
                  Exportação de Dados
                </h2>
                <p className="text-sm text-gray-500">
                  Exporte relatórios e dados do sistema.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "PDF",
                      icon: "picture_as_pdf",
                      color: "text-red-500",
                    },
                    {
                      name: "Excel",
                      icon: "table_chart",
                      color: "text-green-600",
                    },
                    { name: "CSV", icon: "data_table", color: "text-blue-600" },
                  ].map((fmt) => (
                    <button
                      key={fmt.name}
                      className="glass-card rounded-xl p-4 text-center hover-lift"
                    >
                      <span
                        className={`material-symbols-outlined text-3xl ${fmt.color}`}
                      >
                        {fmt.icon}
                      </span>
                      <p className="font-medium text-gray-800 mt-2">
                        {fmt.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Exportar relatório
                      </p>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Período
                  </label>
                  <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80">
                    <option>Últimos 30 dias</option>
                    <option>Últimos 90 dias</option>
                    <option>Último ano</option>
                    <option>Personalizado</option>
                  </select>
                </div>
                <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Exportar
                </button>
              </div>
            )}

            {/* ===== INTEGRAÇÕES ===== */}
            {activeTab === "integracoes" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">Integrações</h2>
                <p className="text-sm text-gray-500">
                  Conecte o Despesify com outras ferramentas.
                </p>
                <div className="space-y-3">
                  {Object.entries(settings.integrations).map(([key, value]) => {
                    const labels = {
                      googleMaps: "Google Maps",
                      googleLogin: "Google Login",
                      googleDrive: "Google Drive",
                      whatsapp: "WhatsApp Business",
                    };
                    const icons = {
                      googleMaps: "map",
                      googleLogin: "login",
                      googleDrive: "drive_folder_upload",
                      whatsapp: "chat",
                    };
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-blue-600">
                            {icons[key]}
                          </span>
                          <span className="text-sm text-gray-700">
                            {labels[key]}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${value ? "badge-glow-success" : "badge-glow-danger"}`}
                          >
                            {value ? "🟢 Conectado" : "🔴 Desconectado"}
                          </span>
                        </div>
                        <div
                          className={`toggle-switch ${value ? "active" : ""}`}
                          onClick={() => toggleIntegration(key)}
                        >
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== SEGURANÇA ===== */}
            {activeTab === "seguranca" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">Segurança</h2>
                <div>
                  <h3 className="font-semibold text-gray-700">Alterar Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
                      />
                    </div>
                  </div>
                  <button className="mt-3 btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Atualizar Senha
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Autenticação de Dois Fatores (2FA)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Adicione uma camada extra de segurança.
                      </p>
                    </div>
                    <div
                      className={`toggle-switch active`}
                      onClick={() => alert("2FA será ativado!")}
                    >
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">
                    Sessões Ativas
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Dispositivo Atual
                        </p>
                        <p className="text-xs text-gray-500">
                          Chrome • São Paulo • Agora
                        </p>
                      </div>
                      <span className="badge-glow-success text-xs px-2 py-0.5 rounded-full">
                        Ativa
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                      <div>
                        <p className="text-sm text-gray-700">
                          Firefox • Rio de Janeiro
                        </p>
                        <p className="text-xs text-gray-400">
                          Último acesso: 20/06/2026
                        </p>
                      </div>
                      <button className="text-xs text-red-500 hover:underline">
                        Encerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== APARÊNCIA ===== */}
            {activeTab === "aparencia" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-gray-800">Aparência</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tema
                  </label>
                  <div className="flex gap-4 mt-2">
                    {["light", "dark", "system"].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSettings({ ...settings, theme })}
                        className={`px-4 py-2 rounded-lg border-2 transition ${settings.theme === theme ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"}`}
                      >
                        {theme === "light" && "☀️ Claro"}
                        {theme === "dark" && "🌙 Escuro"}
                        {theme === "system" && "💻 Sistema"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cor Primária
                  </label>
                  <div className="flex gap-4 mt-2">
                    {["blue", "green", "purple"].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setSettings({ ...settings, primaryColor: color })
                        }
                        className={`w-10 h-10 rounded-full border-2 ${settings.primaryColor === color ? "border-gray-800" : "border-gray-300"}`}
                        style={{
                          background:
                            color === "blue"
                              ? "#2980B9"
                              : color === "green"
                                ? "#22c55e"
                                : "#8b5cf6",
                        }}
                      ></button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Salvar Aparência
                </button>
              </div>
            )}

            {/* ===== ZONA DE PERIGO ===== */}
            {activeTab === "perigo" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-xl font-bold text-red-600">
                  Zona de Perigo
                </h2>
                <div className="danger-zone rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800">Excluir Conta</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Esta ação é irreversível. Todos os seus dados serão
                    permanentemente removidos.
                  </p>
                  <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition">
                    Excluir Minha Conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
