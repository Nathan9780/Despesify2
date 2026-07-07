import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export function Monetary() {
  const [balance, setBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [calcAmount, setCalcAmount] = useState("");
  const [calcMonths, setCalcMonths] = useState(12);
  const [calcResult, setCalcResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMonetary = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("investor_monetary")
          .select("balance, invested")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setBalance(data.balance);
          setInvested(data.invested);
        } else if (error && error.code === 'PGRST116') {
          // Default initial mock data for presentation
          await supabase.from("investor_monetary").insert({ user_id: user.id, balance: 150000, invested: 45000 });
          setBalance(150000);
          setInvested(45000);
        }
      }
    };
    fetchMonetary();
  }, []);

  const handleDeposit = async () => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      if (user) {
        const newBalance = balance + val;
        const { error } = await supabase
          .from("investor_monetary")
          .update({ balance: newBalance })
          .eq("user_id", user.id);

        if (!error) {
          setBalance(newBalance);
          setDepositAmount("");
          toast.success(`Depósito de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso!`);
        } else {
          toast.error("Erro ao depositar no banco de dados.");
        }
      } else {
        // Fallback offline
        setBalance(balance + val);
        setDepositAmount("");
        toast.success(`Depósito de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado offline!`);
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

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in mt-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Monetário</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Acompanhe seu saldo, simule rendimentos e adicione fundos para novos projetos.
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
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition">
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
          <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            +12.5% este mês
          </p>
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
            Baseado no portfólio atual
          </p>
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
    </div>
  );
}
