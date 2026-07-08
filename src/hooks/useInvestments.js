// src/hooks/useInvestments.js
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export const useInvestments = () => {
  const [balance, setBalance] = useState(0);
  const [investments, setInvestments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from("investor_monetary")
          .select("balance, invested")
          .eq("user_id", user.id)
          .single();
          
        if (data) {
          setBalance(Number(data.balance));
        } else {
          // Fallback to localStorage if no row
          const localBal = localStorage.getItem("user_balance");
          if (localBal) setBalance(Number(localBal));
        }
      }

      // We still mock the investments list since there's no table for specific investments yet
      const savedInvestments = localStorage.getItem("userInvestments");
      if (savedInvestments) {
        setInvestments(JSON.parse(savedInvestments));
      }
    };
    loadData();
  }, []);

  const addBalance = async (amount) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    localStorage.setItem("user_balance", newBalance.toString());
    
    if (user) {
      await supabase.from("investor_monetary").update({ balance: newBalance }).eq("user_id", user.id);
    }
    toast.success(`Saldo adicionado: R$ ${amount.toLocaleString()}`);
  };

  const invest = async (project, amount) => {
    if (amount <= 0) {
      toast.error("Valor inválido.");
      return false;
    }
    if (amount > balance) {
      toast.error("Saldo insuficiente para este investimento.");
      return false;
    }

    const newBalance = balance - amount;
    setBalance(newBalance);
    localStorage.setItem("user_balance", newBalance.toString());
    
    // Also update invested amount
    if (user) {
      const { data } = await supabase.from("investor_monetary").select("invested").eq("user_id", user.id).single();
      const currentInvested = data ? Number(data.invested) : 0;
      await supabase.from("investor_monetary").update({ 
        balance: newBalance,
        invested: currentInvested + amount
      }).eq("user_id", user.id);
      localStorage.setItem("user_invested", (currentInvested + amount).toString());
    }

    const newInvestment = {
      id: Date.now().toString(),
      projectId: project.id,
      projectName: project.name,
      amount,
      date: new Date().toISOString(),
      status: "ativo"
    };

    const newInvestmentsList = [newInvestment, ...investments];
    setInvestments(newInvestmentsList);
    localStorage.setItem("userInvestments", JSON.stringify(newInvestmentsList));

    toast.success(`Investimento de R$ ${amount.toLocaleString()} realizado com sucesso!`);
    return true;
  };

  return {
    balance,
    investments,
    addBalance,
    invest
  };
};
