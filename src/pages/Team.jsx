import React, { useState, useMemo } from "react";
import { useEmployees } from "../hooks/useEmployees";

export function Team() {
  // Dados reais do Supabase
  const {
    employees,
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    payEmployee,
    deleteEmployee,
  } = useEmployees();

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estado do formulário de adição/edição
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "Construção",
    salary: "",
    startDate: "",
    phone: "",
    email: "",
    type: "employee",
    workDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  });

  // Obter funções únicas para o filtro
  const roles = useMemo(() => {
    if (!employees) return ["Todos"];
    return ["Todos", ...new Set(employees.map((m) => m.role).filter(Boolean))];
  }, [employees]);

  // Aplicar filtros
  const filteredMembers = useMemo(() => {
    if (!employees) return [];
    return employees.filter((m) => {
      if (searchTerm && !m.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      if (roleFilter !== "Todos" && m.role !== roleFilter) return false;
      if (statusFilter !== "Todos" && m.status !== statusFilter) return false;
      return true;
    });
  }, [employees, searchTerm, roleFilter, statusFilter]);

  // Estatísticas calculadas a partir dos dados reais
  const stats = useMemo(() => {
    if (!employees) return { total: 0, paid: 0, pending: 0, overdue: 0, payroll: 0 };
    const total = employees.length;
    const paid = employees.filter((m) => m.status === "paid").length;
    const pending = employees.filter((m) => m.status === "pending").length;
    const overdue = employees.filter((m) => m.status === "overdue").length;
    const payroll = employees.reduce((sum, m) => sum + (m.salary || 0), 0);
    return { total, paid, pending, overdue, payroll };
  }, [employees]);

  // Status labels
  const statusLabels = {
    paid: { label: "Pago", color: "bg-green-100 text-green-700" },
    pending: { label: "Pendente", color: "bg-orange-100 text-orange-700" },
    overdue: { label: "Atrasado", color: "bg-red-100 text-red-700" },
  };

  // Abrir modal para adicionar
  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      category: "Construção",
      salary: "",
      startDate: new Date().toISOString().split("T")[0],
      phone: "",
      email: "",
      type: "employee",
      workDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      role: member.role || "",
      category: member.category || "Construção",
      salary: member.salary?.toString() || "",
      startDate: member.start_date || new Date().toISOString().split("T")[0],
      phone: member.phone || "",
      email: member.email || "",
      type: member.type || "employee",
      workDays: member.work_days || ["Seg", "Ter", "Qua", "Qui", "Sex"],
    });
    setShowModal(true);
  };

  // Salvar (criar ou atualizar)
  const handleSaveMember = async () => {
    setModalError("");
    setIsSaving(true);
    const payload = {
      name: formData.name,
      role: formData.role,
      category: formData.category,
      salary: parseFloat(formData.salary) || 0,
      start_date: formData.startDate,
      phone: formData.phone,
      email: formData.email,
      type: formData.type,
      status: "pending",
    };

    try {
      if (editingMember) {
        await updateEmployee.mutateAsync({ id: editingMember.id, ...payload });
      } else {
        await createEmployee.mutateAsync(payload);
      }
      setShowModal(false);
      setEditingMember(null);
      setModalError("");
    } catch (err) {
      console.error("Erro ao salvar membro:", err);
      setModalError(err?.message || "Erro ao salvar. Verifique os dados e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Pagar funcionário
  const handlePayMember = async (member) => {
    if (window.confirm(`Confirmar pagamento para ${member.name}?`)) {
      await payEmployee.mutateAsync({
        id: member.id,
        lastPayment: new Date().toISOString(),
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  };

  // Excluir funcionário
  const handleDeleteMember = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este membro?")) {
      await deleteEmployee.mutateAsync(id);
      setShowProfile(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando equipe...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-red-400 block">error</span>
          <p className="text-xl font-semibold text-red-600 mt-4">Erro ao carregar equipe</p>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
        .number-glow {
          text-shadow: 0 0 20px rgba(41, 128, 185, 0.15);
        }
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        .profile-sidebar {
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%);
          backdrop-filter: blur(12px);
          color: #f1f5f9;
        }
        .profile-sidebar h2,
        .profile-sidebar h4 { color: #f8fafc; }
        .profile-sidebar p,
        .profile-sidebar span { color: #94a3b8; }
        .profile-sidebar .font-medium,
        .profile-sidebar .font-bold { color: #e2e8f0; }
        .profile-sidebar .border-b { border-color: rgba(255,255,255,0.1); }
        .star-filled { color: #f59e0b; }
        .star-empty { color: #d1d5db; }
      `}</style>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Equipe</h1>
          <p className="text-sm text-gray-500">Gerencie toda a mão de obra dos seus projetos.</p>
        </div>
        <button
          onClick={handleAddMember}
          className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-3 sm:mt-0"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Adicionar Membro
        </button>
      </div>

      {/* Cards de resumo (com dados reais) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up" style={{ animationDelay: "0.10s" }}>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">groups</span>
            Total de Membros
          </p>
          <p className="text-xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Pagos
          </p>
          <p className="text-xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">pending</span>
            Pendentes
          </p>
          <p className="text-xl font-bold text-orange-500">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Folha Mensal
          </p>
          <p className="text-xl font-bold text-blue-600">R$ {stats.payroll.toLocaleString()}</p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
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
            <option key={role} value={role}>{role}</option>
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
        {filteredMembers.length} membro{filteredMembers.length !== 1 ? "s" : ""} encontrado{filteredMembers.length !== 1 ? "s" : ""}
      </p>

      {/* Lista de Membros */}
      {filteredMembers.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">search_off</span>
          <h3 className="text-xl font-semibold text-gray-600 mt-4">Nenhum membro encontrado</h3>
          <p className="text-sm text-gray-500">Tente ajustar os filtros ou adicionar um novo membro.</p>
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
                      {member.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{member.name || "Sem nome"}</h3>
                      <p className="text-sm text-gray-500">{member.role || "Sem cargo"}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[member.status]?.color || "bg-gray-100 text-gray-600"}`}>
                    {statusLabels[member.status]?.label || member.status || "Desconhecido"}
                  </span>
                </div>

                {/* Informações principais */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">💰 Salário</span>
                    <p className="font-medium">R$ {member.salary?.toLocaleString() || "0"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">📅 Início</span>
                    <p className="font-medium">
                      {member.start_date ? new Date(member.start_date).toLocaleDateString("pt-BR") : "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">🗓️ Dias</span>
                    <p className="font-medium text-xs">
                      {member.work_days?.length ? member.work_days.join(", ") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">📱 Contato</span>
                    <p className="font-medium">{member.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">📧 Email</span>
                    <p className="font-medium truncate">{member.email || "N/A"}</p>
                  </div>
                </div>

                {/* Pagamentos (se existirem) */}
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Último pagamento</span>
                    <span className="font-medium">
                      {member.last_payment ? new Date(member.last_payment).toLocaleDateString("pt-BR") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Próximo pagamento</span>
                    <span className="font-medium">
                      {member.next_payment ? new Date(member.next_payment).toLocaleDateString("pt-BR") : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Avaliação e Produtividade (mock - podem vir do banco depois) */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">⭐</span>
                    <span className="font-medium">{member.rating || "—"}</span>
                    <span className="text-gray-400">/ 5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">✅</span>
                    <span className="font-medium">{member.tasks_completed || 0}</span>
                    <span className="text-gray-400">concluídas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">📊</span>
                    <span className="font-medium">{member.efficiency || "—"}%</span>
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
                  <button
                    onClick={() => handleEditMember(member)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handlePayMember(member)}
                    className="px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm text-green-600"
                  >
                    💰
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Adicionar/Editar Membro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4 sm:p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingMember ? "Editar Membro" : "Adicionar Membro"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveMember(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Pedreiro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Construção</option>
                    <option>Elétrica</option>
                    <option>Hidráulica</option>
                    <option>Pintura</option>
                    <option>Administrativo</option>
                    <option>Gerência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salário (R$)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="employee">Funcionário</option>
                    <option value="contractor">Prestador de Serviço</option>
                    <option value="investor">Investidor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dias Trabalhados</label>
                  <div className="flex flex-wrap gap-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(day => (
                      <label key={day} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border cursor-pointer hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={formData.workDays?.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, workDays: [...(formData.workDays || []), day] });
                            } else {
                              setFormData({ ...formData, workDays: (formData.workDays || []).filter(d => d !== day) });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {modalError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ {modalError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {isSaving && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                {isSaving ? "Salvando..." : editingMember ? "Salvar Alterações" : "Adicionar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar de Perfil do Membro */}
      {showProfile && selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-sidebar w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho do perfil */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {selectedMember.name?.split(" ").map(n => n[0]).join("") || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedMember.name || "Sem nome"}</h2>
                  <p className="text-sm text-gray-500">{selectedMember.role || "Sem cargo"}</p>
                </div>
              </div>
              <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Status */}
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusLabels[selectedMember.status]?.color || "bg-gray-100 text-gray-600"}`}>
              {statusLabels[selectedMember.status]?.label || selectedMember.status || "Desconhecido"}
            </div>

            {/* Informações */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-700">Informações Pessoais</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-500">Telefone:</span> {selectedMember.phone || "N/A"}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedMember.email || "N/A"}</p>
                  <p><span className="text-gray-500">Dias Trabalhados:</span> {selectedMember.work_days?.length ? selectedMember.work_days.join(", ") : "N/A"}</p>
                  <p>
                    <span className="text-gray-500">Data de Início:</span>{" "}
                    {selectedMember.start_date ? new Date(selectedMember.start_date).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-500">Tipo:</span>{" "}
                    {selectedMember.type === "employee" ? "Funcionário" :
                      selectedMember.type === "contractor" ? "Prestador" :
                        selectedMember.type === "investor" ? "Investidor" :
                          selectedMember.type === "admin" ? "Administrador" : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-700">Pagamentos</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-500">Salário:</span> R$ {selectedMember.salary?.toLocaleString() || "0"}</p>
                  <p>
                    <span className="text-gray-500">Último pagamento:</span>{" "}
                    {selectedMember.last_payment ? new Date(selectedMember.last_payment).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-500">Próximo pagamento:</span>{" "}
                    {selectedMember.next_payment ? new Date(selectedMember.next_payment).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-700">Avaliação e Produtividade</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Avaliação:</span>
                    <span className="font-medium">{selectedMember.rating || "—"}</span>
                    <span className="text-gray-400">/ 5</span>
                    <span className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(selectedMember.rating || 0) ? "star-filled" : "star-empty"}>
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                  <p><span className="text-gray-500">Tarefas concluídas:</span> {selectedMember.tasks_completed || 0}</p>
                  <p><span className="text-gray-500">Tarefas em andamento:</span> {selectedMember.tasks_in_progress || 0}</p>
                  <p><span className="text-gray-500">Eficiência:</span> {selectedMember.efficiency || "—"}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700">Projetos</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedMember.projects && selectedMember.projects.length > 0 ? (
                    selectedMember.projects.map((p, i) => (
                      <span key={i} className="badge-glow px-3 py-1 rounded-full text-xs font-medium">{p}</span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Nenhum projeto associado</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowProfile(false);
                  handleEditMember(selectedMember);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
              >
                Editar
              </button>
              <button
                onClick={() => handlePayMember(selectedMember)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
              >
                Pagar
              </button>
              <button
                onClick={() => handleDeleteMember(selectedMember.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}