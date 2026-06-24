import React, { useState } from "react";

export function Materials() {
  // Dados mockados dos materiais
  const initialMaterials = [
    {
      id: 1,
      name: "Cimento CP-II",
      category: "Construção",
      quantity: 40,
      unit: "sacos",
      minStock: 20,
      priceUnit: 42.0,
      totalPrice: 1680,
      supplier: "Casa do Cimento",
      status: "available", // available | low | out
      lastPurchase: "2026-06-10",
      notes: "Para fundação",
      projectImpact: 12, // percentual do orçamento do projeto
    },
    {
      id: 2,
      name: "Areia Média",
      category: "Construção",
      quantity: 2,
      unit: "m³",
      minStock: 5,
      priceUnit: 85.0,
      totalPrice: 170,
      supplier: "Areais Santos",
      status: "low",
      lastPurchase: "2026-06-05",
      notes: "Necessário reposição",
      projectImpact: 1.5,
    },
    {
      id: 3,
      name: "Tinta Acrílica Branca",
      category: "Pintura",
      quantity: 12,
      unit: "litros",
      minStock: 10,
      priceUnit: 35.0,
      totalPrice: 420,
      supplier: "Tintas Luxo",
      status: "available",
      lastPurchase: "2026-06-12",
      notes: "Para pintura final",
      projectImpact: 3,
    },
    {
      id: 4,
      name: "Fio Elétrico 2.5mm",
      category: "Elétrica",
      quantity: 150,
      unit: "metros",
      minStock: 50,
      priceUnit: 1.2,
      totalPrice: 180,
      supplier: "Elétrica SP",
      status: "available",
      lastPurchase: "2026-06-08",
      notes: "Para instalação elétrica",
      projectImpact: 1.8,
    },
    {
      id: 5,
      name: "Tubo PVC 25mm",
      category: "Hidráulica",
      quantity: 8,
      unit: "peças",
      minStock: 10,
      priceUnit: 15.0,
      totalPrice: 120,
      supplier: "Hidralima",
      status: "low",
      lastPurchase: "2026-06-01",
      notes: "Verificar estoque",
      projectImpact: 0.8,
    },
    {
      id: 6,
      name: "Martelo",
      category: "Ferramentas",
      quantity: 5,
      unit: "unidades",
      minStock: 2,
      priceUnit: 45.0,
      totalPrice: 225,
      supplier: "Ferramentas King",
      status: "available",
      lastPurchase: "2026-05-20",
      notes: "",
      projectImpact: 0.4,
    },
    {
      id: 7,
      name: "Brita 1",
      category: "Construção",
      quantity: 0,
      unit: "m³",
      minStock: 3,
      priceUnit: 120.0,
      totalPrice: 0,
      supplier: "BritaMinas",
      status: "out",
      lastPurchase: "2026-06-15",
      notes: "Reposição urgente",
      projectImpact: 0.9,
    },
    {
      id: 8,
      name: "Lâmpada LED 12W",
      category: "Elétrica",
      quantity: 30,
      unit: "unidades",
      minStock: 20,
      priceUnit: 8.5,
      totalPrice: 255,
      supplier: "Luz & Cia",
      status: "available",
      lastPurchase: "2026-06-18",
      notes: "Para iluminação",
      projectImpact: 0.6,
    },
  ];

  // Estados
  const [materials, setMaterials] = useState(initialMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSupplierMap, setShowSupplierMap] = useState(false);

  // Categorias únicas
  const categories = ["Todos", ...new Set(materials.map((m) => m.category))];

  // Estatísticas
  const totalMaterials = materials.length;
  const totalStockValue = materials.reduce((sum, m) => sum + m.totalPrice, 0);
  const lowStockCount = materials.filter(
    (m) => m.status === "low" || m.status === "out",
  ).length;
  const supplierCount = new Set(materials.map((m) => m.supplier)).size;

  // Materiais pendentes para compra (estoque baixo ou zerado)
  const pendingMaterials = materials.filter(
    (m) => m.status === "low" || m.status === "out",
  );

  // Aplicar filtros
  const filteredMaterials = materials.filter((m) => {
    if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    if (categoryFilter !== "Todos" && m.category !== categoryFilter)
      return false;
    if (statusFilter === "available" && m.status !== "available") return false;
    if (statusFilter === "low" && m.status !== "low") return false;
    if (statusFilter === "out" && m.status !== "out") return false;
    return true;
  });

  // Status labels
  const statusConfig = {
    available: { label: "🟢 Disponível", color: "bg-green-100 text-green-700" },
    low: { label: "🟠 Estoque Baixo", color: "bg-orange-100 text-orange-700" },
    out: { label: "🔴 Reposição Necessária", color: "bg-red-100 text-red-700" },
  };

  // Simular fornecedores próximos (mock)
  const nearbySuppliers = [
    {
      name: "Casa do Cimento",
      distance: 2.4,
      rating: 4.8,
      phone: "(31) 99999-1111",
    },
    {
      name: "Depósito Central",
      distance: 3.1,
      rating: 4.5,
      phone: "(31) 99999-2222",
    },
    {
      name: "Constrular",
      distance: 5.6,
      rating: 4.2,
      phone: "(31) 99999-3333",
    },
  ];

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
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        .map-placeholder {
          background: linear-gradient(135deg, #e8f0fe 0%, #d4e4f7 100%);
          border: 2px dashed rgba(41, 128, 185, 0.3);
        }
        .map-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(41, 128, 185, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(41, 128, 185, 0); }
          100% { box-shadow: 0 0 0 0 rgba(41, 128, 185, 0); }
        }
      `}</style>

      {/* Cabeçalho */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Materiais</h1>
          <p className="text-sm text-gray-500">
            Controle de estoque, fornecedores e compras.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Adicionar Material
          </button>
          <button className="btn-outline-glow px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
            <span className="material-symbols-outlined text-lg">
              file_download
            </span>
            Relatório
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              inventory_2
            </span>
            Total de Materiais
          </p>
          <p className="text-xl font-bold text-gray-800">{totalMaterials}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Valor em Estoque
          </p>
          <p className="text-xl font-bold text-blue-600">
            R$ {totalStockValue.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            Baixo Estoque
          </p>
          <p className="text-xl font-bold text-orange-500">{lowStockCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              local_shipping
            </span>
            Fornecedores
          </p>
          <p className="text-xl font-bold text-gray-800">{supplierCount}</p>
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
              placeholder="Pesquisar material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="text-sm text-blue-600 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista de Materiais e Fornecedores (Grid 2 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal: Lista de Materiais (2 colunas) */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-500">
              {filteredMaterials.length} material
              {filteredMaterials.length !== 1 ? "is" : ""} encontrado
              {filteredMaterials.length !== 1 ? "s" : ""}
            </p>
            {pendingMaterials.length > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                🛒 {pendingMaterials.length} item(ns) para comprar
              </span>
            )}
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300">
                search_off
              </span>
              <h3 className="text-xl font-semibold text-gray-600 mt-4">
                Nenhum material encontrado
              </h3>
              <p className="text-sm text-gray-500">
                Tente ajustar os filtros ou adicionar um novo material.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMaterials.map((material) => {
                const impactPercent = material.projectImpact || 0;
                return (
                  <div
                    key={material.id}
                    className="glass-card rounded-xl p-4 hover-lift animate-fade-up"
                    style={{ animationDelay: "0.20s" }}
                  >
                    {/* Cabeçalho do card */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {material.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {material.category}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[material.status].color}`}
                      >
                        {statusConfig[material.status].label}
                      </span>
                    </div>

                    {/* Quantidade e valores */}
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantidade</span>
                        <span className="font-medium">
                          {material.quantity} {material.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Valor Unitário</span>
                        <span className="font-medium">
                          R$ {material.priceUnit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-500">Valor Total</span>
                        <span className="text-blue-600">
                          R$ {material.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      {material.minStock > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Estoque mínimo</span>
                          <span className="text-gray-500">
                            {material.minStock} {material.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Impacto no orçamento */}
                    <div className="mt-2 bg-gray-50 rounded-lg p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Impacto no orçamento
                        </span>
                        <span className="font-medium">{impactPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${Math.min(impactPercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Fornecedor */}
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Fornecedor:</span>
                      <span className="ml-1 font-medium">
                        {material.supplier}
                      </span>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedMaterial(material);
                          setShowDetails(true);
                        }}
                        className="flex-1 btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-medium"
                      >
                        Ver Detalhes
                      </button>
                      <button className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
                        ✏️
                      </button>
                      <button className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
                        ➕
                      </button>
                      <button className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
                        ➖
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna lateral: Fornecedores + Mapa + Lista de Compras */}
        <div className="space-y-4">
          {/* Fornecedores Próximos com Mapa */}
          <div
            className="glass-card rounded-xl p-4 hover-lift animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-blue-600">
                  storefront
                </span>
                Fornecedores Próximos
              </h3>
              <button
                onClick={() => setShowSupplierMap(!showSupplierMap)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showSupplierMap ? "Ocultar mapa" : "Ver mapa"}
              </button>
            </div>

            {/* Mapa simulado */}
            {showSupplierMap && (
              <div className="map-placeholder rounded-xl p-4 mb-3 relative h-40">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="material-symbols-outlined text-4xl text-blue-400/50">
                    map
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    📍 Google Maps (simulado)
                  </span>
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full map-dot border-2 border-white shadow-lg"></div>
                  <div
                    className="absolute top-2/3 left-2/3 w-3 h-3 bg-blue-500 rounded-full map-dot border-2 border-white shadow-lg"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-green-500 rounded-full map-dot border-2 border-white shadow-lg"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {nearbySuppliers.map((sup, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                    {sup.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">
                      {sup.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>📍 {sup.distance} km</span>
                      <span>⭐ {sup.rating}</span>
                      <span className="text-blue-500">{sup.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Compras (Materiais Pendentes) */}
          <div
            className="glass-card rounded-xl p-4 hover-lift animate-fade-up"
            style={{ animationDelay: "0.30s" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-orange-500">
                  shopping_cart
                </span>
                Lista de Compras
              </h3>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                {pendingMaterials.length}
              </span>
            </div>

            {pendingMaterials.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">
                <span className="material-symbols-outlined text-3xl text-gray-300">
                  check_circle
                </span>
                <p className="mt-1">Nenhum material pendente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 transition-colors border-l-4 border-orange-400"
                  >
                    <span className="material-symbols-outlined text-orange-400 text-sm">
                      warning
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {m.status === "out"
                          ? "🔴 Esgotado"
                          : "🟠 Estoque baixo"}{" "}
                        – {m.quantity} {m.unit}
                      </p>
                    </div>
                    <button className="text-xs text-blue-600 hover:underline">
                      + Comprar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button className="mt-3 w-full btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">
                receipt_long
              </span>
              Gerar Lista de Compras
            </button>
          </div>

          {/* Relatório rápido */}
          <div
            className="glass-card rounded-xl p-4 hover-lift animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm mb-2">
              <span className="material-symbols-outlined text-green-600">
                assessment
              </span>
              Relatório
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-gray-500">Materiais</p>
                <p className="font-bold text-gray-800">{totalMaterials}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-gray-500">Valor Total</p>
                <p className="font-bold text-blue-600">
                  R$ {totalStockValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-gray-500">Baixo Estoque</p>
                <p className="font-bold text-orange-500">{lowStockCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-gray-500">Fornecedores</p>
                <p className="font-bold text-gray-800">{supplierCount}</p>
              </div>
            </div>
            <button className="mt-2 w-full btn-outline-glow border border-gray-300 rounded-lg py-1.5 text-xs font-medium hover:bg-gray-50 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">
                file_download
              </span>
              Exportar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Material */}
      {showDetails && selectedMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Detalhes do Material
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {selectedMaterial.name}
                </h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[selectedMaterial.status].color}`}
                >
                  {statusConfig[selectedMaterial.status].label}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {selectedMaterial.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Quantidade</p>
                  <p className="font-medium">
                    {selectedMaterial.quantity} {selectedMaterial.unit}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Estoque mínimo</p>
                  <p className="font-medium">
                    {selectedMaterial.minStock} {selectedMaterial.unit}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Valor Unitário</p>
                  <p className="font-medium">
                    R$ {selectedMaterial.priceUnit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Valor Total</p>
                  <p className="font-medium text-blue-600">
                    R$ {selectedMaterial.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Fornecedor</p>
                <p className="font-medium">{selectedMaterial.supplier}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Última compra</p>
                <p className="font-medium">
                  {new Date(selectedMaterial.lastPurchase).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>

              {selectedMaterial.notes && (
                <div>
                  <p className="text-gray-500 text-sm">Observações</p>
                  <p className="text-sm">{selectedMaterial.notes}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">
                  Impacto no orçamento do projeto
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(selectedMaterial.projectImpact || 0, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">
                    {selectedMaterial.projectImpact || 0}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                  Editar
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition">
                  + Entrada
                </button>
                <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition">
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
