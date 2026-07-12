import React, { useState, useMemo } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { useRevenues } from "../hooks/useRevenues";
import { useBudgets } from "../hooks/useBudgets";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "moradia", label: "Moradia", icon: "home", color: "#6366f1" },
  { id: "alimentacao", label: "Alimentação", icon: "restaurant", color: "#f59e0b" },
  { id: "transporte", label: "Transporte", icon: "directions_car", color: "#10b981" },
  { id: "saude", label: "Saúde", icon: "favorite", color: "#ef4444" },
  { id: "educacao", label: "Educação", icon: "school", color: "#3b82f6" },
  { id: "lazer", label: "Lazer", icon: "sports_esports", color: "#8b5cf6" },
  { id: "vestuario", label: "Vestuário", icon: "checkroom", color: "#ec4899" },
  { id: "impostos", label: "Impostos", icon: "account_balance", color: "#64748b" },
  { id: "operacional", label: "Operacional", icon: "business_center", color: "#0ea5e9" },
  { id: "marketing", label: "Marketing", icon: "campaign", color: "#f97316" },
  { id: "pessoal", label: "Pessoal", icon: "person", color: "#14b8a6" },
  { id: "outros", label: "Outros", icon: "more_horiz", color: "#94a3b8" },
];

const PAYMENT_METHODS = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix", "Boleto", "Transferência"];
const RECURRENCE = ["Único", "Mensal", "Semanal", "Anual"];

const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export function Expenses() {
  const { expenses, isLoading, error, createExpense, updateExpense, deleteExpense } = useExpenses();
  const { revenues, isLoading: revLoading, createRevenue, updateRevenue, deleteRevenue } = useRevenues();

  const [financeTab, setFinanceTab] = useState("expenses");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [activeView, setActiveView] = useState("list");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "outros",
    date: new Date().toISOString().split("T")[0],
    payment_method: "Pix",
    recurrence: "Único",
    notes: "",
  });

  const [showRevModal, setShowRevModal] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [revForm, setRevForm] = useState({
    title: "",
    amount: "",
    category: "outros",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const monthNum = parseInt(filterMonth.split('-')[1]);
  const yearNum = parseInt(filterMonth.split('-')[0]);
  const { budgets, setBudget } = useBudgets(monthNum, yearNum);
  const [editingBudgetCat, setEditingBudgetCat] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");

  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);

  const prevMonth = useMemo(() => {
    const [y, m] = filterMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [filterMonth]);

  const nextMonth = useMemo(() => {
    const [y, m] = filterMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [filterMonth]);

  const monthLabel = useMemo(() => {
    const [y, m] = filterMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }, [filterMonth]);

  const filtered = useMemo(() => {
    let list = expenses;
    if (filterMonth) list = list.filter((e) => e.date?.startsWith(filterMonth));
    if (filterCategory !== "all") list = list.filter((e) => e.category === filterCategory);
    if (searchTerm) list = list.filter((e) => e.title?.toLowerCase().includes(searchTerm.toLowerCase()) || e.notes?.toLowerCase().includes(searchTerm.toLowerCase()));

    switch (sortBy) {
      case "date_asc": list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case "amount_desc": list = [...list].sort((a, b) => b.amount - a.amount); break;
      case "amount_asc": list = [...list].sort((a, b) => a.amount - b.amount); break;
      default: list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return list;
  }, [expenses, filterMonth, filterCategory, searchTerm, sortBy]);

  const revFiltered = useMemo(() => {
    let list = revenues;
    if (filterMonth) list = list.filter((e) => e.date?.startsWith(filterMonth));
    if (filterCategory !== "all") list = list.filter((e) => e.category === filterCategory);
    if (searchTerm) list = list.filter((e) => e.title?.toLowerCase().includes(searchTerm.toLowerCase()) || e.notes?.toLowerCase().includes(searchTerm.toLowerCase()));

    switch (sortBy) {
      case "date_asc": list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case "amount_desc": list = [...list].sort((a, b) => b.amount - a.amount); break;
      case "amount_asc": list = [...list].sort((a, b) => a.amount - b.amount); break;
      default: list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return list;
  }, [revenues, filterMonth, filterCategory, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);
    const byCategory = CATEGORIES.map((cat) => ({
      ...cat,
      total: filtered.filter((e) => e.category === cat.id).reduce((s, e) => s + (e.amount || 0), 0),
      count: filtered.filter((e) => e.category === cat.id).length,
    })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

    const avgPerDay = (() => {
      if (!filtered.length) return 0;
      const [y, m] = filterMonth.split("-").map(Number);
      const days = new Date(y, m, 0).getDate();
      return total / days;
    })();

    return { total, byCategory, avgPerDay, count: filtered.length };
  }, [filtered, filterMonth]);

  const revStats = useMemo(() => {
    const total = revFiltered.reduce((s, e) => s + (e.amount || 0), 0);
    const byCategory = CATEGORIES.map((cat) => ({
      ...cat,
      total: revFiltered.filter((e) => e.category === cat.id).reduce((s, e) => s + (e.amount || 0), 0),
      count: revFiltered.filter((e) => e.category === cat.id).length,
    })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

    return { total, byCategory, count: revFiltered.length };
  }, [revFiltered]);

  const cashflowEntries = useMemo(() => {
    const expItems = filtered.map(e => ({ ...e, entryType: 'expense', displayAmount: -(e.amount || 0) }));
    const revItems = revFiltered.map(e => ({ ...e, entryType: 'revenue', displayAmount: e.amount || 0 }));
    return [...expItems, ...revItems].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filtered, revFiltered]);

  const cashflowTotalReceitas = useMemo(() => revFiltered.reduce((s, e) => s + (e.amount || 0), 0), [revFiltered]);
  const cashflowTotalDespesas = useMemo(() => filtered.reduce((s, e) => s + (e.amount || 0), 0), [filtered]);
  const cashflowSaldo = cashflowTotalReceitas - cashflowTotalDespesas;

  const openAdd = () => {
    setEditingExpense(null);
    setForm({ title: "", amount: "", category: "outros", date: new Date().toISOString().split("T")[0], payment_method: "Pix", recurrence: "Único", notes: "" });
    setShowModal(true);
  };

  const openEdit = (exp) => {
    setEditingExpense(exp);
    setForm({
      title: exp.title || "",
      amount: exp.amount?.toString() || "",
      category: exp.category || "outros",
      date: exp.date || new Date().toISOString().split("T")[0],
      payment_method: exp.payment_method || "Pix",
      recurrence: exp.recurrence || "Único",
      notes: exp.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    setIsSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editingExpense) {
        await updateExpense.mutateAsync({ id: editingExpense.id, ...payload });
        toast.success("Gasto atualizado!");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Gasto registrado!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Erro ao salvar gasto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apagar este gasto?")) return;
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Gasto removido!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openRevAdd = () => {
    setEditingRevenue(null);
    setRevForm({ title: "", amount: "", category: "outros", date: new Date().toISOString().split("T")[0], notes: "" });
    setShowRevModal(true);
  };

  const openRevEdit = (rev) => {
    setEditingRevenue(rev);
    setRevForm({
      title: rev.title || "",
      amount: rev.amount?.toString() || "",
      category: rev.category || "outros",
      date: rev.date || new Date().toISOString().split("T")[0],
      notes: rev.notes || "",
    });
    setShowRevModal(true);
  };

  const handleRevSave = async (e) => {
    e.preventDefault();
    if (!revForm.title.trim() || !revForm.amount) return;
    setIsSaving(true);
    try {
      const payload = { ...revForm, amount: parseFloat(revForm.amount) };
      if (editingRevenue) {
        await updateRevenue.mutateAsync({ id: editingRevenue.id, ...payload });
        toast.success("Receita atualizada!");
      } else {
        await createRevenue.mutateAsync(payload);
        toast.success("Receita registrada!");
      }
      setShowRevModal(false);
    } catch (err) {
      toast.error(err.message || "Erro ao salvar receita");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevDelete = async (id) => {
    if (!window.confirm("Apagar esta receita?")) return;
    try {
      await deleteRevenue.mutateAsync(id);
      toast.success("Receita removida!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return {
          title: obj.descricao || obj.title || obj.descricao || 'Importado',
          amount: parseFloat(obj.valor || obj.amount || 0),
          category: obj.categoria || obj.category || 'outros',
          date: obj.data || obj.date || new Date().toISOString().split('T')[0],
          payment_method: obj.pagamento || obj.payment_method || 'Pix',
          notes: obj.observacoes || obj.notes || 'Importado via CSV',
        };
      }).filter(d => d.amount > 0);
      setCsvData(data);
      setCsvPreview(data.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleCSVConfirm = async () => {
    if (!csvData.length) return;
    try {
      for (const item of csvData) {
        await createExpense.mutateAsync(item);
      }
      toast.success(`${csvData.length} gastos importados!`);
      setShowCSVModal(false);
      setCsvData([]);
      setCsvPreview([]);
      document.getElementById('csv-file-input') && (document.getElementById('csv-file-input').value = '');
    } catch (err) {
      toast.error(err.message || "Erro ao importar CSV");
    }
  };

  const activeLoading = financeTab === "revenues" ? revLoading : isLoading;

  if (isLoading || revLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-500">Carregando...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <span className="material-symbols-outlined text-6xl text-red-400 block">error</span>
        <p className="text-xl font-semibold text-red-600 mt-4">Erro ao carregar gastos</p>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
        <p className="text-xs text-orange-600 mt-3 max-w-sm">
          Se a tabela "expenses" não existe, crie-a no Supabase SQL Editor com o script abaixo.
        </p>
        <pre className="text-left text-xs bg-gray-100 p-3 rounded mt-2 max-w-sm overflow-auto">
{`CREATE TABLE expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric NOT NULL,
  category text DEFAULT 'outros',
  date date NOT NULL,
  payment_method text,
  recurrence text DEFAULT 'Único',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON expenses
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;`}
        </pre>
        <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          Tentar novamente
        </button>
      </div>
    </div>
  );

  const maxCatAmount = stats.byCategory[0]?.total || 1;
  const maxRevCatAmount = revStats.byCategory[0]?.total || 1;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .expense-row { transition: all 0.2s ease; }
        .expense-row:hover { background: rgba(255,255,255,0.9); transform: translateX(2px); }
        .cat-bar { transition: width 0.8s cubic-bezier(0.22,1,0.36,1); }
        .modal-bg { background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
        .pie-slice { transition: opacity 0.2s; }
        .pie-slice:hover { opacity: 0.8; }
      `}</style>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit fade-up" style={{ animationDelay: "0.03s" }}>
        <button onClick={() => setFinanceTab("expenses")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${financeTab === "expenses" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
          <span className="material-symbols-outlined text-sm align-middle">payments</span> Despesas
        </button>
        <button onClick={() => setFinanceTab("revenues")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${financeTab === "revenues" ? "bg-green-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
          <span className="material-symbols-outlined text-sm align-middle">account_balance</span> Receitas
        </button>
        <button onClick={() => setFinanceTab("cashflow")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${financeTab === "cashflow" ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
          <span className="material-symbols-outlined text-sm align-middle">swap_horiz</span> Fluxo de Caixa
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 fade-up" style={{ animationDelay: "0.05s" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {financeTab === "expenses" && <><span className="material-symbols-outlined text-red-500">payments</span> Controle de Gastos</>}
            {financeTab === "revenues" && <><span className="material-symbols-outlined text-green-500">account_balance</span> Controle de Receitas</>}
            {financeTab === "cashflow" && <><span className="material-symbols-outlined text-blue-500">swap_horiz</span> Fluxo de Caixa</>}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {financeTab === "expenses" && "Acompanhe e gerencie todas as suas despesas."}
            {financeTab === "revenues" && "Acompanhe e gerencie todas as suas receitas."}
            {financeTab === "cashflow" && "Visão consolidada de receitas e despesas."}
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          {financeTab === "expenses" && (
            <>
              <button
                onClick={() => { setShowCSVModal(true); setCsvData([]); setCsvPreview([]); }}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">upload_file</span>
                Importar CSV
              </button>
              <button
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Novo Gasto
              </button>
            </>
          )}
          {financeTab === "revenues" && (
            <button
              onClick={openRevAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Nova Receita
            </button>
          )}
        </div>
      </div>

      {/* Navegação de mês */}
      <div className="flex items-center gap-2 mb-6 fade-up" style={{ animationDelay: "0.08s" }}>
        <button onClick={() => setFilterMonth(prevMonth)} className="p-2 rounded-lg hover:bg-white/70 transition text-gray-500 hover:text-gray-800">
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        <span className="text-sm font-semibold text-gray-700 capitalize min-w-[160px] text-center">{monthLabel}</span>
        <button onClick={() => setFilterMonth(nextMonth)} className="p-2 rounded-lg hover:bg-white/70 transition text-gray-500 hover:text-gray-800">
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
        <button
          onClick={() => {
            const now = new Date();
            setFilterMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
          }}
          className="ml-2 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition font-medium"
        >
          Mês atual
        </button>
      </div>

      {/* Summary Cards */}
      {financeTab === "expenses" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid var(--color-primary)" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary)" }}>credit_card</span>
              Total do Mês
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
              R$ {stats.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{stats.count} lançamento{stats.count !== 1 ? "s" : ""}</p>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid var(--color-primary-light)" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary-light)" }}>calendar_today</span>
              Média Diária
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
              R$ {stats.avgPerDay.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>por dia</p>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid var(--color-primary-dark)" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary-dark)" }}>category</span>
              Maior Categoria
            </p>
            {stats.byCategory[0] ? (
              <>
                <p className="text-base font-bold mt-1 truncate" style={{ color: "var(--color-text)" }}>{stats.byCategory[0].label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>R$ {stats.byCategory[0].total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </>
            ) : (
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>–</p>
            )}
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid #1B4F72" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#1B4F72" }}>pie_chart</span>
              Categorias
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--color-text)" }}>{stats.byCategory.length}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>com gastos</p>
          </div>
        </div>
      )}

      {financeTab === "revenues" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid #10b981" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#10b981" }}>account_balance</span>
              Total de Receitas
            </p>
            <p className="text-xl font-bold mt-1 text-green-600">
              R$ {revStats.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{revStats.count} lançamento{revStats.count !== 1 ? "s" : ""}</p>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid #6366f1" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#6366f1" }}>category</span>
              Maior Categoria
            </p>
            {revStats.byCategory[0] ? (
              <>
                <p className="text-base font-bold mt-1 truncate" style={{ color: "var(--color-text)" }}>{revStats.byCategory[0].label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>R$ {revStats.byCategory[0].total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </>
            ) : (
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>–</p>
            )}
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid #f59e0b" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#f59e0b" }}>pie_chart</span>
              Categorias
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--color-text)" }}>{revStats.byCategory.length}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>com receitas</p>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid #3b82f6" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#3b82f6" }}>trending_up</span>
              Ticket Médio
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
              {revStats.count > 0 ? `R$ ${(revStats.total / revStats.count).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "–"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>por receita</p>
          </div>
        </div>
      )}

      {financeTab === "cashflow" && (
        <div className="grid grid-cols-3 gap-4 mb-6 fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid #10b981" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm text-green-500">arrow_upward</span>
              Total Receitas
            </p>
            <p className="text-xl font-bold mt-1 text-green-600">
              R$ {cashflowTotalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: "4px solid #ef4444" }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm text-red-500">arrow_downward</span>
              Total Despesas
            </p>
            <p className="text-xl font-bold mt-1 text-red-600">
              – R$ {cashflowTotalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ borderLeft: `4px solid ${cashflowSaldo >= 0 ? "#3b82f6" : "#ef4444"}` }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: "#3b82f6" }}>account_balance_wallet</span>
              Saldo
            </p>
            <p className={`text-xl font-bold mt-1 ${cashflowSaldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {cashflowSaldo >= 0 ? "+" : "–"} R$ {Math.abs(cashflowSaldo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {financeTab === "expenses" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[160px]">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Buscar gasto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas categorias</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date_desc">Mais recentes</option>
                <option value="date_asc">Mais antigos</option>
                <option value="amount_desc">Maior valor</option>
                <option value="amount_asc">Menor valor</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300">receipt_long</span>
                <p className="text-gray-500 font-medium mt-3">Nenhum gasto encontrado</p>
                <p className="text-sm text-gray-400 mt-1">Adicione um novo gasto usando o botão acima.</p>
                <button onClick={openAdd} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                  + Adicionar Gasto
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                {filtered.map((exp, i) => {
                  const cat = getCat(exp.category);
                  return (
                    <div
                      key={exp.id}
                      className={`expense-row flex items-center gap-4 px-4 py-3.5 ${i < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "20" }}>
                        <span className="material-symbols-outlined text-lg" style={{ color: cat.color }}>{cat.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{exp.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400">
                            {exp.date ? new Date(exp.date + "T12:00:00").toLocaleDateString("pt-BR") : "–"}
                          </span>
                          <span className="text-gray-200">•</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: cat.color + "15", color: cat.color }}>{cat.label}</span>
                          {exp.payment_method && <span className="text-xs text-gray-400">· {exp.payment_method}</span>}
                          {exp.recurrence && exp.recurrence !== "Único" && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">🔄 {exp.recurrence}</span>
                          )}
                        </div>
                        {exp.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{exp.notes}</p>}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-red-600 text-sm">
                          – R$ {(exp.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4 fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <span className="material-symbols-outlined text-base text-blue-500">bar_chart</span>
                Por Categoria
              </h3>
              {stats.byCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sem dados para este período</p>
              ) : (
                <div className="space-y-3">
                  {stats.byCategory.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>{cat.icon}</span>
                          <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                          <span className="text-[10px] text-gray-400">({cat.count})</span>
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                          R$ {cat.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full cat-bar"
                          style={{ width: `${(cat.total / maxCatAmount) * 100}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                        {stats.total > 0 ? ((cat.total / stats.total) * 100).toFixed(1) : 0}% do total
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orçamento Mensal */}
            <div className="glass-card rounded-xl p-5">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-green-500">savings</span>
                Orçamento Mensal
              </h4>
              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const spent = stats.byCategory.find(c => c.id === cat.id)?.total || 0;
                  const budget = budgets.find(b => b.category === cat.id);
                  const limit = budget?.limit_amount || 0;
                  const pct = limit > 0 ? (spent / limit) * 100 : 0;
                  if (spent === 0 && limit === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm" style={{color: cat.color}}>{cat.icon}</span>
                          <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {editingBudgetCat === cat.id ? (
                            <div className="flex items-center gap-1">
                              <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="w-20 p-1 text-xs border rounded" placeholder="Limite" />
                              <button onClick={() => { setBudget.mutate({ category: cat.id, limit_amount: parseFloat(budgetInput) || 0 }); setEditingBudgetCat(null); }} className="text-xs text-blue-600">ok</button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingBudgetCat(cat.id); setBudgetInput(limit.toString()); }} className="text-xs font-bold text-gray-700 hover:text-blue-600">
                              {limit > 0 ? `R$ ${limit.toLocaleString()}` : 'Definir'}
                            </button>
                          )}
                        </div>
                      </div>
                      {limit > 0 && (
                        <>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981'}} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                            R$ {spent.toLocaleString()} / R$ {limit.toLocaleString()} ({pct.toFixed(0)}%)
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <span className="material-symbols-outlined text-base text-yellow-500">lightbulb</span>
                Dicas Financeiras
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                {stats.total > 5000 && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                    ⚠️ Seus gastos esse mês estão elevados. Revise os maiores itens.
                  </div>
                )}
                {stats.byCategory[0]?.total / stats.total > 0.5 && (
                  <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                    📊 <strong>{stats.byCategory[0]?.label}</strong> representa mais de 50% dos gastos.
                  </div>
                )}
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  💡 A regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança.
                </div>
                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                  ✅ Registre todos os gastos, mesmo os pequenos, para ter controle total.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {financeTab === "revenues" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[160px]">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Buscar receita..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas categorias</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date_desc">Mais recentes</option>
                <option value="date_asc">Mais antigos</option>
                <option value="amount_desc">Maior valor</option>
                <option value="amount_asc">Menor valor</option>
              </select>
            </div>

            {revFiltered.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300">account_balance</span>
                <p className="text-gray-500 font-medium mt-3">Nenhuma receita encontrada</p>
                <p className="text-sm text-gray-400 mt-1">Adicione uma nova receita usando o botão acima.</p>
                <button onClick={openRevAdd} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                  + Adicionar Receita
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                {revFiltered.map((rev, i) => {
                  const cat = getCat(rev.category);
                  return (
                    <div
                      key={rev.id}
                      className={`expense-row flex items-center gap-4 px-4 py-3.5 ${i < revFiltered.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "20" }}>
                        <span className="material-symbols-outlined text-lg" style={{ color: cat.color }}>{cat.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{rev.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400">
                            {rev.date ? new Date(rev.date + "T12:00:00").toLocaleDateString("pt-BR") : "–"}
                          </span>
                          <span className="text-gray-200">•</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: cat.color + "15", color: cat.color }}>{cat.label}</span>
                        </div>
                        {rev.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{rev.notes}</p>}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-green-600 text-sm">
                          + R$ {(rev.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openRevEdit(rev)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleRevDelete(rev.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4 fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <span className="material-symbols-outlined text-base text-green-500">bar_chart</span>
                Por Categoria (Receitas)
              </h3>
              {revStats.byCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sem dados para este período</p>
              ) : (
                <div className="space-y-3">
                  {revStats.byCategory.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>{cat.icon}</span>
                          <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                          <span className="text-[10px] text-gray-400">({cat.count})</span>
                        </div>
                        <span className="text-xs font-bold text-green-700">
                          R$ {cat.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full cat-bar"
                          style={{ width: `${(cat.total / maxRevCatAmount) * 100}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                        {revStats.total > 0 ? ((cat.total / revStats.total) * 100).toFixed(1) : 0}% do total
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {financeTab === "cashflow" && (
        <div className="fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-700">Lançamentos do Período</h3>
            </div>
            {cashflowEntries.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300">receipt_long</span>
                <p className="text-gray-500 font-medium mt-3">Nenhum lançamento no período</p>
              </div>
            ) : (
              cashflowEntries.map((entry, i) => {
                const cat = getCat(entry.category);
                const isExpense = entry.entryType === 'expense';
                return (
                  <div
                    key={`${entry.entryType}-${entry.id}`}
                    className={`expense-row flex items-center gap-4 px-5 py-3.5 ${i < cashflowEntries.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "20" }}>
                      <span className="material-symbols-outlined text-lg" style={{ color: cat.color }}>{cat.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400">
                          {entry.date ? new Date(entry.date + "T12:00:00").toLocaleDateString("pt-BR") : "–"}
                        </span>
                        <span className="text-gray-200">•</span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: cat.color + "15", color: cat.color }}>{cat.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isExpense ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                          {isExpense ? "Despesa" : "Receita"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${isExpense ? "text-red-600" : "text-green-600"}`}>
                        {isExpense ? "–" : "+"} R$ {Math.abs(entry.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Gasto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {editingExpense ? "Editar Gasto" : "Novo Gasto"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Ex: Conta de luz, Mercado..."
                  className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    placeholder="0,00"
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition ${form.category === cat.id ? "border-blue-500 bg-blue-50" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>{cat.icon}</span>
                      <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recorrência</label>
                  <select
                    value={form.recurrence}
                    onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    {RECURRENCE.map((r) => <option key={r}>{r}</option>)}
                  </select>
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
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSaving ? "Salvando..." : editingExpense ? "Salvar Alterações" : "Registrar Gasto"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Receita */}
      {showRevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg p-4" onClick={() => setShowRevModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {editingRevenue ? "Editar Receita" : "Nova Receita"}
              </h3>
              <button onClick={() => setShowRevModal(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRevSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição *</label>
                <input
                  type="text"
                  value={revForm.title}
                  onChange={(e) => setRevForm({ ...revForm, title: e.target.value })}
                  required
                  placeholder="Ex: Salário, Freelance..."
                  className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={revForm.amount}
                    onChange={(e) => setRevForm({ ...revForm, amount: e.target.value })}
                    required
                    placeholder="0,00"
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data *</label>
                  <input
                    type="date"
                    value={revForm.date}
                    onChange={(e) => setRevForm({ ...revForm, date: e.target.value })}
                    required
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRevForm({ ...revForm, category: cat.id })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition ${revForm.category === cat.id ? "border-green-500 bg-green-50" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>{cat.icon}</span>
                      <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  value={revForm.notes}
                  onChange={(e) => setRevForm({ ...revForm, notes: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSaving ? "Salvando..." : editingRevenue ? "Salvar Alterações" : "Registrar Receita"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal CSV Import */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg p-4" onClick={() => { setShowCSVModal(false); setCsvData([]); setCsvPreview([]); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">upload_file</span>
                Importar CSV
              </h3>
              <button onClick={() => { setShowCSVModal(false); setCsvData([]); setCsvPreview([]); }} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Selecione um arquivo CSV com colunas: <strong>descricao, valor, categoria, data, pagamento, observacoes</strong>.
              </p>

              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition bg-gray-50">
                <span className="material-symbols-outlined text-gray-400">file_upload</span>
                <span className="text-sm text-gray-600">Clique para selecionar arquivo CSV</span>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="hidden"
                />
              </label>

              {csvPreview.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview (primeiros {csvPreview.length} de {csvData.length} itens):</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 text-left font-medium text-gray-600">Descrição</th>
                          <th className="p-2 text-left font-medium text-gray-600">Valor</th>
                          <th className="p-2 text-left font-medium text-gray-600">Categoria</th>
                          <th className="p-2 text-left font-medium text-gray-600">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((item, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="p-2 text-gray-800">{item.title}</td>
                            <td className="p-2 text-red-600 font-medium">R$ {item.amount.toFixed(2)}</td>
                            <td className="p-2 text-gray-600">{getCat(item.category).label}</td>
                            <td className="p-2 text-gray-600">{item.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={handleCSVConfirm}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Importar {csvData.length} gasto{csvData.length !== 1 ? "s" : ""}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
