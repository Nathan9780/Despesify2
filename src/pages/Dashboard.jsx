import React from "react";
import { Link } from "react-router-dom";

export function Dashboard() {
  // Dados mockados
  const user = { name: "Nathan Silva" };

  const stats = {
    totalBudget: 120000,
    totalSpent: 43500,
    available: 76500,
    projects: 5,
    employees: 12,
    tasksPending: 18,
    investmentsReceived: 30000,
    investmentGoal: 100000,
  };

  const projects = [
    {
      id: 1,
      name: "Reforma da Casa",
      category: "Construção",
      budget: 50000,
      spent: 20000,
      progress: 60,
      visibility: "private",
    },
    {
      id: 2,
      name: "Ampliação da Empresa",
      category: "Comercial",
      budget: 200000,
      spent: 80000,
      progress: 40,
      visibility: "public",
    },
    {
      id: 3,
      name: "Loft Distrito Histórico",
      category: "Renovação",
      budget: 120000,
      spent: 38000,
      progress: 32,
      visibility: "public",
    },
  ];

  const tasks = [
    { id: 1, title: "Comprar cimento", priority: "high", due: "Amanhã" },
    { id: 2, title: "Pagar eletricista", priority: "medium", due: "Hoje" },
    {
      id: 3,
      title: "Contratar pintor",
      priority: "low",
      due: "Semana que vem",
    },
    { id: 4, title: "Atualizar orçamento", priority: "medium", due: "Amanhã" },
  ];

  const team = [
    { name: "João Silva", role: "Pedreiro", status: "paid" },
    { name: "Carlos Souza", role: "Eletricista", status: "pending" },
    { name: "Maria Oliveira", role: "Arquiteta", status: "paid" },
  ];

  const notifications = [
    { id: 1, text: "Novo investidor interessado", time: "5 min" },
    { id: 2, text: "Pagamento pendente para João Silva", time: "1 hora" },
    { id: 3, text: "Nova mensagem recebida", time: "3 horas" },
    { id: 4, text: "Tarefa vence amanhã", time: "1 dia" },
  ];

  const publicProjects = [
    {
      name: "Construção Residencial",
      goal: 150000,
      raised: 50000,
      progress: 33,
    },
    { name: "Parque Urbano", goal: 300000, raised: 120000, progress: 40 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Título e boas-vindas */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Olá, {user.name} 👋
          </h1>
          <p className="text-sm text-gray-500">
            Resumo dos seus projetos e atividades
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          Novo Projeto
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              account_balance_wallet
            </span>
            Orçamento Total
          </p>
          <p className="text-lg font-bold text-blue-600">
            R$ {stats.totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Gastos Totais
          </p>
          <p className="text-lg font-bold text-gray-800">
            R$ {stats.totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">savings</span>
            Saldo Disponível
          </p>
          <p className="text-lg font-bold text-green-600">
            R$ {stats.available.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              folder_open
            </span>
            Projetos Ativos
          </p>
          <p className="text-lg font-bold text-gray-800">{stats.projects}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">groups</span>
            Funcionários
          </p>
          <p className="text-lg font-bold text-gray-800">{stats.employees}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              assignment_late
            </span>
            Tarefas Pendentes
          </p>
          <p className="text-lg font-bold text-red-500">{stats.tasksPending}</p>
        </div>
      </div>

      {/* Gráfico + Investimentos + Notificações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico financeiro */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-blue-600">
              show_chart
            </span>
            Receitas x Despesas
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {[
              { month: "Jan", revenue: 12000, expense: 8000 },
              { month: "Fev", revenue: 15000, expense: 9500 },
              { month: "Mar", revenue: 18000, expense: 12000 },
              { month: "Abr", revenue: 14000, expense: 11000 },
              { month: "Mai", revenue: 20000, expense: 13000 },
              { month: "Jun", revenue: 22000, expense: 15000 },
            ].map((item) => {
              const max = 25000;
              const rev = (item.revenue / max) * 100;
              const exp = (item.expense / max) * 100;
              return (
                <div
                  key={item.month}
                  className="flex flex-col items-center flex-1"
                >
                  <div className="flex items-end gap-1 h-40">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-5 bg-blue-500 rounded-t"
                        style={{ height: `${rev}%`, minHeight: 4 }}
                      ></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className="w-5 bg-green-500 rounded-t"
                        style={{ height: `${exp}%`, minHeight: 4 }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span> Receitas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span> Despesas
            </span>
          </div>
        </div>

        {/* Investimentos + Notificações */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm mb-2">
              <span className="material-symbols-outlined text-green-600">
                payments
              </span>
              Investimentos
            </h3>
            <p className="text-xs text-gray-500">Captado</p>
            <p className="text-lg font-bold text-green-600">
              R$ {stats.investmentsReceived.toLocaleString()}
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Meta: R$ {stats.investmentGoal.toLocaleString()}</span>
                <span>
                  {Math.round(
                    (stats.investmentsReceived / stats.investmentGoal) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.investmentsReceived / stats.investmentGoal) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <button className="mt-3 w-full text-xs text-green-600 border border-green-300 rounded-lg py-1.5 hover:bg-green-50">
              Ver detalhes
            </button>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm mb-2">
              <span className="material-symbols-outlined text-blue-600">
                notifications
              </span>
              Notificações
            </h3>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-sm text-blue-400">
                    circle
                  </span>
                  <div>
                    <p className="text-xs text-gray-700">{n.text}</p>
                    <span className="text-[10px] text-gray-400">
                      {n.time} atrás
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 text-xs text-blue-600 hover:underline">
              Ver todas
            </button>
          </div>
        </div>
      </div>

      {/* Projetos + Tarefas + Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Meus Projetos (2 colunas) */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">
                folder_shared
              </span>
              Meus Projetos
            </h3>
            <Link
              to="/projects"
              className="text-sm text-blue-600 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition"
              >
                <div className="h-20 bg-gradient-to-r from-blue-600 to-blue-800 relative">
                  <span
                    className={`absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${p.visibility === "public" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {p.visibility === "public" ? "🌎 Público" : "🔒 Privado"}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {p.name}
                  </h4>
                  <p className="text-xs text-gray-500">{p.category}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>R$ {p.budget.toLocaleString()}</span>
                    <span>Gasto: R$ {p.spent.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                  <button className="mt-3 w-full text-xs text-blue-600 border border-blue-300 rounded-lg py-1.5 hover:bg-blue-50">
                    Acessar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna direita: Tarefas e Equipe */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm mb-2">
              <span className="material-symbols-outlined text-blue-600">
                checklist
              </span>
              Próximas Tarefas
            </h3>
            <div className="space-y-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                >
                  <span
                    className={`material-symbols-outlined text-sm ${t.priority === "high" ? "text-red-500" : t.priority === "medium" ? "text-yellow-500" : "text-blue-500"}`}
                  >
                    {t.priority === "high"
                      ? "priority_high"
                      : "radio_button_unchecked"}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{t.title}</p>
                    <span className="text-[10px] text-gray-400">{t.due}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.priority === "high" ? "bg-red-100 text-red-600" : t.priority === "medium" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/tasks"
              className="mt-2 text-xs text-blue-600 hover:underline block text-center"
            >
              Ver todas
            </Link>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm mb-2">
              <span className="material-symbols-outlined text-green-600">
                groups
              </span>
              Últimos Contratados
            </h3>
            <div className="space-y-3">
              {team.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                    {m.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-gray-500">{m.role}</p>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full ${m.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {m.status === "paid" ? "✅ Pago" : "⏳ Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projetos Públicos em Destaque */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">
              public
            </span>
            Projetos Públicos em Destaque
          </h3>
          <Link
            to="/investors"
            className="text-sm text-blue-600 hover:underline"
          >
            Ver vitrine
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {publicProjects.map((p, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-4 hover:shadow transition"
            >
              <h4 className="font-medium text-gray-800">{p.name}</h4>
              <p className="text-xs text-gray-500">
                Meta: R$ {p.goal.toLocaleString()}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Captado: R$ {p.raised.toLocaleString()}</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
              </div>
              <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg py-1.5">
                Ver Projeto
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
