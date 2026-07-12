import React, { useState } from "react";

const SUPPLIER_CATEGORIES = [
  "Materiais Básicos",
  "Elétrica",
  "Hidráulica",
  "Madeira",
  "Ferragens",
  "Ferramentas",
  "Acabamento",
  "Pintura",
  "Telhado",
  "Logística",
  "Serviços",
  "Outros",
];

export function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Materiais Básicos",
    location: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "Cimento Forte S.A.",
      category: "Materiais Básicos",
      rating: 4.8,
      location: "São Paulo, SP",
      status: "active",
      lastOrder: "12/06/2026",
    },
    {
      id: 2,
      name: "Elétrica Luz & Força",
      category: "Elétrica",
      rating: 4.5,
      location: "Belo Horizonte, MG",
      status: "active",
      lastOrder: "05/06/2026",
    },
    {
      id: 3,
      name: "Madeireira Pinheiro",
      category: "Madeira",
      rating: 4.2,
      location: "Curitiba, PR",
      status: "inactive",
      lastOrder: "20/03/2026",
    },
  ]);

  const openAdd = () => {
    setForm({ name: "", category: "Materiais Básicos", location: "", phone: "", email: "", notes: "" });
    setShowModal(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    const newSupplier = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      location: form.location,
      rating: 0,
      status: "active",
      lastOrder: "—",
      phone: form.phone,
      email: form.email,
      notes: form.notes,
    };
    setSuppliers([newSupplier, ...suppliers]);
    setShowModal(false);
  };

  const filtered = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fornecedores</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie e descubra novos fornecedores de materiais.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Fornecedor
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, categoria ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filtros
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">sort</span>
            Ordenar
          </button>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nome / Categoria</th>
                <th className="px-6 py-4 font-medium">Localização</th>
                <th className="px-6 py-4 font-medium">Avaliação</th>
                <th className="px-6 py-4 font-medium">Último Pedido</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{supplier.name}</div>
                    <div className="text-gray-500 text-xs">{supplier.category}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                      {supplier.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      <span className="font-medium text-gray-700">{supplier.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{supplier.lastOrder}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                        supplier.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {supplier.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Fornecedor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">Novo Fornecedor</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Fornecedor *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ex: Construtora Silva Ltda."
                  className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    {SUPPLIER_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Localização *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                    placeholder="Ex: São Paulo, SP"
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(11) 99999-8888"
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contato@fornecedor.com"
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add_business</span>
                Adicionar Fornecedor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
