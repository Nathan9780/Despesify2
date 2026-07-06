import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useMaterials } from "../hooks/useMaterials";
import { useGooglePlaces } from "../hooks/useGooglePlaces";
import { useTheme } from "../contexts/ThemeContext";
import { GoogleMap, Marker } from "@react-google-maps/api";
import toast from "react-hot-toast";

export function Materials() {
  const { theme } = useTheme();
  const {
    materials,
    isLoading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    addStock,
    removeStock,
  } = useMaterials();

  // Estados (mesmos do código anterior)
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    minimum_quantity: 0,
    unit_price: 0,
    supplier: "",
    unit: "unidades",
    notes: "",
    project_impact: 0,
  });

  const { isLoaded, loadError, places, loading: placesLoading, error: placesError, searchPlaces } = useGooglePlaces();
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Solicitar localização e buscar fornecedores
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Erro ao obter localização, usando padrão (BH)", error);
          setUserLocation({ lat: -19.916681, lng: -43.934493 });
        }
      );
    } else {
      setUserLocation({ lat: -19.916681, lng: -43.934493 });
    }
  }, []);

  useEffect(() => {
    if (mapInstance && userLocation && places.length === 0 && !placesLoading) {
      searchPlaces(mapInstance, userLocation);
    }
  }, [mapInstance, userLocation, searchPlaces]);

  // Memos (mesmos do código anterior)
  const categories = useMemo(() => {
    if (!materials) return ["Todos"];
    return [
      "Todos",
      ...new Set(materials.map((m) => m.category).filter(Boolean)),
    ];
  }, [materials]);

  const pendingMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter((m) => m.status === "low" || m.status === "out");
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter((m) => {
      if (
        searchTerm &&
        !m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      if (categoryFilter !== "Todos" && m.category !== categoryFilter)
        return false;
      if (statusFilter === "available" && m.status !== "available")
        return false;
      if (statusFilter === "low" && m.status !== "low") return false;
      if (statusFilter === "out" && m.status !== "out") return false;
      return true;
    });
  }, [materials, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!materials || materials.length === 0) {
      return { total: 0, stockValue: 0, lowStock: 0, suppliers: 0 };
    }
    const total = materials.length;
    const stockValue = materials.reduce(
      (sum, m) => sum + (m.quantity || 0) * (m.unit_price || 0),
      0,
    );
    const lowStock = materials.filter(
      (m) => m.status === "low" || m.status === "out",
    ).length;
    const suppliers = new Set(materials.map((m) => m.supplier).filter(Boolean))
      .size;
    return { total, stockValue, lowStock, suppliers };
  }, [materials]);

  const statusConfig = {
    available: {
      label: "🟢 Disponível",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    low: {
      label: "🟠 Estoque Baixo",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    out: {
      label: "🔴 Reposição Necessária",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  // Handlers (mesmos do código anterior)
  const handleOpenModal = (material = null) => {
    setEditingMaterial(material);
    if (material) {
      setFormData({
        name: material.name || "",
        category: material.category || "Construção",
        quantity: material.quantity || 0,
        minimum_quantity: material.minimum_quantity || 0,
        unit_price: material.unit_price || 0,
        unit: material.unit || "un",
        supplier: material.supplier || "",
        project_impact: material.project_impact || 0,
        notes: material.notes || "",
      });
    } else {
      setFormData({
        name: "",
        category: "Construção",
        quantity: 0,
        minimum_quantity: 0,
        unit_price: 0,
        unit: "un",
        supplier: "",
        project_impact: 0,
        notes: "",
      });
    }
    setShowModal(true);
  };
  
  const handleSave = async () => {
    try {
      if (editingMaterial) {
        await updateMaterial.mutateAsync({
          id: editingMaterial.id,
          ...formData,
        });
        toast.success("Material atualizado!");
      } else {
        await createMaterial.mutateAsync(formData);
        toast.success("Material adicionado!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja mesmo excluir este material?")) {
      try {
        await deleteMaterial.mutateAsync(id);
        toast.success("Material excluído!");
      } catch (err) {
        toast.error(`Erro: ${err.message}`);
      }
    }
  };

  const handleStockChange = async (id, type, quantity) => {
    try {
      if (type === "add") {
        await addStock.mutateAsync({ id, quantity });
        toast.success("Estoque adicionado!");
      } else {
        await removeStock.mutateAsync({ id, quantity });
        toast.success("Estoque removido!");
      }
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Carregando materiais...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center max-w-md p-8 bg-[var(--color-surface)] rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-red-400 block">
            error
          </span>
          <p className="text-xl font-semibold text-red-600 mt-4">
            Erro ao carregar materiais
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-primary text-white px-6 py-2 rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }
        .dark .hover-lift:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        .badge-glow {
          background: rgba(53, 158, 171, 0.12);
          color: #359EAB;
          border: 1px solid rgba(53, 158, 171, 0.25);
          box-shadow: 0 0 16px rgba(53, 158, 171, 0.1);
        }
        .dark .badge-glow {
          background: rgba(53, 158, 171, 0.2);
          border-color: rgba(53, 158, 171, 0.3);
          box-shadow: 0 0 16px rgba(53, 158, 171, 0.2);
        }
        .badge-glow-secondary {
          background: rgba(41, 128, 185, 0.12);
          color: #2980B9;
          border: 1px solid rgba(41, 128, 185, 0.25);
          box-shadow: 0 0 16px rgba(41, 128, 185, 0.1);
        }
        .dark .badge-glow-secondary {
          background: rgba(41, 128, 185, 0.2);
          border-color: rgba(41, 128, 185, 0.3);
        }
        .btn-outline-glow {
          transition: all 0.25s ease;
        }
        .btn-outline-glow:hover {
          box-shadow: 0 0 20px rgba(53, 158, 171, 0.2);
          background: rgba(53, 158, 171, 0.04);
        }
        .dark .btn-outline-glow:hover {
          box-shadow: 0 0 20px rgba(53, 158, 171, 0.3);
          background: rgba(53, 158, 171, 0.08);
        }
        .icon-glow {
          filter: drop-shadow(0 0 8px rgba(53, 158, 171, 0.15));
          transition: filter 0.3s ease;
        }
        .icon-glow:hover {
          filter: drop-shadow(0 0 16px rgba(53, 158, 171, 0.3));
        }
        .number-glow {
          text-shadow: 0 0 20px rgba(53, 158, 171, 0.15);
        }
        .dark .number-glow {
          text-shadow: 0 0 20px rgba(53, 158, 171, 0.3);
        }
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        .map-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(53, 158, 171, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(53, 158, 171, 0); }
          100% { box-shadow: 0 0 0 0 rgba(53, 158, 171, 0); }
        }
      `}</style>

      {/* Cabeçalho */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Materiais
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Controle de estoque, fornecedores e compras.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Adicionar Material
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              inventory_2
            </span>
            Total de Materiais
          </p>
          <p className="text-xl font-bold text-[var(--color-text)]">
            {stats.total}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Valor em Estoque
          </p>
          <p className="text-xl font-bold text-primary">
            R$ {stats.stockValue.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            Baixo Estoque
          </p>
          <p className="text-xl font-bold text-orange-500">{stats.lowStock}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              local_shipping
            </span>
            Fornecedores
          </p>
          <p className="text-xl font-bold text-[var(--color-text)]">
            {stats.suppliers}
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
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Pesquisar material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="Todos">Todos os status</option>
          <option value="available">🟢 Disponível</option>
          <option value="low">🟠 Baixo estoque</option>
          <option value="out">🔴 Reposição necessária</option>
        </select>

        {(searchTerm ||
          categoryFilter !== "Todos" ||
          statusFilter !== "Todos") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("Todos");
              setStatusFilter("Todos");
            }}
            className="text-sm text-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista de Materiais + Fornecedores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {filteredMaterials.length} material
              {filteredMaterials.length !== 1 ? "is" : ""} encontrado
              {filteredMaterials.length !== 1 ? "s" : ""}
            </p>
            {pendingMaterials.length > 0 && (
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800/30">
                🛒 {pendingMaterials.length} item(ns) para comprar
              </span>
            )}
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-[var(--color-text-secondary)]">
                search_off
              </span>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mt-4">
                Nenhum material encontrado
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Tente ajustar os filtros ou adicionar um novo material.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="glass-card rounded-xl p-4 hover-lift animate-fade-up"
                  style={{ animationDelay: "0.20s" }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {material.name}
                      </h3>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {material.category || "Sem categoria"}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[material.status]?.color || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
                    >
                      {statusConfig[material.status]?.label || "Desconhecido"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">
                        Quantidade
                      </span>
                      <span className="font-medium text-[var(--color-text)]">
                        {material.quantity} {material.unit || "unidades"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">
                        Valor Unitário
                      </span>
                      <span className="font-medium text-[var(--color-text)]">
                        R$ {material.unit_price?.toFixed(2) || "0,00"}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-[var(--color-text-secondary)]">
                        Valor Total
                      </span>
                      <span className="text-primary">
                        R$ {material.totalPrice?.toFixed(2) || "0,00"}
                      </span>
                    </div>
                    {material.minimum_quantity > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--color-text-secondary)]">
                          Estoque mínimo
                        </span>
                        <span className="text-[var(--color-text)]">
                          {material.minimum_quantity}{" "}
                          {material.unit || "unidades"}
                        </span>
                      </div>
                    )}
                  </div>

                  {material.project_impact > 0 && (
                    <div className="mt-2 bg-[var(--color-surface)]/50 rounded-lg p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">
                          Impacto no orçamento
                        </span>
                        <span className="font-medium text-[var(--color-text)]">
                          {material.project_impact}%
                        </span>
                      </div>
                      <div className="w-full bg-[var(--color-border)] rounded-full h-1 mt-1">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{
                            width: `${Math.min(material.project_impact, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {material.supplier && (
                    <div className="mt-2 text-sm">
                      <span className="text-[var(--color-text-secondary)]">
                        Fornecedor:
                      </span>
                      <span className="ml-1 font-medium text-[var(--color-text)]">
                        {material.supplier}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedMaterial(material);
                        setShowDetails(true);
                      }}
                      className="flex-1 btn-primary text-white py-1.5 rounded-lg text-xs font-medium"
                    >
                      Detalhes
                    </button>
                    <button
                      onClick={() => handleOpenModal(material)}
                      className="px-2 py-1.5 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface)]/50 text-xs text-[var(--color-text)]"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        const qty = prompt("Quantidade a adicionar:", "1");
                        if (qty)
                          handleStockChange(
                            material.id,
                            "add",
                            parseFloat(qty),
                          );
                      }}
                      className="px-2 py-1.5 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-xs text-green-600 dark:text-green-400"
                    >
                      ➕
                    </button>
                    <button
                      onClick={() => {
                        const qty = prompt("Quantidade a remover:", "1");
                        if (qty)
                          handleStockChange(
                            material.id,
                            "remove",
                            parseFloat(qty),
                          );
                      }}
                      className="px-2 py-1.5 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-xs text-red-600 dark:text-red-400"
                    >
                      ➖
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="px-2 py-1.5 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-xs text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          {/* Fornecedores Próximos */}
          <div
            className="glass-card rounded-xl p-4 hover-lift animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2 text-sm mb-3">
              <span className="material-symbols-outlined text-primary">
                storefront
              </span>
              Fornecedores Próximos
            </h3>

            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-tertiary/5 dark:from-primary/10 dark:via-secondary/10 rounded-xl mb-3 relative h-64 border border-[var(--color-border)] overflow-hidden">
              {isLoaded && userLocation ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={userLocation}
                  zoom={13}
                  onLoad={(map) => setMapInstance(map)}
                  options={{ disableDefaultUI: false }}
                >
                  {/* Marcador do usuário */}
                  <Marker
                    position={userLocation}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                    title="Você está aqui"
                  />
                  
                  {/* Marcadores dos fornecedores encontrados */}
                  {places.map((place) => (
                    <Marker
                      key={place.id}
                      position={{ lat: place.lat, lng: place.lng }}
                      title={place.name}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="material-symbols-outlined text-4xl text-primary/50">
                    {loadError ? 'error' : 'map'}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {loadError ? 'Erro ao carregar mapa' : 'Carregando mapa...'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {placesLoading && <p className="text-xs text-center py-2 text-[var(--color-text-secondary)]">Buscando fornecedores...</p>}
              {placesError && <p className="text-xs text-center py-2 text-red-500">{placesError.message}</p>}
              {!placesLoading && places.length === 0 && !placesError && (
                <p className="text-xs text-center py-2 text-[var(--color-text-secondary)]">Nenhum fornecedor encontrado.</p>
              )}
              {places.slice(0, 5).map((sup, idx) => (
                <div
                  key={sup.id || idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {sup.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--color-text)] truncate" title={sup.name}>
                      {sup.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)]">
                      <span>📍 {sup.distance} km</span>
                      {sup.rating > 0 && <span>⭐ {sup.rating} ({sup.user_ratings_total})</span>}
                    </div>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${sup.lat},${sup.lng}&query_place_id=${sup.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0" title="Ver no Maps">
                    <span className="material-symbols-outlined text-sm block">map</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Compras */}
          <div
            className="glass-card rounded-xl p-4 hover-lift animate-fade-up"
            style={{ animationDelay: "0.30s" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-orange-500">
                  shopping_cart
                </span>
                Lista de Compras
              </h3>
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/30">
                {pendingMaterials.length}
              </span>
            </div>

            {pendingMaterials.length === 0 ? (
              <div className="text-center py-4 text-sm text-[var(--color-text-secondary)]">
                <span className="material-symbols-outlined text-3xl text-[var(--color-text-secondary)]/30">
                  check_circle
                </span>
                <p className="mt-1">Nenhum material pendente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border-l-4 border-orange-400"
                  >
                    <span className="material-symbols-outlined text-orange-400 text-sm">
                      warning
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[var(--color-text)]">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">
                        {m.status === "out"
                          ? "🔴 Esgotado"
                          : "🟠 Estoque baixo"}{" "}
                        – {m.quantity} {m.unit || "unidades"}
                      </p>
                    </div>
                    <button className="text-xs text-primary hover:underline">
                      + Comprar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Adicionar/Editar Material */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--color-text)]">
                {editingMaterial ? "Editar Material" : "Adicionar Material"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                  placeholder="Ex: Cimento CP-II"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                >
                  <option value="">Selecione</option>
                  <option value="Construção">Construção</option>
                  <option value="Elétrica">Elétrica</option>
                  <option value="Hidráulica">Hidráulica</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Ferramentas">Ferramentas</option>
                  <option value="Equipamentos">Equipamentos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Estoque mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimum_quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Valor Unitário (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                    placeholder="0,00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                    placeholder="ex: sacos, m³"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  Impacto no orçamento (%)
                </label>
                <input
                  type="number"
                  value={formData.project_impact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project_impact: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                  placeholder="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]"
                  rows="2"
                  placeholder="Observações adicionais..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-medium transition"
              >
                {editingMaterial ? "Salvar Alterações" : "Adicionar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && selectedMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--color-text)]">
                Detalhes do Material
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[var(--color-text)]">
                  {selectedMaterial.name}
                </h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[selectedMaterial.status]?.color || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
                >
                  {statusConfig[selectedMaterial.status]?.label ||
                    "Desconhecido"}
                </span>
                <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
                  {selectedMaterial.category || "Sem categoria"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--color-text-secondary)]">
                    Quantidade
                  </p>
                  <p className="font-medium text-[var(--color-text)]">
                    {selectedMaterial.quantity}{" "}
                    {selectedMaterial.unit || "unidades"}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-secondary)]">
                    Estoque mínimo
                  </p>
                  <p className="font-medium text-[var(--color-text)]">
                    {selectedMaterial.minimum_quantity}{" "}
                    {selectedMaterial.unit || "unidades"}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-secondary)]">
                    Valor Unitário
                  </p>
                  <p className="font-medium text-[var(--color-text)]">
                    R$ {selectedMaterial.unit_price?.toFixed(2) || "0,00"}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-secondary)]">
                    Valor Total
                  </p>
                  <p className="font-medium text-primary">
                    R$ {selectedMaterial.totalPrice?.toFixed(2) || "0,00"}
                  </p>
                </div>
              </div>

              {selectedMaterial.supplier && (
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Fornecedor
                  </p>
                  <p className="font-medium text-[var(--color-text)]">
                    {selectedMaterial.supplier}
                  </p>
                </div>
              )}

              {selectedMaterial.notes && (
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Observações
                  </p>
                  <p className="text-sm text-[var(--color-text)]">
                    {selectedMaterial.notes}
                  </p>
                </div>
              )}

              {selectedMaterial.project_impact > 0 && (
                <div className="bg-[var(--color-surface)]/50 rounded-lg p-3">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Impacto no orçamento do projeto
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-[var(--color-border)] rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(selectedMaterial.project_impact, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      {selectedMaterial.project_impact}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleOpenModal(selectedMaterial);
                  }}
                  className="flex-1 btn-primary text-white py-2 rounded-lg font-medium transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    const qty = prompt("Quantidade a adicionar:", "1");
                    if (qty)
                      handleStockChange(
                        selectedMaterial.id,
                        "add",
                        parseFloat(qty),
                      );
                    setShowDetails(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                >
                  + Entrada
                </button>
                <button
                  onClick={() => {
                    const qty = prompt("Quantidade a remover:", "1");
                    if (qty)
                      handleStockChange(
                        selectedMaterial.id,
                        "remove",
                        parseFloat(qty),
                      );
                    setShowDetails(false);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition"
                >
                  - Saída
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
