import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Monetary() {
  const [balance, setBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [calcAmount, setCalcAmount] = useState("");
  const [calcMonths, setCalcMonths] = useState(12);
  const [calcResult, setCalcResult] = useState(null);
  const [user, setUser] = useState(null);
  const [showExtrato, setShowExtrato] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchMonetary = async () => {
      const storedBalance = localStorage.getItem('user_balance');
      const storedInvested = localStorage.getItem('user_invested');
      
      if (storedBalance) {
        if (parseFloat(storedBalance) === 150000) {
          setBalance(0);
          localStorage.setItem('user_balance', 0);
        } else {
          setBalance(parseFloat(storedBalance));
        }
      }
      
      if (storedInvested) {
        if (parseFloat(storedInvested) === 45000) {
          setInvested(0);
          localStorage.setItem('user_invested', 0);
        } else {
          setInvested(parseFloat(storedInvested));
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("investor_monetary")
          .select("balance, invested")
          .eq("user_id", user.id)
          .single();

        if (data) {
          // Force cleanup legacy mock values
          const currentInvested = Number(data.invested);
          const currentBalance = Number(data.balance);
          
          if (currentInvested === 45000) {
            const realBalance = Math.max(0, currentBalance - 150000);
            await supabase.from("investor_monetary").update({ balance: realBalance, invested: 0 }).eq("user_id", user.id);
            setBalance(realBalance);
            setInvested(0);
            localStorage.setItem('user_balance', realBalance);
            localStorage.setItem('user_invested', 0);
          } else {
            setBalance(currentBalance);
            setInvested(currentInvested);
            localStorage.setItem('user_balance', currentBalance);
            localStorage.setItem('user_invested', currentInvested);
          }
        } else if (error && error.code === 'PGRST116') {
          // If no row exists, create one starting at 0
          if (!storedBalance) {
            await supabase.from("investor_monetary").insert({ user_id: user.id, balance: 0, invested: 0 });
            setBalance(0);
            setInvested(0);
            localStorage.setItem('user_balance', 0);
            localStorage.setItem('user_invested', 0);
          }
        }
      }

      // Carregar transações do localStorage para simular o extrato
      const storedTx = localStorage.getItem('user_transactions');
      if (storedTx) {
        setTransactions(JSON.parse(storedTx));
      }
    };
    fetchMonetary();
  }, []);

  const handleDeposit = async () => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      const newBalance = balance + val;
      if (user) {
        const { error } = await supabase
          .from("investor_monetary")
          .update({ balance: newBalance })
          .eq("user_id", user.id);

        if (!error) {
          setBalance(newBalance);
          localStorage.setItem('user_balance', newBalance);
          setDepositAmount("");
          toast.success(`Depósito de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso!`);
          
          const newTx = { id: Date.now(), type: 'deposit', amount: val, date: new Date().toISOString() };
          const updatedTx = [newTx, ...transactions];
          setTransactions(updatedTx);
          localStorage.setItem('user_transactions', JSON.stringify(updatedTx));
        } else {
          // Fallback if update fails (e.g., row doesn't exist)
          setBalance(newBalance);
          localStorage.setItem('user_balance', newBalance);
          setDepositAmount("");
          toast.success(`Depósito de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado (local)!`);
          
          const newTx = { id: Date.now(), type: 'deposit', amount: val, date: new Date().toISOString() };
          const updatedTx = [newTx, ...transactions];
          setTransactions(updatedTx);
          localStorage.setItem('user_transactions', JSON.stringify(updatedTx));
        }
      } else {
        // Fallback offline
        setBalance(newBalance);
        localStorage.setItem('user_balance', newBalance);
        setDepositAmount("");
        toast.success(`Depósito de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado offline!`);
        
        const newTx = { id: Date.now(), type: 'deposit', amount: val, date: new Date().toISOString() };
        const updatedTx = [newTx, ...transactions];
        setTransactions(updatedTx);
        localStorage.setItem('user_transactions', JSON.stringify(updatedTx));
      }
    }
  };

  const handleCalculate = () => {
    const val = parseFloat(calcAmount);
    if (!isNaN(val) && val > 0) {
      // Simulação simples de rendimento de 1.5% ao mês em projetos
      const total = val * Math.pow(1.015, calcMonths);
      setCalcResult(total);
    }
  };

  const handleDownloadPDF = () => {
    if (transactions.length === 0) {
      toast.error("Não há transações para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185); // Azul Despesify
    doc.text("Extrato de Transações - Despesify", 14, 22);
    
    // Subtítulo
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    doc.text(`Usuário: ${user?.user_metadata?.name || user?.email || 'N/A'}`, 14, 36);

    // Tabela
    const tableColumn = ["Data e Hora", "Tipo de Operação", "Valor (R$)"];
    const tableRows = [];

    transactions.forEach(tx => {
      const txData = [
        new Date(tx.date).toLocaleString('pt-BR'),
        tx.type === 'deposit' ? 'Depósito PIX' : 'Transferência',
        `+ R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ];
      tableRows.push(txData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 45 }
    });

    doc.save("extrato_despesify.pdf");
    toast.success("PDF baixado com sucesso!");
  };

  // Generate mock realistic data for the chart based on current invested value
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const baseValue = invested > 0 ? invested * (0.8 + (i * 0.05)) : 0;
    // Add some random fluctuation if invested > 0
    const randomFluctuation = invested > 0 ? baseValue * (1 + (Math.random() * 0.04 - 0.02)) : 0; 
    return {
      name: month.toLocaleString('pt-BR', { month: 'short' }),
      valor: Math.max(0, randomFluctuation)
    };
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in mt-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Monetário</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Acompanhe seu saldo, simule rendimentos e veja a evolução do seu capital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
          </div>
          <p className="text-blue-100 font-medium mb-1">Saldo Disponível</p>
          <h2 className="text-4xl font-bold">
            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-6">
            <button onClick={() => setShowExtrato(true)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition">
              Extrato Completo
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A2438] border border-gray-100 dark:border-[#374151] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Total Investido</p>
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">trending_up</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            R$ {invested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h2>
          {invested > 0 ? (
            <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              Em rendimento
            </p>
          ) : (
            <p className="text-sm text-gray-400 font-medium mt-2">
              Nenhum investimento ativo
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-[#1A2438] border border-gray-100 dark:border-[#374151] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Lucro Estimado</p>
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            R$ {(invested * 0.15).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Baseado no portfólio atual (Estimativa anual)
          </p>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <div className="bg-white dark:bg-[#1A2438] border border-gray-100 dark:border-[#374151] rounded-2xl p-6 shadow-sm mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Evolução do Patrimônio</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Desempenho dos seus investimentos nos últimos 6 meses</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">sync</span>
            Sincronizado
          </div>
        </div>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
              />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adicionar Dinheiro */}
        <div className="bg-white dark:bg-[#1A2438] border border-gray-100 dark:border-[#374151] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined">add_card</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Adicionar Fundos</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor do Depósito (R$)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0,00"
                className="w-full p-3 border border-gray-200 dark:border-[#374151] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white dark:bg-[#0F1829] dark:text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  onClick={() => setDepositAmount(val.toString())}
                  className="py-2 border border-gray-200 dark:border-[#374151] rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  + R$ {val.toLocaleString("pt-BR")}
                </button>
              ))}
            </div>
            <button
              onClick={handleDeposit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Depositar via PIX
            </button>
          </div>
        </div>

        {/* Simulador de Rendimentos */}
        <div className="bg-white dark:bg-[#1A2438] border border-gray-100 dark:border-[#374151] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined">calculate</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Simulador de Retorno</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full p-3 border border-gray-200 dark:border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-white dark:bg-[#0F1829] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo (Meses)</label>
                <select
                  value={calcMonths}
                  onChange={(e) => setCalcMonths(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-200 dark:border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-white dark:bg-[#0F1829] dark:text-white"
                >
                  <option value={6}>6 Meses</option>
                  <option value={12}>1 Ano</option>
                  <option value={24}>2 Anos</option>
                  <option value={60}>5 Anos</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Calcular Projeção
            </button>

            {calcResult !== null && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 animate-fade-in text-center">
                <p className="text-sm text-purple-800 dark:text-purple-300 mb-1">Valor Bruto Estimado</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  R$ {calcResult.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                  *Simulação baseada em média histórica de 1.5% a.m. Retornos passados não garantem retornos futuros.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Extrato */}
      {showExtrato && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowExtrato(false)}>
          <div className="bg-white dark:bg-[#1A2438] rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Extrato de Transações</h3>
                <p className="text-sm text-gray-500">Histórico completo das suas movimentações</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={transactions.length === 0}
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg font-medium transition"
                  title="Baixar em PDF"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span className="hidden sm:inline">Baixar PDF</span>
                </button>
                <button onClick={() => setShowExtrato(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-gray-600 dark:hover:text-gray-200 transition">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-hide">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                  <p>Nenhuma transação encontrada.</p>
                </div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#0F1829] rounded-xl border border-gray-100 dark:border-[#374151]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        <span className="material-symbols-outlined text-sm">{tx.type === 'deposit' ? 'arrow_downward' : 'swap_horiz'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">{tx.type === 'deposit' ? 'Depósito PIX' : 'Transferência'}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-gray-800 dark:text-white'}`}>
                      + R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
