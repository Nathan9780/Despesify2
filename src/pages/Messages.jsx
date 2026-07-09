import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export function Messages() {
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    createConversation,
  } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConvName, setNewConvName] = useState("");
  const [newConvType, setNewConvType] = useState("default");
  
  const [profilesList, setProfilesList] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (showNewConversation && !newConvName) {
      const fetchInitial = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, name, email, plan')
          .limit(10);
        if (data) setProfilesList(data);
      };
      fetchInitial();
    }
  }, [showNewConversation, newConvName]);

  // Buscar usuários para o modal de Nova Conversa
  const handleSearchProfiles = async (query) => {
    setNewConvName(query);
    const term = (query || "").toLowerCase();

    // 1. Busca Local
    let localUsers = [];
    try {
      const usersStr = localStorage.getItem("users");
      if (usersStr) {
        const parsed = JSON.parse(usersStr);
        localUsers = parsed.filter(u => 
          !term || 
          (u.name && u.name.toLowerCase().includes(term)) || 
          (u.email && u.email.toLowerCase().includes(term))
        );
      }
    } catch (e) {}

    // 2. Busca Supabase
    let supabaseUsers = [];
    try {
      let queryBuilder = supabase.from('profiles').select('id, name, email, plan');
      if (term) {
        queryBuilder = queryBuilder.or(`name.ilike.%${term}%,email.ilike.%${term}%`).limit(5);
      } else {
        queryBuilder = queryBuilder.limit(10);
      }
      const { data } = await queryBuilder;
      if (data) supabaseUsers = data;
    } catch (err) {}

    // 3. Combina e remove duplicatas
    const allUsers = [...localUsers, ...supabaseUsers];
    let uniqueUsers = Array.from(new Map(allUsers.map(u => [u.email, u])).values());

    // 4. Remove o usuário atual da lista
    try {
      const currentUserStr = localStorage.getItem("currentUser");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        uniqueUsers = uniqueUsers.filter(u => u.email.toLowerCase() !== currentUser.email.toLowerCase());
      }
    } catch (e) {}

    // 5. Fallback (Mocks) se não achar nada
    if (uniqueUsers.length === 0) {
      const mockProfiles = [
        { id: 'mock-1', name: 'João Silva', email: 'joao@example.com', plan: 'investor' },
        { id: 'mock-2', name: 'Maria Souza', email: 'maria@empresa.com', plan: 'enterprise' },
        { id: 'mock-3', name: 'Carlos Tech', email: 'carlos@tech.com', plan: 'citizen' }
      ];
      if (term) {
        uniqueUsers = mockProfiles.filter(p => 
          p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)
        );
      } else {
        uniqueUsers = mockProfiles;
      }
    }

    setProfilesList(uniqueUsers.slice(0, 10));
  };

  // (Removed duplicate handleCreateConversation)

  // Buscar mensagens da conversa selecionada
  const {
    messages,
    isLoading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useMessages(selectedConversation?.id);

  // Scroll para o final ao carregar mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Selecionar primeira conversa automaticamente
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Filtrar conversas
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations.filter((chat) => {
      if (filterType !== "all" && chat.type !== filterType) return false;
      if (
        searchTerm &&
        !chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [conversations, filterType, searchTerm]);

  // Busca global de usuários para o sidebar (estilo GitHub)
  const [globalProfilesList, setGlobalProfilesList] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);

  // Busca sugestões iniciais ao focar no campo
  const handleSearchFocus = async () => {
    setIsSearchFocused(true);
    if (suggestedProfiles.length === 0) {
      setIsSearchingGlobal(true);
      
      // Busca da lista simulada local primeiro
      let localUsers = [];
      try {
        const usersStr = localStorage.getItem("users");
        if (usersStr) {
          localUsers = JSON.parse(usersStr);
        }
      } catch (e) {}

      // Busca do Supabase
      let supabaseUsers = [];
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, plan')
          .limit(8);
        
        console.log("Supabase initial fetch data:", data, "error:", error);
        
        if (data) supabaseUsers = data;
      } catch (err) {
        console.error("Supabase initial fetch exception:", err);
      }

      // Combina e remove duplicatas por email
      const allUsers = [...localUsers, ...supabaseUsers];
      let uniqueUsers = Array.from(new Map(allUsers.map(u => [u.email, u])).values());

      // Remove o usuário atual da lista
      try {
        const currentUserStr = localStorage.getItem("currentUser");
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          uniqueUsers = uniqueUsers.filter(u => u.email.toLowerCase() !== currentUser.email.toLowerCase());
        }
      } catch (e) {}
      
      console.log("Combined initial unique users:", uniqueUsers);

      if (uniqueUsers.length > 0) {
        setSuggestedProfiles(uniqueUsers.slice(0, 8));
      } else {
        // Fallback final
        setSuggestedProfiles([
          { id: 'mock-1', name: 'João Silva', email: 'joao@example.com', plan: 'investor' },
          { id: 'mock-2', name: 'Maria Souza', email: 'maria@empresa.com', plan: 'enterprise' },
          { id: 'mock-3', name: 'Carlos Tech', email: 'carlos@tech.com', plan: 'citizen' }
        ]);
      }
      setIsSearchingGlobal(false);
    }
  };

  const handleSearchBlur = () => {
    // Delay para permitir o click no item antes de fechar
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  useEffect(() => {
    const searchGlobalProfiles = async () => {
      if (!searchTerm.trim()) {
        setGlobalProfilesList([]);
        return;
      }
      setIsSearchingGlobal(true);
      
      const term = searchTerm.toLowerCase();

      // Busca local
      let localUsers = [];
      try {
        const usersStr = localStorage.getItem("users");
        if (usersStr) {
          const parsed = JSON.parse(usersStr);
          localUsers = parsed.filter(u => 
            (u.name && u.name.toLowerCase().includes(term)) || 
            (u.email && u.email.toLowerCase().includes(term))
          );
        }
      } catch (e) {}

      // Busca Supabase
      let supabaseUsers = [];
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, plan')
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(5);

        if (data) supabaseUsers = data;
      } catch (err) {}

      const allUsers = [...localUsers, ...supabaseUsers];
      let uniqueUsers = Array.from(new Map(allUsers.map(u => [u.email, u])).values());

      // Remove o usuário atual da lista
      try {
        const currentUserStr = localStorage.getItem("currentUser");
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          uniqueUsers = uniqueUsers.filter(u => u.email.toLowerCase() !== currentUser.email.toLowerCase());
        }
      } catch (e) {}

      if (uniqueUsers.length === 0) {
        const mockProfiles = [
          { id: 'mock-1', name: 'João Silva', email: 'joao@example.com', plan: 'investor' },
          { id: 'mock-2', name: 'Maria Souza', email: 'maria@empresa.com', plan: 'enterprise' },
          { id: 'mock-3', name: 'Carlos Tech', email: 'carlos@tech.com', plan: 'citizen' }
        ].filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term)
        );
        uniqueUsers = mockProfiles;
      }

      setGlobalProfilesList(uniqueUsers.slice(0, 8));
      setIsSearchingGlobal(false);
    };

    const debounce = setTimeout(() => {
      searchGlobalProfiles();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Lista a mostrar no dropdown: resultados da busca ou sugestões iniciais
  const dropdownProfiles = searchTerm.trim() ? globalProfilesList : suggestedProfiles;
  
  // O dropdown deve aparecer se:
  // 1. O campo estiver focado E
  // 2. Ocorrer qualquer uma dessas condições:
  //    - O usuário digitou algo (mesmo que não ache nada, para mostrar 'Nenhum usuário encontrado')
  //    - Tem sugestões para mostrar
  //    - Está buscando no momento
  const showDropdown = isSearchFocused && (searchTerm.trim().length > 0 || suggestedProfiles.length > 0 || isSearchingGlobal);

  const handleStartChatWithProfile = async (profile) => {
    try {
      const convType = profile.plan === 'investor' ? 'investor' : profile.plan === 'enterprise' ? 'supplier' : 'default';
      const newConv = await createConversation.mutateAsync({ 
        name: profile.name, 
        type: convType,
        target_user_id: profile.id
      });
      setSelectedConversation(newConv);
      toast.success(`Conversa com ${profile.name} iniciada!`);
      setSearchTerm("");
      setGlobalProfilesList([]);
      setIsSearchFocused(false);
    } catch (err) {
      toast.error(`Erro ao criar conversa: ${err.message}`);
    }
  };

  // Estatísticas
  const totalChats = conversations?.length || 0;
  const unreadCount =
    conversations?.reduce((sum, c) => {
      const unread =
        c.messages?.filter((m) => !m.is_read && m.user_id !== currentUserId)
          .length || 0;
      return sum + unread;
    }, 0) || 0;
  const investorCount =
    conversations?.filter((c) => c.type === "investor").length || 0;
  const supplierCount =
    conversations?.filter((c) => c.type === "supplier").length || 0;

  // Cores por tipo
  const typeColors = {
    investor: "text-blue-600 bg-blue-100",
    supplier: "text-green-600 bg-green-100",
    worker: "text-orange-600 bg-orange-100",
    default: "text-gray-600 bg-gray-100",
  };

  const typeLabels = {
    investor: "Investidor",
    supplier: "Fornecedor",
    worker: "Funcionário",
    default: "Contato",
  };

  // Enviar mensagem
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMessage.mutate({
      conversationId: selectedConversation.id,
      content: newMessage,
    });
    setNewMessage("");
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newConvName.trim()) return;
    try {
      const newConv = await createConversation.mutateAsync({ 
        name: newConvName, 
        type: newConvType,
        target_user_id: selectedProfileId
      });
      setSelectedConversation(newConv);
      toast.success(`Conversa com ${newConvName} iniciada!`);
      setShowNewConversation(false);
      setNewConvName("");
      setNewConvType("default");
      setSelectedProfileId(null);
    } catch (err) {
      toast.error(`Erro ao criar conversa: ${err.message}`);
    }
  };

  // Marcar mensagens como lidas ao abrir conversa
  useEffect(() => {
    if (!selectedConversation) return;
    // Marcar todas as mensagens como lidas (opcional)
  }, [selectedConversation]);

  // Estado de loading combinado
  const isLoading = conversationsLoading || messagesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  const error = conversationsError || messagesError;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-red-400 block">
            error
          </span>
          <p className="text-xl font-semibold text-red-600 mt-4">
            Erro ao carregar mensagens
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {error.message || "Ocorreu um erro inesperado."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
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
        <button onClick={() => setShowNewConversation(true)} className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-3 sm:mt-0">
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
        className="glass-card rounded-2xl overflow-hidden animate-fade-up flex-1 mb-6 flex flex-col"
        style={{ animationDelay: "0.15s", minHeight: "600px", maxHeight: "80vh" }}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Sidebar: Lista de Conversas */}
          <div className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200/50 flex-col bg-white/30 backdrop-blur-sm ${selectedConversation ? 'hidden md:flex' : 'flex'} h-full`}>
            {/* Busca e Filtros */}
            <div className="p-3 border-b border-gray-200/50">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm text-sm transition-all"
                />
                
                {/* Dropdown de sugestões e resultados */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-up">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">{searchTerm ? 'search' : 'group'}</span>
                      {searchTerm ? 'Resultados da busca' : 'Sugestões de usuários'}
                    </div>
                    {isSearchingGlobal ? (
                      <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        Buscando...
                      </div>
                    ) : (
                      dropdownProfiles.map(profile => (
                        <div 
                          key={profile.id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 flex items-center gap-3 transition-colors"
                          onMouseDown={() => handleStartChatWithProfile(profile)}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-sm">
                            {profile.name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">{profile.name || 'Sem nome'}</p>
                            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              profile.plan === 'investor' ? 'bg-blue-100 text-blue-600' :
                              profile.plan === 'enterprise' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {profile.plan === 'investor' ? 'Investidor' : profile.plan === 'enterprise' ? 'Empresa' : 'Cidadão'}
                            </span>
                            <span className="material-symbols-outlined text-blue-300 text-[14px]">chat_bubble</span>
                          </div>
                        </div>
                      ))
                    )}
                    {!isSearchingGlobal && dropdownProfiles.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-400">
                        Nenhum usuário encontrado
                      </div>
                    )}
                  </div>
                )}
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
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <span className="material-symbols-outlined text-4xl text-gray-300">
                    chat_bubble_outline
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    Nenhuma conversa encontrada
                  </p>
                  <button className="mt-4 text-blue-600 hover:underline text-sm">
                    Iniciar nova conversa
                  </button>
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const lastMessage = chat.messages?.[chat.messages.length - 1];
                  const unreadCount =
                    chat.messages?.filter(
                      (m) => !m.is_read && m.user_id !== currentUserId,
                    ).length || 0;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedConversation(chat);
                        // Marcar como lida (seria feito via mutation)
                      }}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition hover:bg-white/50 border-b border-gray-100/50 ${selectedConversation?.id === chat.id ? "bg-white/60" : ""}`}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${typeColors[chat.type] || typeColors.default}`}
                        >
                          {chat.avatar || chat.name?.charAt(0) || "?"}
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
                            {lastMessage
                              ? new Date(
                                  lastMessage.created_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {lastMessage?.content || "Nenhuma mensagem"}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Área Principal de Mensagens */}
          {selectedConversation ? (
            <div className={`flex-1 flex-col h-full bg-white relative ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
              {/* Header do Chat */}
              <div className="h-16 px-4 md:px-6 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10 flex-shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-1.5 -ml-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${typeColors[selectedConversation.type] || typeColors.default}`}
                  >
                    {selectedConversation.avatar ||
                      selectedConversation.name?.charAt(0) ||
                      "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedConversation.name}
                    </h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      {selectedConversation.online && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      )}
                      {selectedConversation.online ? "Online" : ""}
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
              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-0">
                {messagesLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  messages?.map((msg) => {
                    const isMine = msg.user_id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-up`}
                        style={{ animationDuration: "0.3s" }}
                      >
                        <div
                          className={`message-bubble p-3 rounded-2xl shadow-sm ${
                            isMine
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span
                            className={`text-[10px] mt-1 block text-right ${isMine ? "text-blue-100" : "text-gray-400"}`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {isMine && (
                              <span className="material-symbols-outlined text-[10px] ml-1 align-middle">
                                {msg.is_read ? "done_all" : "check"}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="p-3 border-t border-gray-200/50 bg-white/30">
                <div className="flex items-center gap-2">
                  <button
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
                  {selectedConversation.type === "investor" && (
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
                    disabled={!newMessage.trim() || sendMessage.isLoading}
                    className="btn-primary-glow bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Enviar mensagem"
                  >
                    <span className="material-symbols-outlined text-sm">
                      send
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex-col items-center justify-center text-center p-8 bg-white/20 backdrop-blur-sm hidden md:flex">
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
      {showProposal && selectedConversation && (
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
      {showContactInfo && selectedConversation && (
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
                className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl ${typeColors[selectedConversation.type] || typeColors.default}`}
              >
                {selectedConversation.avatar ||
                  selectedConversation.name?.charAt(0) ||
                  "?"}
              </div>
              <h4 className="text-lg font-bold text-gray-800 mt-3">
                {selectedConversation.name}
              </h4>
              <p className="text-sm text-gray-500">
                {typeLabels[selectedConversation.type] || typeLabels.default}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {selectedConversation.online ? (
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
                    {selectedConversation.email || "Não informado"}
                  </p>
                  {selectedConversation.phone && (
                    <p>
                      <span className="text-gray-500">Telefone:</span>{" "}
                      {selectedConversation.phone}
                    </p>
                  )}
                  {selectedConversation.rating && (
                    <p>
                      <span className="text-gray-500">Avaliação:</span> ⭐{" "}
                      {selectedConversation.rating} / 5
                    </p>
                  )}
                </div>
              </div>

              {selectedConversation.type === "investor" && (
                <div className="border-b border-gray-200 pb-3">
                  <h5 className="font-semibold text-gray-700 text-sm">
                    Investimentos
                  </h5>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Total investido:</span> R${" "}
                      {selectedConversation.invested?.toLocaleString() || "0"}
                    </p>
                    <p>
                      <span className="text-gray-500">Projetos:</span>{" "}
                      {selectedConversation.projects || 0}
                    </p>
                    <p>
                      <span className="text-gray-500">Status:</span>{" "}
                      <span className="text-green-600">Ativo</span>
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

      {/* Modal de Nova Conversa */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={() => setShowNewConversation(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nova Conversa</h3>
              <button onClick={() => setShowNewConversation(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleCreateConversation}>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Buscar Usuário</label>
                <input
                  type="text"
                  value={newConvName}
                  onChange={(e) => {
                    handleSearchProfiles(e.target.value);
                    setSelectedProfileId(null);
                  }}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Pesquise o nome do usuário"
                  required
                />
                {profilesList.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {profilesList.map(profile => (
                      <div 
                        key={profile.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                        onClick={() => {
                          setNewConvName(profile.name);
                          setSelectedProfileId(profile.id);
                          setNewConvType(profile.plan === 'investor' ? 'investor' : profile.plan === 'enterprise' ? 'supplier' : 'default');
                          setProfilesList([]);
                        }}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs">
                          {profile.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{profile.name}</p>
                          <p className="text-xs text-gray-500">{profile.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedProfileId && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  <span className="text-xs text-green-700">Usuário selecionado. Pronto para conversar!</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Contato</label>
                <select
                  value={newConvType}
                  onChange={(e) => setNewConvType(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  disabled
                >
                  <option value="default">Contato Padrão</option>
                  <option value="worker">Funcionário</option>
                  <option value="supplier">Fornecedor</option>
                  <option value="investor">Investidor</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">O tipo de contato é definido automaticamente pelo plano do usuário.</p>
              </div>
              <button
                type="submit"
                disabled={!selectedProfileId}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition mt-4"
              >
                {selectedProfileId ? "Iniciar Conversa" : "Selecione um usuário"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
