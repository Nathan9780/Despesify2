import React, { useState, useRef, useEffect } from "react";

export function Messages() {
  // Dados mockados das conversas
  const initialChats = [
    {
      id: 1,
      name: "João Investimentos",
      type: "investor",
      lastMessage: "Tenho interesse no projeto de ampliação.",
      time: "10:45",
      unread: 2,
      online: true,
      avatar: "JI",
      email: "joao@investimentos.com",
      invested: 50000,
      projects: 3,
      status: "active",
      messages: [
        {
          id: 1,
          from: "João Investimentos",
          text: "Olá, gostaria de investir no projeto de ampliação.",
          time: "10:30",
        },
        {
          id: 2,
          from: "Você",
          text: "Ótimo! Qual valor você pretende aportar?",
          time: "10:35",
        },
        {
          id: 3,
          from: "João Investimentos",
          text: "Penso em R$ 50.000, com retorno de 15% ao ano.",
          time: "10:40",
        },
        {
          id: 4,
          from: "Você",
          text: "Vamos analisar a proposta e te retorno em breve.",
          time: "10:42",
        },
        {
          id: 5,
          from: "João Investimentos",
          text: "Aguardarei seu contato. Obrigado!",
          time: "10:45",
        },
      ],
      proposal: {
        value: 50000,
        return: 15,
        term: 12,
        status: "pending",
      },
    },
    {
      id: 2,
      name: "Casa do Cimento",
      type: "supplier",
      lastMessage: "Seu orçamento de materiais está pronto.",
      time: "09:30",
      unread: 0,
      online: false,
      avatar: "CC",
      email: "contato@casacimento.com",
      phone: "(31) 99999-1111",
      rating: 4.8,
      distance: "2.4 km",
      messages: [
        {
          id: 1,
          from: "Casa do Cimento",
          text: "Olá! Já finalizamos o orçamento dos materiais.",
          time: "09:00",
        },
        {
          id: 2,
          from: "Você",
          text: "Perfeito! Pode me enviar os detalhes?",
          time: "09:10",
        },
        {
          id: 3,
          from: "Casa do Cimento",
          text: "Segue em anexo o PDF com todos os itens.",
          time: "09:20",
        },
        {
          id: 4,
          from: "Casa do Cimento",
          text: "Seu orçamento de materiais está pronto.",
          time: "09:30",
        },
      ],
      files: [{ name: "Orçamento_Materiais.pdf", size: "2.4 MB", icon: "pdf" }],
      proposal: null,
    },
    {
      id: 3,
      name: "Carlos Eletricista",
      type: "worker",
      lastMessage: "Pagamento pendente da semana passada.",
      time: "Ontem",
      unread: 1,
      online: false,
      avatar: "CE",
      email: "carlos@eletrica.com",
      phone: "(31) 99999-2222",
      rating: 4.5,
      messages: [
        {
          id: 1,
          from: "Carlos Eletricista",
          text: "Olá! Já finalizei a instalação elétrica.",
          time: "Ontem 14:00",
        },
        {
          id: 2,
          from: "Você",
          text: "Ótimo! Vou verificar e te dou um retorno.",
          time: "Ontem 14:30",
        },
        {
          id: 3,
          from: "Carlos Eletricista",
          text: "Pagamento pendente da semana passada.",
          time: "Ontem 16:00",
        },
      ],
      proposal: null,
    },
    {
      id: 4,
      name: "Maria Arquiteta",
      type: "worker",
      lastMessage: "Enviei as novas plantas do projeto.",
      time: "Ontem",
      unread: 0,
      online: true,
      avatar: "MA",
      email: "maria@arquiteta.com",
      phone: "(31) 99999-3333",
      rating: 4.9,
      messages: [
        {
          id: 1,
          from: "Maria Arquiteta",
          text: "Estou finalizando as novas plantas.",
          time: "Ontem 09:00",
        },
        {
          id: 2,
          from: "Maria Arquiteta",
          text: "Enviei as novas plantas do projeto.",
          time: "Ontem 17:00",
        },
      ],
      proposal: null,
    },
    {
      id: 5,
      name: "Fundo Imobiliário Alpha",
      type: "investor",
      lastMessage: "Gostaríamos de fazer uma contraproposta.",
      time: "Segunda",
      unread: 1,
      online: false,
      avatar: "FI",
      email: "alpha@fundo.com",
      invested: 100000,
      projects: 5,
      status: "active",
      messages: [
        {
          id: 1,
          from: "Fundo Imobiliário Alpha",
          text: "Recebemos sua proposta de investimento.",
          time: "Segunda 10:00",
        },
        {
          id: 2,
          from: "Você",
          text: "Ótimo! Aguardo retorno.",
          time: "Segunda 10:30",
        },
        {
          id: 3,
          from: "Fundo Imobiliário Alpha",
          text: "Gostaríamos de fazer uma contraproposta.",
          time: "Segunda 14:00",
        },
      ],
      proposal: {
        value: 80000,
        return: 10,
        term: 18,
        status: "negotiating",
      },
    },
  ];

  // Filtros
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState(initialChats);
  const [selectedChat, setSelectedChat] = useState(initialChats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [showProposal, setShowProposal] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll para o final ao carregar/atualizar mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat]);

  // Filtrar conversas
  const filteredChats = chats.filter((chat) => {
    if (filterType !== "all" && chat.type !== filterType) return false;
    if (
      searchTerm &&
      !chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Enviar mensagem
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const updatedChat = {
      ...selectedChat,
      messages: [
        ...selectedChat.messages,
        {
          id: Date.now(),
          from: "Você",
          text: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
      lastMessage: newMessage,
      time: "Agora",
    };
    setChats(chats.map((c) => (c.id === selectedChat.id ? updatedChat : c)));
    setSelectedChat(updatedChat);
    setNewMessage("");
  };

  // Atualizar status de propostas
  const handleProposalAction = (action) => {
    if (!selectedChat || !selectedChat.proposal) return;
    const updatedProposal = { ...selectedChat.proposal, status: action };
    const updatedChat = { ...selectedChat, proposal: updatedProposal };
    setChats(chats.map((c) => (c.id === selectedChat.id ? updatedChat : c)));
    setSelectedChat(updatedChat);
    setShowProposal(false);
  };

  // Cores por tipo
  const typeColors = {
    investor: "text-blue-600 bg-blue-100",
    supplier: "text-green-600 bg-green-100",
    worker: "text-orange-600 bg-orange-100",
  };

  const typeLabels = {
    investor: "Investidor",
    supplier: "Fornecedor",
    worker: "Funcionário",
  };

  // Estatísticas
  const totalChats = chats.length;
  const unreadCount = chats.reduce((sum, c) => sum + c.unread, 0);
  const investorCount = chats.filter((c) => c.type === "investor").length;
  const supplierCount = chats.filter((c) => c.type === "supplier").length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
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
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
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
        .badge-glow-success {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.25);
          box-shadow: 0 0 16px rgba(34, 197, 94, 0.1);
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
        .online-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
          70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .message-bubble {
          max-width: 80%;
          word-break: break-word;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .proposal-card {
          background: linear-gradient(135deg, rgba(41, 128, 185, 0.05), rgba(52, 152, 219, 0.05));
          border: 1px solid rgba(41, 128, 185, 0.2);
        }
      `}</style>

      {/* Cabeçalho */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mensagens</h1>
          <p className="text-sm text-gray-500">
            Comunique-se com investidores, fornecedores e equipe.
          </p>
        </div>
        <button className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-3 sm:mt-0">
          <span className="material-symbols-outlined text-lg">edit</span>
          Nova Conversa
        </button>
      </div>

      {/* Cards de Resumo */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.10s" }}
      >
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">chat</span>
            Conversas
          </p>
          <p className="text-xl font-bold text-gray-800">{totalChats}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              mark_email_unread
            </span>
            Não Lidas
          </p>
          <p className="text-xl font-bold text-red-500">{unreadCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            Investidores
          </p>
          <p className="text-xl font-bold text-blue-600">{investorCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 hover-lift">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              local_shipping
            </span>
            Fornecedores
          </p>
          <p className="text-xl font-bold text-green-600">{supplierCount}</p>
        </div>
      </div>

      {/* Layout principal: Chat */}
      <div
        className="glass-card rounded-2xl overflow-hidden animate-fade-up"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="flex flex-col md:flex-row h-[600px] md:h-[70vh]">
          {/* Sidebar: Lista de Conversas */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200/50 flex flex-col bg-white/30 backdrop-blur-sm">
            {/* Busca e Filtros */}
            <div className="p-3 border-b border-gray-200/50">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm text-sm"
                />
              </div>
              <div className="flex gap-1 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterType === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterType("investor")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterType === "investor" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                >
                  💰 Investidores
                </button>
                <button
                  onClick={() => setFilterType("supplier")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterType === "supplier" ? "bg-blue-600 text-white" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                >
                  🏪 Fornecedores
                </button>
                <button
                  onClick={() => setFilterType("worker")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterType === "worker" ? "bg-blue-600 text-white" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}
                >
                  👷 Funcionários
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <span className="material-symbols-outlined text-4xl text-gray-300">
                    chat_bubble_outline
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    Nenhuma conversa encontrada
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      // Marcar como lida
                      const updated = { ...chat, unread: 0 };
                      setChats(
                        chats.map((c) => (c.id === chat.id ? updated : c)),
                      );
                      setSelectedChat(updated);
                    }}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition hover:bg-white/50 border-b border-gray-100/50 ${selectedChat?.id === chat.id ? "bg-white/60" : ""}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${typeColors[chat.type]}`}
                      >
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white online-dot"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {chat.name}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                          {chat.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Área do Chat */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm">
              {/* Header do Chat */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200/50 bg-white/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${typeColors[selectedChat.type]}`}
                  >
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {selectedChat.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {selectedChat.online ? "🟢 Online" : "🔴 Offline"} •{" "}
                      {typeLabels[selectedChat.type]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Informações do contato"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-500">
                      info
                    </span>
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Arquivos"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-500">
                      attach_file
                    </span>
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Mais opções"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-500">
                      more_vert
                    </span>
                  </button>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === "Você" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`message-bubble rounded-2xl px-4 py-2 text-sm ${
                        msg.from === "Você"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white/80 text-gray-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[10px] mt-1 block ${msg.from === "Você" ? "text-blue-200" : "text-gray-400"}`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Proposta de investimento (se existir) */}
                {selectedChat.proposal && (
                  <div className="flex justify-center my-2">
                    <div className="proposal-card rounded-xl p-4 max-w-md w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-blue-600">
                          description
                        </span>
                        <span className="font-semibold text-sm text-gray-800">
                          Proposta de Investimento
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full ${
                            selectedChat.proposal.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : selectedChat.proposal.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : selectedChat.proposal.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {selectedChat.proposal.status === "pending"
                            ? "⏳ Pendente"
                            : selectedChat.proposal.status === "approved"
                              ? "✅ Aprovado"
                              : selectedChat.proposal.status === "rejected"
                                ? "❌ Recusado"
                                : "🔄 Negociando"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white/50 rounded p-2 text-center">
                          <p className="text-gray-500">Valor</p>
                          <p className="font-bold text-blue-600">
                            R$ {selectedChat.proposal.value.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white/50 rounded p-2 text-center">
                          <p className="text-gray-500">Retorno</p>
                          <p className="font-bold text-green-600">
                            {selectedChat.proposal.return}%
                          </p>
                        </div>
                        <div className="bg-white/50 rounded p-2 text-center">
                          <p className="text-gray-500">Prazo</p>
                          <p className="font-bold text-gray-800">
                            {selectedChat.proposal.term} meses
                          </p>
                        </div>
                      </div>
                      {selectedChat.proposal.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleProposalAction("approved")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg text-xs font-medium"
                          >
                            ✅ Aceitar
                          </button>
                          <button
                            onClick={() => handleProposalAction("rejected")}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg text-xs font-medium"
                          >
                            ❌ Recusar
                          </button>
                          <button
                            onClick={() => handleProposalAction("negotiating")}
                            className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg text-xs font-medium"
                          >
                            ✏ Negociar
                          </button>
                        </div>
                      )}
                      {selectedChat.proposal.status === "negotiating" && (
                        <div className="mt-2 text-center text-xs text-blue-600">
                          🔄 Em negociação - aguardando resposta
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="p-3 border-t border-gray-200/50 bg-white/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAttachment(!showAttachment)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Anexar arquivo"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-500">
                      attach_file
                    </span>
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Emoji"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-500">
                      emoji_emotions
                    </span>
                  </button>
                  {selectedChat.type === "investor" && (
                    <button
                      onClick={() => setShowProposal(!showProposal)}
                      className="p-2 rounded-lg hover:bg-blue-50 transition"
                      title="Enviar proposta"
                    >
                      <span className="material-symbols-outlined text-sm text-blue-600">
                        description
                      </span>
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                    title="Enviar mensagem"
                  >
                    <span className="material-symbols-outlined text-sm">
                      send
                    </span>
                  </button>
                </div>
                {/* Anexos rápidos */}
                {showAttachment &&
                  selectedChat.files &&
                  selectedChat.files.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
                      {selectedChat.files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-white/80 rounded-lg px-2 py-1 text-xs border border-gray-200"
                        >
                          <span className="material-symbols-outlined text-sm text-blue-600">
                            description
                          </span>
                          <span className="text-gray-700">{file.name}</span>
                          <span className="text-gray-400">({file.size})</span>
                          <button className="text-blue-600 hover:underline">
                            📥
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/20 backdrop-blur-sm">
              <span className="material-symbols-outlined text-6xl text-gray-300">
                chat_bubble_outline
              </span>
              <h3 className="text-xl font-semibold text-gray-600 mt-4">
                Nenhuma conversa selecionada
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Escolha uma conversa para começar a trocar mensagens.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Proposta (para investidores) */}
      {showProposal && selectedChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          onClick={() => setShowProposal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nova Proposta</h3>
              <button
                onClick={() => setShowProposal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Proposta enviada!");
                setShowProposal(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor do Investimento
                </label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Retorno (%)
                </label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prazo (meses)
                </label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                  placeholder="Detalhes adicionais..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
              >
                Enviar Proposta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Painel lateral: Informações do Contato */}
      {showContactInfo && selectedChat && (
        <div
          className="fixed inset-0 z-50 flex justify-end modal-overlay"
          onClick={() => setShowContactInfo(false)}
        >
          <div
            className="bg-white w-full max-w-sm h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-800">Informações</h3>
              <button
                onClick={() => setShowContactInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl ${typeColors[selectedChat.type]}`}
              >
                {selectedChat.avatar}
              </div>
              <h4 className="text-lg font-bold text-gray-800 mt-3">
                {selectedChat.name}
              </h4>
              <p className="text-sm text-gray-500">
                {typeLabels[selectedChat.type]}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {selectedChat.online ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                    Online
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Offline</span>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h5 className="font-semibold text-gray-700 text-sm">Contato</h5>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedChat.email}
                  </p>
                  {selectedChat.phone && (
                    <p>
                      <span className="text-gray-500">Telefone:</span>{" "}
                      {selectedChat.phone}
                    </p>
                  )}
                  {selectedChat.rating && (
                    <p>
                      <span className="text-gray-500">Avaliação:</span> ⭐{" "}
                      {selectedChat.rating} / 5
                    </p>
                  )}
                  {selectedChat.distance && (
                    <p>
                      <span className="text-gray-500">Distância:</span>{" "}
                      {selectedChat.distance}
                    </p>
                  )}
                </div>
              </div>

              {selectedChat.type === "investor" && (
                <div className="border-b border-gray-200 pb-3">
                  <h5 className="font-semibold text-gray-700 text-sm">
                    Investimentos
                  </h5>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Total investido:</span> R${" "}
                      {selectedChat.invested?.toLocaleString()}
                    </p>
                    <p>
                      <span className="text-gray-500">Projetos:</span>{" "}
                      {selectedChat.projects}
                    </p>
                    <p>
                      <span className="text-gray-500">Status:</span>{" "}
                      <span className="text-green-600">Ativo</span>
                    </p>
                  </div>
                </div>
              )}

              {selectedChat.type === "supplier" && (
                <div className="border-b border-gray-200 pb-3">
                  <h5 className="font-semibold text-gray-700 text-sm">
                    Fornecedor
                  </h5>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">
                        Materiais fornecidos:
                      </span>{" "}
                      12 itens
                    </p>
                    <p>
                      <span className="text-gray-500">Última compra:</span>{" "}
                      10/06/2026
                    </p>
                  </div>
                </div>
              )}

              {selectedChat.type === "worker" && (
                <div className="border-b border-gray-200 pb-3">
                  <h5 className="font-semibold text-gray-700 text-sm">
                    Funcionário
                  </h5>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Cargo:</span>{" "}
                      {selectedChat.role || "Técnico"}
                    </p>
                    <p>
                      <span className="text-gray-500">Projetos ativos:</span> 2
                    </p>
                    <p>
                      <span className="text-gray-500">Último pagamento:</span>{" "}
                      15/06/2026
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h5 className="font-semibold text-gray-700 text-sm">Ações</h5>
                <div className="mt-2 flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                    💬 Ir para o chat
                  </button>
                  <button className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">
                    📊 Histórico
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
