import { useState } from "react";
import { useSuppliersData, useSupplierPurchases } from "../hooks/useSuppliersData";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const SUPPLIER_CATEGORIES = [
  "Materiais Básicos", "Elétrica", "Hidráulica", "Madeira", "Ferragens",
  "Ferramentas", "Acabamento", "Pintura", "Telhado", "Logística", "Serviços", "Outros",
];

const libraries = ["places"];

const defaultCenter = { lat: -19.916681, lng: -43.934493 };

export function Suppliers() {
  const { suppliers, isLoading, error, createSupplier, updateSupplier, deleteSupplier } = useSuppliersData();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [showHistoryFor, setShowHistoryFor] = useState(null);
  const [showBudgetFor, setShowBudgetFor] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ description: "", amount: "" });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [form, setForm] = useState({
    name: "", category: "Materiais Básicos", location: "", latitude: "", longitude: "",
    phone: "", email: "", notes: "", status: "active",
  });

  const filtered = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditingSupplier(null);
    setForm({ name: "", category: "Materiais Básicos", location: "", latitude: "", longitude: "", phone: "", email: "", notes: "", status: "active" });
    setShowModal(true);
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || "", category: supplier.category || "Materiais Básicos",
      location: supplier.location || "", latitude: supplier.latitude?.toString() || "",
      longitude: supplier.longitude?.toString() || "", phone: supplier.phone || "",
      email: supplier.email || "", notes: supplier.notes || "", status: supplier.status || "active",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    try {
      const payload = {
        name: form.name, category: form.category, location: form.location,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        phone: form.phone, email: form.email, notes: form.notes, status: form.status,
      };
      if (editingSupplier) {
        await updateSupplier.mutateAsync({ id: editingSupplier.id, ...payload });
        toast.success("Fornecedor atualizado!");
      } else {
        await createSupplier.mutateAsync(payload);
        toast.success("Fornecedor adicionado!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja mesmo excluir este fornecedor?")) {
      try {
        await deleteSupplier.mutateAsync(id);
        toast.success("Fornecedor excluído!");
      } catch (err) {
        toast.error(`Erro: ${err.message}`);
      }
    }
  };

  const handleBudgetRequest = async (supplierId) => {
    if (!budgetForm.description.trim() || !budgetForm.amount) {
      toast.error("Preencha descrição e valor");
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("budget_requests").insert([{
        supplier_id: supplierId,
        user_id: user.id,
        description: budgetForm.description,
        amount: parseFloat(budgetForm.amount),
        status: "pending",
      }]);
      toast.success("Solicitação de orçamento enviada!");
      setShowBudgetFor(null);
      setBudgetForm({ description: "", amount: "" });
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  const mapCenter = suppliers.length > 0 && suppliers.find(s => s.latitude && s.longitude)
    ? { lat: parseFloat(suppliers.find(s => s.latitude).latitude), lng: parseFloat(suppliers.find(s => s.longitude).longitude) }
    : defaultCenter;

  const statusConfig = {
    active: { label: "Ativo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    inactive: { label: "Inativo", color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-[var(--color-text-secondary)]">Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center max-w-md p-8 bg-[var(--color-surface)] rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-red-400 block">error</span>
          <p className="text-xl font-semibold text-red-600 mt-4">Erro ao carregar fornecedores</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">{error.message}</p>
          <button onClick={() => window.location.reload()} className="mt-6 bg-primary text-white px-6 py-2 rounded-lg">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Fornecedores</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Gerencie e descubra novos fornecedores de materiais.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button onClick={openAdd} className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Novo Fornecedor
          </button>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm">search</span>
            <input
              type="text" placeholder="Buscar por nome, categoria ou local..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        </div>
        <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition ${viewMode === "table" ? "bg-primary text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"}`}
          >
            <span className="material-symbols-outlined text-sm">table_rows</span>
            Tabela
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition ${viewMode === "map" ? "bg-primary text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"}`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Mapa
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-background)] text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Nome / Categoria</th>
                  <th className="px-6 py-4 font-medium">Localização</th>
                  <th className="px-6 py-4 font-medium">Contato</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-sm">
                {filtered.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-[var(--color-background)]/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text)]">{supplier.name}</div>
                      <div className="text-[var(--color-text-secondary)] text-xs">{supplier.category}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {supplier.location || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                      {supplier.phone && <div>{supplier.phone}</div>}
                      {supplier.email && <div className="text-xs">{supplier.email}</div>}
                      {!supplier.phone && !supplier.email && <span>—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${statusConfig[supplier.status]?.color || statusConfig.inactive.color}`}>
                        {statusConfig[supplier.status]?.label || "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(supplier)} className="text-primary hover:text-primary/80 text-sm font-medium">
                          Editar
                        </button>
                        <button onClick={() => setShowHistoryFor(supplier.id)} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                          Histórico
                        </button>
                        <button onClick={() => { setShowBudgetFor(supplier.id); setBudgetForm({ description: "", amount: "" }); }} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Solicitar Orçamento
                        </button>
                        <button onClick={() => handleDelete(supplier.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-[var(--color-text-secondary)]/40">search_off</span>
              <p className="mt-2 text-[var(--color-text-secondary)]">Nenhum fornecedor encontrado.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden" style={{ height: "600px" }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={12}
            >
              {filtered.filter(s => s.latitude && s.longitude).map((supplier) => (
                <Marker
                  key={supplier.id}
                  position={{ lat: parseFloat(supplier.latitude), lng: parseFloat(supplier.longitude) }}
                  title={`${supplier.name} - ${supplier.location || ""}`}
                />
              ))}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full flex-col">
              <span className="material-symbols-outlined text-4xl text-primary/50">{loadError ? "error" : "map"}</span>
              <span className="text-sm text-[var(--color-text-secondary)] mt-2">
                {loadError ? "Erro ao carregar mapa" : "Carregando mapa..."}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal de Adicionar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[var(--color-text)]">
                {editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">Nome *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required placeholder="Ex: Construtora Silva Ltda."
                  className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">Categoria</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]">
                    {SUPPLIER_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">Localização</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="-23.5505"
                    className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="-46.6333"
                    className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">Telefone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(11) 99999-8888"
                    className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">E-mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contato@fornecedor.com"
                    className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">Observações</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detalhes adicionais..." rows={2}
                  className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)] resize-none" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">add_business</span>
                {editingSupplier ? "Salvar Alterações" : "Adicionar Fornecedor"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Compras */}
      {showHistoryFor && (
        <PurchaseHistoryModal supplierId={showHistoryFor} onClose={() => setShowHistoryFor(null)} />
      )}

      {/* Modal de Solicitar Orçamento */}
      {showBudgetFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={() => setShowBudgetFor(null)}>
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--color-text)]">Solicitar Orçamento</h3>
              <button onClick={() => setShowBudgetFor(null)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">Descrição *</label>
                <textarea value={budgetForm.description} onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })}
                  placeholder="Descreva o material ou serviço desejado..." rows={3}
                  className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)] resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">Valor Estimado (R$) *</label>
                <input type="number" step="0.01" value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                  placeholder="0,00"
                  className="w-full mt-1 p-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none bg-[var(--color-surface)] text-[var(--color-text)]" />
              </div>
              <button onClick={() => handleBudgetRequest(showBudgetFor)} className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition">
                Enviar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PurchaseHistoryModal({ supplierId, onClose }) {
  const { purchases, isLoading } = useSupplierPurchases(supplierId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[var(--color-text)]">Histórico de Compras</h3>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-[var(--color-text-secondary)]/40">receipt_long</span>
            <p className="mt-3 text-[var(--color-text-secondary)]">Nenhuma compra registrada para este fornecedor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs uppercase">
                  <th className="pb-3 pr-4 font-medium">Data</th>
                  <th className="pb-3 pr-4 font-medium">Material</th>
                  <th className="pb-3 pr-4 font-medium">Quantidade</th>
                  <th className="pb-3 pr-4 font-medium">Valor Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/50">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--color-surface)]/50">
                    <td className="py-3 pr-4 text-[var(--color-text)] whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text)]">
                      {p.materials?.name || "—"}
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text)]">{p.quantity}</td>
                    <td className="py-3 pr-4 font-medium text-[var(--color-text)]">
                      R$ {p.total_price?.toFixed(2) || "0,00"}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : p.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {p.status === "completed" ? "Concluído" : p.status === "pending" ? "Pendente" : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
