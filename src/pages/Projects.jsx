import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";

export function Projects() {
  const navigate = useNavigate();

  // Dados reais do Supabase
  const { projects, isLoading, error, deleteProject, createProject } = useProjects();

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [visibilityFilter, setVisibilityFilter] = useState("Todos");
  const [budgetFilter, setBudgetFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("data");

  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Construção",
    visibility: "private",
    budget: "",
  });

  const handleSaveProject = async () => {
    try {
      await createProject.mutateAsync({
        name: formData.name,
        category: formData.category,
        visibility: formData.visibility,
        budget: parseFloat(formData.budget) || 0,
      });
      setShowModal(false);
      setFormData({ name: "", category: "Construção", visibility: "private", budget: "" });
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
      alert("Erro ao criar o projeto. Verifique os dados e tente novamente.");
    }
  };

  // Obter categorias únicas dos dados reais
  const categories = useMemo(() => {
    if (!projects) return ["Todas"];
    return [
      "Todas",
      ...new Set(projects.map((p) => p.category).filter(Boolean)),
    ];
  }, [projects]);

  // Aplicar filtros e ordenação nos dados reais
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects
      .filter((p) => {
        // Busca por nome
        if (
          searchTerm &&
          !p.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        // Filtro por categoria
        if (categoryFilter !== "Todas" && p.category !== categoryFilter) {
          return false;
        }
        // Filtro por visibilidade
        if (visibilityFilter !== "Todos" && p.visibility !== visibilityFilter) {
          return false;
        }
        // Filtro por orçamento
        const budget = p.budget || 0;
        if (budgetFilter === "Abaixo de 50k" && budget >= 50000) return false;
        if (
          budgetFilter === "50k - 100k" &&
          (budget < 50000 || budget > 100000)
        )
          return false;
        if (
          budgetFilter === "100k - 200k" &&
          (budget < 100000 || budget > 200000)
        )
          return false;
        if (budgetFilter === "Acima de 200k" && budget <= 200000) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "data") {
          return (
            new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
          );
        }
        if (sortBy === "nome")
          return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "orcamento") return (b.budget || 0) - (a.budget || 0);
        if (sortBy === "progresso")
          return (b.progress || 0) - (a.progress || 0);
        return 0;
      });
  }, [
    projects,
    searchTerm,
    categoryFilter,
    visibilityFilter,
    budgetFilter,
    sortBy,
  ]);

  // Estatísticas calculadas a partir dos dados reais
  const totalBudget =
    projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
  const totalSpent = projects?.reduce((sum, p) => sum + (p.spent || 0), 0) || 0;
  const totalProjects = projects?.length || 0;
  const avgProgress =
    totalProjects > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + (p.progress || 0), 0) /
            totalProjects,
        )
      : 0;

  // Verifica se o erro é de autenticação
  const isAuthError =
    error?.message?.includes("JWT") ||
    error?.message?.includes("auth") ||
    error?.message?.includes("session") ||
    error?.message?.includes("undefined");

  // Estado de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  // Estado de erro com tratamento especial para autenticação
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          {isAuthError ? (
            <>
              <span className="material-symbols-outlined text-6xl text-red-400 block">
                lock
              </span>
              <p className="text-xl font-semibold text-red-600 mt-4">
                Sessão expirada
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Sua sessão expirou ou você não está autenticado. Faça login
                novamente para continuar.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Ir para o login
              </button>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-6xl text-red-400 block">
                error
              </span>
              <p className="text-xl font-semibold text-red-600 mt-4">
                Erro ao carregar projetos
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
            </>
          )}
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
      `}</style>

      {/* Cabeçalho */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meus Projetos</h1>
          <p className="text-sm text-gray-500">
            Gerencie todos os seus projetos em um único lugar.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-3 sm:mt-0">
          <span className="material-symbols-outlined text-lg">add</span>
          Novo Projeto
        </button>
      </div>

      {/* Cards de resumo */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              folder_open
            </span>
            Total Projetos
          </p>
          <p className="text-xl font-bold text-gray-800">{totalProjects}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              account_balance_wallet
            </span>
            Orçamento Total
          </p>
          <p className="text-xl font-bold text-blue-600">
            R$ {totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Gastos Totais
          </p>
          <p className="text-xl font-bold text-gray-800">
            R$ {totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            Progresso Médio
          </p>
          <p className="text-xl font-bold text-green-600">{avgProgress}%</p>
        </div>
      </div>

      {/* Gráfico resumido (barras) */}
      <div
        className="glass-card rounded-xl p-5 mb-6 animate-fade-up"
        style={{ animationDelay: "0.15s" }}
      >
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-blue-600">
            bar_chart
          </span>
          Resumo por Projeto
        </h3>
        <div className="flex items-end gap-4 h-32 overflow-x-auto">
          {projects && projects.length > 0 ? (
            projects.slice(0, 10).map((p) => {
              const maxBudget = Math.max(
                ...projects.map((pr) => pr.budget || 0),
                1,
              );
              const budgetHeight = ((p.budget || 0) / maxBudget) * 100;
              const spentHeight = ((p.spent || 0) / maxBudget) * 100;
              return (
                <div
                  key={p.id}
                  className="flex flex-col items-center flex-1 min-w-[40px]"
                >
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-6 bg-blue-500 rounded-t transition-all duration-500"
                      style={{
                        height: `${Math.min(budgetHeight, 100)}%`,
                        minHeight: "4px",
                      }}
                      title={`${p.name}: R$ ${p.budget?.toLocaleString()}`}
                    ></div>
                    <div
                      className="w-6 bg-green-400 rounded-t absolute bottom-0 transition-all duration-500"
                      style={{
                        height: `${Math.min(spentHeight, 100)}%`,
                        minHeight: "4px",
                      }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[50px]">
                    {p.name?.slice(0, 8) || "Projeto"}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center text-gray-400 py-8">
              Nenhum projeto para exibir no gráfico.
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded"></span> Orçamento
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-400 rounded"></span> Gasto
          </span>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div
        className="flex flex-wrap items-center gap-3 mb-6 animate-fade-up"
        style={{ animationDelay: "0.20s" }}
      >
        {/* Busca */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Filtro por Categoria */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Filtro por Visibilidade */}
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="Todos">Todos</option>
          <option value="public">🌎 Público</option>
          <option value="private">🔒 Privado</option>
        </select>

        {/* Filtro por Orçamento */}
        <select
          value={budgetFilter}
          onChange={(e) => setBudgetFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="Todos">Todos os orçamentos</option>
          <option value="Abaixo de 50k">Abaixo de R$ 50k</option>
          <option value="50k - 100k">R$ 50k – 100k</option>
          <option value="100k - 200k">R$ 100k – 200k</option>
          <option value="Acima de 200k">Acima de R$ 200k</option>
        </select>

        {/* Ordenação */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="data">📅 Data (recentes)</option>
          <option value="nome">🔤 Nome</option>
          <option value="orcamento">💰 Maior orçamento</option>
          <option value="progresso">📊 Progresso</option>
        </select>

        {/* Limpar filtros */}
        {(searchTerm ||
          categoryFilter !== "Todas" ||
          visibilityFilter !== "Todos" ||
          budgetFilter !== "Todos") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("Todas");
              setVisibilityFilter("Todos");
              setBudgetFilter("Todos");
              setSortBy("data");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Resultado: Número de projetos encontrados */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredProjects.length} projeto
        {filteredProjects.length !== 1 ? "s" : ""} encontrado
        {filteredProjects.length !== 1 ? "s" : ""}
      </p>

      {/* Lista de Projetos */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">
            search_off
          </span>
          <h3 className="text-xl font-semibold text-gray-600 mt-4">
            Nenhum projeto encontrado
          </h3>
          <p className="text-sm text-gray-500">
            Tente ajustar os filtros ou criar um novo projeto.
          </p>
          <button onClick={() => setShowModal(true)} className="mt-4 btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Criar Projeto
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass-card rounded-xl overflow-hidden hover-lift animate-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              {/* Header do card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white text-lg">
                    {project.name}
                  </h3>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${project.visibility === "public" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}
                  >
                    {project.visibility === "public"
                      ? "🌎 Público"
                      : "🔒 Privado"}
                  </span>
                </div>
                <p className="text-sm text-white/80">
                  {project.category || "Sem categoria"}
                </p>
              </div>

              <div className="p-4">
                {/* Dados financeiros */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orçamento</span>
                    <span className="font-medium">
                      R$ {project.budget?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gasto</span>
                    <span className="font-medium">
                      R$ {project.spent?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Saldo</span>
                    <span className="font-medium text-green-600">
                      R${" "}
                      {(
                        (project.budget || 0) - (project.spent || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progresso */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progresso</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Estatísticas rápidas (mockadas, podem ser substituídas por dados reais) */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="bg-gray-50 rounded-lg py-1">
                    <p className="font-bold text-gray-800">
                      {project.tasks || 0}
                    </p>
                    <span className="text-gray-500">Tarefas</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1">
                    <p className="font-bold text-gray-800">
                      {project.team || 0}
                    </p>
                    <span className="text-gray-500">Equipe</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1">
                    <p className="font-bold text-gray-800">
                      {project.materials || 0}
                    </p>
                    <span className="text-gray-500">Materiais</span>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 mt-4">
                  <Link to={`/projects/${project.id}`} className="flex-1">
                    <button className="w-full btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                      Abrir
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Tem certeza que deseja excluir o projeto "${project.name}"?`,
                        )
                      ) {
                        deleteProject.mutate(project.id);
                      }
                    }}
                    className="px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Novo Projeto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Novo Projeto</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProject(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Reforma Residencial"
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
                  <option>Reforma</option>
                  <option>Consultoria</option>
                  <option>Design de Interiores</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Orçamento Previsto (R$)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibilidade</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="private">🔒 Privado</option>
                  <option value="public">🌎 Público</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
              >
                Criar Projeto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
