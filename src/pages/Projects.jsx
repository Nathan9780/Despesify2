// -- Project -- //

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
export function Projects() {
  // Dados mockados
  const initialProjects = [
    {
      id: 1,
      name: "Reforma da Casa",
      category: "Construção",
      budget: 50000,
      spent: 20000,
      progress: 60,
      visibility: "private",
      tasks: 12,
      team: 4,
      materials: 38,
      date: "2025-01-15",
    },
    {
      id: 2,
      name: "Ampliação da Empresa",
      category: "Empresarial",
      budget: 250000,
      spent: 90000,
      progress: 40,
      visibility: "public",
      tasks: 24,
      team: 8,
      materials: 55,
      date: "2025-02-20",
    },
    {
      id: 3,
      name: "Loft Distrito Histórico",
      category: "Renovação",
      budget: 120000,
      spent: 38000,
      progress: 32,
      visibility: "public",
      tasks: 18,
      team: 6,
      materials: 42,
      date: "2025-03-10",
    },
    {
      id: 4,
      name: "Cobertura Duplex",
      category: "Construção",
      budget: 180000,
      spent: 72000,
      progress: 55,
      visibility: "private",
      tasks: 20,
      team: 5,
      materials: 30,
      date: "2025-01-28",
    },
    {
      id: 5,
      name: "Jardim Vertical",
      category: "Paisagismo",
      budget: 30000,
      spent: 12000,
      progress: 80,
      visibility: "public",
      tasks: 8,
      team: 2,
      materials: 15,
      date: "2025-03-05",
    },
  ];

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [visibilityFilter, setVisibilityFilter] = useState("Todos");
  const [budgetFilter, setBudgetFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("data");

  // Obter categorias únicas para o filtro
  const categories = [
    "Todas",
    ...new Set(initialProjects.map((p) => p.category)),
  ];

  // Aplicar filtros
  const filteredProjects = initialProjects
    .filter((p) => {
      // Busca por nome
      if (
        searchTerm &&
        !p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      if (budgetFilter === "Abaixo de 50k" && p.budget >= 50000) return false;
      if (
        budgetFilter === "50k - 100k" &&
        (p.budget < 50000 || p.budget > 100000)
      )
        return false;
      if (
        budgetFilter === "100k - 200k" &&
        (p.budget < 100000 || p.budget > 200000)
      )
        return false;
      if (budgetFilter === "Acima de 200k" && p.budget <= 200000) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "data") return new Date(b.date) - new Date(a.date);
      if (sortBy === "nome") return a.name.localeCompare(b.name);
      if (sortBy === "orcamento") return b.budget - a.budget;
      if (sortBy === "progresso") return b.progress - a.progress;
      return 0;
    });

  // Estatísticas para o gráfico resumido
  const totalBudget = initialProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = initialProjects.reduce((sum, p) => sum + p.spent, 0);
  const totalProjects = initialProjects.length;
  const avgProgress = Math.round(
    initialProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects,
  );

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
        <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-3 sm:mt-0">
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
          {initialProjects.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center flex-1 min-w-[40px]"
            >
              <div className="relative w-full flex justify-center">
                <div
                  className="w-6 bg-blue-500 rounded-t transition-all duration-500"
                  style={{
                    height: `${(p.budget / 300000) * 100}%`,
                    minHeight: "4px",
                  }}
                  title={`${p.name}: R$ ${p.budget.toLocaleString()}`}
                ></div>
                <div
                  className="w-6 bg-green-400 rounded-t absolute bottom-0 transition-all duration-500"
                  style={{
                    height: `${(p.spent / 300000) * 100}%`,
                    minHeight: "4px",
                  }}
                ></div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[50px]">
                {p.name.slice(0, 8)}
              </span>
            </div>
          ))}
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
                <p className="text-sm text-white/80">{project.category}</p>
              </div>

              <div className="p-4">
                {/* Dados financeiros */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orçamento</span>
                    <span className="font-medium">
                      R$ {project.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gasto</span>
                    <span className="font-medium">
                      R$ {project.spent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Saldo</span>
                    <span className="font-medium text-green-600">
                      R$ {(project.budget - project.spent).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progresso */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progresso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Estatísticas rápidas */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="bg-gray-50 rounded-lg py-1">
                    <p className="font-bold text-gray-800">{project.tasks}</p>
                    <span className="text-gray-500">Tarefas</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1">
                    <p className="font-bold text-gray-800">{project.team}</p>
                    <span className="text-gray-500">Equipe</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1">
                    <p className="font-bold text-gray-800">
                      {project.materials}
                    </p>
                    <span className="text-gray-500">Materiais</span>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                    Abrir
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    ✏️
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    📊
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
