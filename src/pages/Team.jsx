import React, { useState } from "react";

export function Team() {
  // Dados mockados da equipe
  const initialMembers = [
    {
      id: 1,
      name: "João Silva",
      role: "Pedreiro",
      category: "Construção",
      salary: 2500,
      startDate: "2026-06-10",
      phone: "(31) 99999-9999",
      email: "joao@email.com",
      status: "paid", // paid | pending | overdue
      lastPayment: "2026-06-15",
      nextPayment: "2026-07-15",
      rating: 4.8,
      tasksCompleted: 35,
      tasksInProgress: 4,
      efficiency: 92,
      projects: ["Reforma da Casa", "Ampliação da Empresa"],
      type: "employee", // employee | contractor | investor | admin
    },
    {
      id: 2,
      name: "Carlos Souza",
      role: "Eletricista",
      category: "Construção",
      salary: 2200,
      startDate: "2026-05-20",
      phone: "(31) 98888-8888",
      email: "carlos@email.com",
      status: "pending",
      lastPayment: "2026-05-20",
      nextPayment: "2026-06-20",
      rating: 4.5,
      tasksCompleted: 28,
      tasksInProgress: 6,
      efficiency: 85,
      projects: ["Ampliação da Empresa", "Loft Distrito Histórico"],
      type: "contractor",
    },
    {
      id: 3,
      name: "Maria Oliveira",
      role: "Arquiteta",
      category: "Administrativo",
      salary: 4500,
      startDate: "2026-04-01",
      phone: "(31) 97777-7777",
      email: "maria@email.com",
      status: "paid",
      lastPayment: "2026-06-01",
      nextPayment: "2026-07-01",
      rating: 4.9,
      tasksCompleted: 42,
      tasksInProgress: 2,
      efficiency: 95,
      projects: [
        "Reforma da Casa",
        "Loft Distrito Histórico",
        "Cobertura Duplex",
      ],
      type: "employee",
    },
    {
      id: 4,
      name: "Pedro Santos",
      role: "Encanador",
      category: "Construção",
      salary: 2000,
      startDate: "2026-06-05",
      phone: "(31) 96666-6666",
      email: "pedro@email.com",
      status: "pending",
      lastPayment: "2026-06-05",
      nextPayment: "2026-07-05",
      rating: 4.2,
      tasksCompleted: 15,
      tasksInProgress: 8,
      efficiency: 78,
      projects: ["Reforma da Casa"],
      type: "contractor",
    },
    {
      id: 5,
      name: "Ana Costa",
      role: "Mestre de Obras",
      category: "Construção",
      salary: 3200,
      startDate: "2026-03-15",
      phone: "(31) 95555-5555",
      email: "ana@email.com",
      status: "paid",
      lastPayment: "2026-06-15",
      nextPayment: "2026-07-15",
      rating: 4.7,
      tasksCompleted: 50,
      tasksInProgress: 5,
      efficiency: 90,
      projects: ["Ampliação da Empresa", "Cobertura Duplex"],
      type: "employee",
    },
    {
      id: 6,
      name: "Roberto Lima",
      role: "Pintor",
      category: "Construção",
      salary: 1800,
      startDate: "2026-06-12",
      phone: "(31) 94444-4444",
      email: "roberto@email.com",
      status: "overdue",
      lastPayment: "2026-05-12",
      nextPayment: "2026-06-12",
      rating: 4.0,
      tasksCompleted: 10,
      tasksInProgress: 3,
      efficiency: 70,
      projects: ["Reforma da Casa"],
      type: "contractor",
    },
  ];

  // Estados
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Obter funções únicas para o filtro
  const roles = ["Todos", ...new Set(members.map((m) => m.role))];

  // Aplicar filtros
  const filteredMembers = members.filter((m) => {
    if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    if (roleFilter !== "Todos" && m.role !== roleFilter) return false;
    if (statusFilter !== "Todos" && m.status !== statusFilter) return false;
    return true;
  });

  // Estatísticas
  const totalMembers = members.length;
  const paidCount = members.filter((m) => m.status === "paid").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;
  const overdueCount = members.filter((m) => m.status === "overdue").length;
  const totalPayroll = members.reduce((sum, m) => sum + m.salary, 0);

  // Status labels
  const statusLabels = {
    paid: { label: "Pago", color: "bg-green-100 text-green-700" },
    pending: { label: "Pendente", color: "bg-orange-100 text-orange-700" },
    overdue: { label: "Atrasado", color: "bg-red-100 text-red-700" },
  };

  // Modal para adicionar membro (mock)
  const handleAddMember = () => {
    setShowModal(true);
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
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }
        .badge-glow {
          background: rgba(41, 128, 185, 0.12);
          color: #2980B9;
          border: 1px solid rgba(41, 128, 185, 0.25);
          box-shadow: 0 0 16px rgba(41, 128, 185, 0.1);
        }
        .btn-primary-glow {
          transition: all 0.25s ease;
        }
        .btn-primary-glow:hover {
          box-shadow: 0 0 24px rgba(41, 128, 185, 0.4);
          transform: translateY(-1px);
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
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        .profile-sidebar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
        }
        .star-filled {
          color: #f59e0b;
        }
        .star-empty {
          color: #d1d5db;
        }
      `}</style>

      {/* Cabeçalho */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Equipe</h1>
          <p className="text-sm text-gray-500">
            Gerencie toda a mão de obra dos seus projetos.
          </p>
        </div>
        <button
          onClick={handleAddMember}
          className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-3 sm:mt-0"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Adicionar Membro
        </button>
      </div>

      {/* Cards de resumo */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">groups</span>
            Total de Membros
          </p>
          <p className="text-xl font-bold text-gray-800">{totalMembers}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              check_circle
            </span>
            Pagos
          </p>
          <p className="text-xl font-bold text-green-600">{paidCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">pending</span>
            Pendentes
          </p>
          <p className="text-xl font-bold text-orange-500">{pendingCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Folha Mensal
          </p>
          <p className="text-xl font-bold text-blue-600">
            R$ {totalPayroll.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div
        className="flex flex-wrap items-center gap-3 mb-6 animate-fade-up"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Pesquisar funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="Todos">Todos os status</option>
          <option value="paid">✅ Pagos</option>
          <option value="pending">⏳ Pendentes</option>
          <option value="overdue">⚠️ Atrasados</option>
        </select>

        {(searchTerm || roleFilter !== "Todos" || statusFilter !== "Todos") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("Todos");
              setStatusFilter("Todos");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredMembers.length} membro{filteredMembers.length !== 1 ? "s" : ""}{" "}
        encontrado{filteredMembers.length !== 1 ? "s" : ""}
      </p>

      {/* Lista de Membros */}
      {filteredMembers.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">
            search_off
          </span>
          <h3 className="text-xl font-semibold text-gray-600 mt-4">
            Nenhum membro encontrado
          </h3>
          <p className="text-sm text-gray-500">
            Tente ajustar os filtros ou adicionar um novo membro.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="glass-card rounded-xl overflow-hidden hover-lift animate-fade-up"
              style={{ animationDelay: "0.20s" }}
            >
              <div className="p-5">
                {/* Cabeçalho do card */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[member.status].color}`}
                  >
                    {statusLabels[member.status].label}
                  </span>
                </div>

                {/* Informações principais */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">💰 Salário</span>
                    <p className="font-medium">
                      R$ {member.salary.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">📅 Início</span>
                    <p className="font-medium">
                      {new Date(member.startDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">📱 Contato</span>
                    <p className="font-medium">{member.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">📧 Email</span>
                    <p className="font-medium truncate">{member.email}</p>
                  </div>
                </div>

                {/* Pagamentos */}
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Último pagamento</span>
                    <span className="font-medium">
                      {new Date(member.lastPayment).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Próximo pagamento</span>
                    <span className="font-medium">
                      {new Date(member.nextPayment).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Avaliação e Produtividade */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">⭐</span>
                    <span className="font-medium">{member.rating}</span>
                    <span className="text-gray-400">/ 5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">✅</span>
                    <span className="font-medium">{member.tasksCompleted}</span>
                    <span className="text-gray-400">concluídas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">📊</span>
                    <span className="font-medium">{member.efficiency}%</span>
                    <span className="text-gray-400">eficiência</span>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowProfile(true);
                    }}
                    className="flex-1 btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Ver Perfil
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    ✏️
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    💰
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Adicionar Membro */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Adicionar Membro
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Pedreiro</option>
                  <option>Eletricista</option>
                  <option>Encanador</option>
                  <option>Pintor</option>
                  <option>Mestre de Obras</option>
                  <option>Arquiteto</option>
                  <option>Administrativo</option>
                  <option>Gerente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Salário
                </label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Início
                </label>
                <input
                  type="date"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Funcionário</option>
                  <option>Prestador de Serviço</option>
                  <option>Investidor</option>
                  <option>Administrador</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
              >
                Adicionar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar de Perfil do Membro */}
      {showProfile && selectedMember && (
        <div
          className="fixed inset-0 z-50 flex justify-end modal-overlay"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="profile-sidebar w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do perfil */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {selectedMember.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedMember.name}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedMember.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Status */}
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusLabels[selectedMember.status].color}`}
            >
              {statusLabels[selectedMember.status].label}
            </div>

            {/* Informações */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-700">
                  Informações Pessoais
                </h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Telefone:</span>{" "}
                    {selectedMember.phone}
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedMember.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Data de Início:</span>{" "}
                    {new Date(selectedMember.startDate).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">Tipo:</span>{" "}
                    {selectedMember.type === "employee"
                      ? "Funcionário"
                      : selectedMember.type === "contractor"
                        ? "Prestador"
                        : selectedMember.type === "investor"
                          ? "Investidor"
                          : "Administrador"}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-700">Pagamentos</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Salário:</span> R${" "}
                    {selectedMember.salary.toLocaleString()}
                  </p>
                  <p>
                    <span className="text-gray-500">Último pagamento:</span>{" "}
                    {new Date(selectedMember.lastPayment).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">Próximo pagamento:</span>{" "}
                    {new Date(selectedMember.nextPayment).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-700">
                  Avaliação e Produtividade
                </h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Avaliação:</span>
                    <span className="font-medium">{selectedMember.rating}</span>
                    <span className="text-gray-400">/ 5</span>
                    <span className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.floor(selectedMember.rating)
                              ? "star-filled"
                              : "star-empty"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                  <p>
                    <span className="text-gray-500">Tarefas concluídas:</span>{" "}
                    {selectedMember.tasksCompleted}
                  </p>
                  <p>
                    <span className="text-gray-500">Tarefas em andamento:</span>{" "}
                    {selectedMember.tasksInProgress}
                  </p>
                  <p>
                    <span className="text-gray-500">Eficiência:</span>{" "}
                    {selectedMember.efficiency}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700">Projetos</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedMember.projects.map((p, i) => (
                    <span
                      key={i}
                      className="badge-glow px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                Editar
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition">
                Pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
