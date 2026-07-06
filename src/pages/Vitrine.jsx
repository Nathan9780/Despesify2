import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePublicProjects } from "../hooks/usePublicProjects";
import { useInvestments } from "../hooks/useInvestments";
import toast from "react-hot-toast";

export function Vitrine() {
  const { projects, isLoading, error } = usePublicProjects();
  const { invest, balance } = useInvestments();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [investAmount, setInvestAmount] = useState("");

  const handleInvestClick = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const confirmInvest = (e) => {
    e.preventDefault();
    if (!selectedProject || !investAmount) return;
    
    const amount = parseFloat(investAmount);
    const success = invest(selectedProject, amount);
    
    if (success) {
      setShowModal(false);
      setSelectedProject(null);
      setInvestAmount("");
    }
  };

  const categories = useMemo(() => {
    if (!projects) return ["Todas"];
    return [
      "Todas",
      ...new Set(projects.map((p) => p.category).filter(Boolean)),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      if (
        searchTerm &&
        !p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (categoryFilter !== "Todas" && p.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [projects, searchTerm, categoryFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error.message}</p>
          <button onClick={() => window.location.reload()} className="btn-primary px-4 py-2 rounded-lg">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vitrine de Projetos</h1>
          <p className="text-sm text-gray-500">Descubra projetos públicos e encontre oportunidades de investimento.</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Projetos */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-6xl text-gray-300">search_off</span>
          <h3 className="text-xl font-semibold text-gray-600 mt-4">Nenhum projeto encontrado</h3>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">🌎 Público</span>
                </div>
                <p className="text-sm text-white/80">{project.category || "Sem categoria"}</p>
              </div>

              <div className="p-4">
                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orçamento Previsto</span>
                    <span className="font-medium text-gray-800">R$ {project.budget?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Meta de Captação</span>
                    <span className="font-medium text-blue-600">R$ {(project.budget * 0.3 || 0).toLocaleString()} (30%)</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleInvestClick(project)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    Investir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Investimento */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Investir em Projeto</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">{selectedProject.name}</p>
              <p className="text-xs text-blue-600 mt-1">Saldo Disponível: R$ {balance.toLocaleString()}</p>
            </div>

            <form className="space-y-4" onSubmit={confirmInvest}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor do Investimento (R$)</label>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: 5000"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
              >
                Confirmar Investimento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
