// src/hooks/useInvestments.js
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const useInvestments = () => {
  const [balance, setBalance] = useState(0);
  const [investments, setInvestments] = useState([]);

  // Load from localStorage for MVP mock
  useEffect(() => {
    const savedBalance = localStorage.getItem("userBalance");
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    }
    
    const savedInvestments = localStorage.getItem("userInvestments");
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }
  }, []);

  const addBalance = (amount) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    localStorage.setItem("userBalance", newBalance.toString());
    toast.success(`Saldo adicionado: R$ ${amount.toLocaleString()}`);
  };

  const invest = (project, amount) => {
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
    localStorage.setItem("userBalance", newBalance.toString());

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
