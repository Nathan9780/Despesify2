import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePublicProjects } from "../hooks/usePublicProjects";
import { useInvestments } from "../hooks/useInvestments";
import { useInvitations } from "../hooks/useInvitations";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export function Vitrine() {
  const [currentUser, setCurrentUser] = useState(null);
  const [publicInvestors, setPublicInvestors] = useState([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);
  
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      if (user.plan === "enterprise") {
        setLoadingInvestors(true);
        // Busca perfis de investidores (assumindo que todos os investidores são públicos na vitrine por enquanto)
        supabase.from("profiles").select("id, name, email, plan").eq("plan", "investor")
          .then(({ data, error }) => {
            if (!error && data) setPublicInvestors(data);
            setLoadingInvestors(false);
          });
      }
    }
  }, []);

  const isEnterprise = currentUser?.plan === "enterprise";

  const { projects, isLoading: loadingProjects, error } = usePublicProjects();
  const { invest, balance } = useInvestments();
  const { sendInvitation } = useInvitations();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [locationFilter, setLocationFilter] = useState("");
  const [minReturnFilter, setMinReturnFilter] = useState("");
  const [maxRiskFilter, setMaxRiskFilter] = useState("");

  const [compareIds, setCompareIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [investAmount, setInvestAmount] = useState("");

  const handleInvestClick = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleInviteClick = (investor) => {
    // Empresa convida investidor pela vitrine
    sendInvitation.mutate({
      receiver_email: investor.email,
      message: "Olá, vi seu perfil na vitrine e gostaria de convidá-lo para ser um investidor de nossos projetos.",
      sender_role: "enterprise"
    }, {
      onSuccess: () => toast.success("Solicitação enviada!"),
      onError: (err) => toast.error(err.message || "Erro ao enviar convite")
    });
  };

  const confirmInvest = (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    // Investidor solicita entrar no projeto da empresa
    // Pega o email do dono do projeto
    supabase.from("profiles").select("email").eq("id", selectedProject.user_id).single()
      .then(({ data, error }) => {
         if (error || !data?.email) {
            toast.error("Não foi possível encontrar o contato da empresa deste projeto.");
            return;
         }
         
         // Envia convite de investidor para empresa
         sendInvitation.mutate({
            receiver_email: data.email,
            message: `Gostaria de investir R$ ${investAmount} no projeto "${selectedProject.name}".`,
            sender_role: "investor"
         }, {
            onSuccess: () => {
              toast.success("Solicitação de investimento enviada à empresa!");
              setShowModal(false);
              setSelectedProject(null);
              setInvestAmount("");
            },
            onError: (err) => toast.error(err.message || "Erro ao solicitar investimento")
         });
      });
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
      if (locationFilter && !p.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      if (minReturnFilter && (p.expectedReturn || 0) < parseFloat(minReturnFilter)) {
        return false;
      }
      if (maxRiskFilter && (p.riskLevel || 0) > parseFloat(maxRiskFilter)) {
        return false;
      }
      return true;
    });
  }, [projects, searchTerm, categoryFilter, locationFilter, minReturnFilter, maxRiskFilter]);

  const filteredInvestors = useMemo(() => {
    if (!publicInvestors) return [];
    return publicInvestors.filter((inv) => {
      if (searchTerm && !inv.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [publicInvestors, searchTerm]);

  const isLoading = isEnterprise ? loadingInvestors : loadingProjects;

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
          <h1 className="text-2xl font-bold text-gray-800">
            {isEnterprise ? "Vitrine de Investidores" : "Vitrine de Projetos"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEnterprise 
              ? "Descubra investidores parceiros e expanda seus negócios." 
              : "Descubra projetos públicos e encontre oportunidades de investimento."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={isEnterprise ? "Buscar investidores..." : "Buscar projetos..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          />
        </div>
        {!isEnterprise && (
          <>
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
            <input
              type="text"
              placeholder="Localização"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            />
            <input
              type="number"
              placeholder="Retorno mín. %"
              value={minReturnFilter}
              onChange={(e) => setMinReturnFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
              min="0"
              max="100"
            />
            <input
              type="number"
              placeholder="Risco máx."
              value={maxRiskFilter}
              onChange={(e) => setMaxRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
              min="0"
              max="100"
            />
          </>
        )}
        {!isEnterprise && compareIds.length === 2 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">compare_arrows</span>
            Comparar
          </button>
        )}
      </div>

      {/* Lista */}
      {isEnterprise ? (
        filteredInvestors.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-300">search_off</span>
            <h3 className="text-xl font-semibold text-gray-600 mt-4">Nenhum investidor encontrado</h3>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInvestors.map((inv) => (
              <div key={inv.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white text-lg">{inv.name}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">Investidor</span>
                  </div>
                  <p className="text-sm text-white/80">{inv.email}</p>
                </div>
                <div className="p-4">
                  <button onClick={() => handleInviteClick(inv)} disabled={sendInvitation.isPending} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Solicitar Parceria
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredProjects.length === 0 ? (
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
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={compareIds.includes(project.id)}
                        onChange={() => {
                          setCompareIds(prev =>
                            prev.includes(project.id)
                              ? prev.filter(id => id !== project.id)
                              : prev.length < 2 ? [...prev, project.id] : prev
                          );
                        }}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                    </div>
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
                      Solicitar Participação
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal de Comparação */}
      {showCompareModal && compareIds.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCompareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Comparar Projetos</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {(() => {
              const [a, b] = compareIds.map(id => projects.find(p => p.id === id));
              if (!a || !b) return null;
              const rows = [
                { label: "Nome", va: a.name, vb: b.name },
                { label: "Categoria", va: a.category, vb: b.category },
                { label: "Orçamento", va: `R$ ${(a.budget || 0).toLocaleString()}`, vb: `R$ ${(b.budget || 0).toLocaleString()}` },
                { label: "Localização", va: a.location || "-", vb: b.location || "-" },
                { label: "Retorno Esperado", va: `${a.expectedReturn || 0}%`, vb: `${b.expectedReturn || 0}%` },
                { label: "Nível de Risco", va: `${a.riskLevel || 0}/10`, vb: `${b.riskLevel || 0}/10` },
                { label: "Progresso", va: `${a.progress || 0}%`, vb: `${b.progress || 0}%` },
              ];
              return (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 text-gray-500 font-medium">Métrica</th>
                      <th className="text-left py-2 px-4 bg-green-50 text-green-800 font-medium rounded-tl-lg rounded-tr-lg">{a.name}</th>
                      <th className="text-left py-2 px-4 bg-blue-50 text-blue-800 font-medium rounded-tl-lg rounded-tr-lg">{b.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.label} className="border-b border-gray-100">
                        <td className="py-3 pr-4 text-gray-500 font-medium">{row.label}</td>
                        <td className="py-3 px-4 bg-green-50/50">{row.va}</td>
                        <td className="py-3 px-4 bg-blue-50/50">{row.vb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal de Investimento */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Solicitar Participação</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">{selectedProject.name}</p>
              <p className="text-xs text-blue-600 mt-1">A empresa dona deste projeto receberá uma solicitação com sua proposta.</p>
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
                disabled={sendInvitation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {sendInvitation.isPending ? "Enviando..." : "Enviar Solicitação"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
