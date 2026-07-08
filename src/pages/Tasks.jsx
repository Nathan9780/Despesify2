import React, { useState, useMemo } from "react";
import { useTasks } from "../hooks/useTasks";
import { useEmployees } from "../hooks/useEmployees";
import toast from "react-hot-toast";

const columns = [
  { id: "pending", title: "A Fazer", color: "bg-gray-500" },
  { id: "in_progress", title: "Em Andamento", color: "bg-blue-500" },
  { id: "in_review", title: "Em Revisão", color: "bg-yellow-500" },
  { id: "completed", title: "Concluído", color: "bg-green-500" },
];

const priorities = [
  { id: "low", label: "Baixa", color: "text-green-600 bg-green-100" },
  { id: "medium", label: "Média", color: "text-yellow-600 bg-yellow-100" },
  { id: "high", label: "Alta", color: "text-red-600 bg-red-100" },
];

export function Tasks() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const { employees } = useEmployees();
  
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortOption, setSortOption] = useState("manual");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    employee_id: "",
    due_date: "",
    status: "pending",
    priority: "medium",
    tags: "",
  });

  const openModal = (task = null, columnId = "pending") => {
    if (task) {
      setEditingTask(task);
      setFormData({
        name: task.name || "",
        description: task.description || "",
        employee_id: task.employee_id || "",
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        tags: Array.isArray(task.tags) ? task.tags.join(", ") : "",
      });
    } else {
      setEditingTask(null);
      setFormData({
        name: "",
        description: "",
        employee_id: "",
        due_date: "",
        status: columnId,
        priority: "medium",
        tags: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e) => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    
    setDraggedTaskId(null);
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== targetStatus) {
      const updates = { id: taskId, status: targetStatus };
      if (targetStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }
      
      try {
        await updateTask.mutateAsync(updates);
        toast.success("Tarefa movida!");
      } catch (err) {
        toast.error("Erro ao mover tarefa");
      }
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.employee_id) payload.employee_id = null;
      if (!payload.due_date) payload.due_date = null;
      
      // Parse tags
      if (payload.tags && typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      } else {
        payload.tags = [];
      }

      if (payload.status === "completed" && (!editingTask || editingTask.status !== "completed")) {
        payload.completed_at = new Date().toISOString();
      } else if (payload.status !== "completed") {
        payload.completed_at = null;
      }

      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, ...payload });
        toast.success("Tarefa atualizada!");
      } else {
        await createTask.mutateAsync(payload);
        toast.success("Tarefa criada!");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erro ao salvar tarefa.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir esta tarefa?")) {
      try {
        await deleteTask.mutateAsync(id);
        toast.success("Tarefa excluída");
      } catch (err) {
        toast.error("Erro ao excluir");
      }
    }
  };

  const handleQuickComplete = async (task, e) => {
    e.stopPropagation();
    try {
      await updateTask.mutateAsync({ 
        id: task.id, 
        status: "completed",
        completed_at: new Date().toISOString()
      });
      toast.success("Tarefa concluída!");
    } catch (err) {
      toast.error("Erro ao concluir tarefa");
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks || [];
    
    // Filtros
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.name?.toLowerCase().includes(lower) || 
        t.description?.toLowerCase().includes(lower) ||
        t.tags?.some(tag => tag.toLowerCase().includes(lower))
      );
    }
    if (filterEmployee) {
      result = result.filter(t => t.employee_id === filterEmployee);
    }
    if (filterPriority) {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Ordenação
    if (sortOption !== 'manual') {
      result = [...result].sort((a, b) => {
        if (sortOption === 'due_date') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        }
        if (sortOption === 'created_at') {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortOption === 'priority') {
          const pMap = { high: 3, medium: 2, low: 1 };
          return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        }
        return 0;
      });
    } else {
      // Manual sort (fallback to position if implemented, or created_at)
      result = [...result].sort((a, b) => (a.position || 0) - (b.position || 0) || new Date(b.created_at) - new Date(a.created_at));
    }
    
    return result;
  }, [tasks, searchTerm, filterEmployee, filterPriority, sortOption]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0B1121]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2980B9] mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando Kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-24 min-h-screen bg-gray-50 dark:bg-[#0B1121] transition-colors duration-300 overflow-x-hidden flex flex-col">
      <div className="max-w-screen-2xl mx-auto w-full flex-1 flex flex-col h-full">
        {/* Header e Controles */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2980B9] text-3xl">view_kanban</span>
                Quadro de Tarefas
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Gerencie as atividades, mova os cartões e acompanhe o progresso.
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-[#2980B9] hover:bg-[#2980B9]/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-[#2980B9]/20 active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined">add</span>
              Nova Tarefa
            </button>
          </div>

          {/* Barra de Filtros */}
          <div className="bg-white dark:bg-[#1A2438] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                placeholder="Buscar tarefas ou tags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9] text-sm text-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterEmployee}
                onChange={e => setFilterEmployee(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9] text-sm text-gray-800 dark:text-gray-100"
              >
                <option value="">Todos os Responsáveis</option>
                <option value="none">Sem Responsável</option>
                {employees?.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9] text-sm text-gray-800 dark:text-gray-100"
              >
                <option value="">Todas as Prioridades</option>
                {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>

              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9] text-sm text-gray-800 dark:text-gray-100 font-medium text-[#2980B9]"
              >
                <option value="manual">Ordenar: Manual (Criação)</option>
                <option value="due_date">Ordenar: Prazo Mínimo</option>
                <option value="priority">Ordenar: Maior Prioridade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quadro Kanban */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar snap-x">
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              const isDragOver = dragOverCol === col.id;
              
              return (
                <div 
                  key={col.id} 
                  className={`flex-1 min-w-[320px] max-w-[400px] bg-gray-200/40 dark:bg-gray-800/20 rounded-2xl p-4 flex flex-col border-2 transition-colors snap-center h-full
                    ${isDragOver ? 'border-[#2980B9] bg-[#2980B9]/5 dark:bg-[#2980B9]/10' : 'border-transparent dark:border-gray-700/30'}
                  `}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center justify-between sticky top-0 bg-transparent z-10 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${col.color} shadow-sm`}></div>
                      <span className="tracking-wide uppercase text-sm">{col.title}</span>
                    </div>
                    <span className="bg-gray-300/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                      {colTasks.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-10 custom-scrollbar relative min-h-[200px]">
                    {colTasks.map(task => {
                      const prio = priorities.find(p => p.id === task.priority) || priorities[1];
                      const isLate = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                      
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => openModal(task)}
                          className={`group bg-white dark:bg-[#1A2438] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 cursor-pointer transition-all duration-300 relative overflow-hidden
                            ${draggedTaskId === task.id ? 'opacity-40 scale-[0.98]' : 'hover:-translate-y-1 hover:shadow-lg hover:border-[#2980B9]/40'}
                            ${isLate ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'}
                          `}
                        >
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${prio.color}`}>
                                {prio.label}
                              </span>
                              {task.tags?.map((tag, idx) => (
                                <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 truncate max-w-[80px]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex gap-1">
                              {task.status !== 'completed' && (
                                <button 
                                  onClick={(e) => handleQuickComplete(task, e)}
                                  title="Marcar como concluído"
                                  className="text-gray-300 hover:text-green-500 transition-colors p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                </button>
                              )}
                              <button 
                                onClick={(e) => handleDelete(task.id, e)}
                                title="Excluir"
                                className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 leading-snug">{task.name}</h3>
                          
                          {task.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/30">
                            {task.employee_id ? (
                              <div className="flex items-center gap-2 group/emp" title={task.employees?.name}>
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2980B9] to-[#1A5276] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-[#2980B9]/20">
                                  {task.employees?.name?.charAt(0) || "?"}
                                </div>
                                <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[80px] group-hover/emp:text-[#2980B9] transition-colors">
                                  {task.employees?.name?.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">Sem atribuição</span>
                            )}
                            
                            <div className="flex flex-col items-end gap-1">
                              {task.due_date && (
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isLate 
                                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900' 
                                    : 'text-gray-500 bg-gray-100 dark:bg-gray-800'
                                }`}>
                                  <span className="material-symbols-outlined text-[12px]">{isLate ? 'warning' : 'event'}</span>
                                  {new Date(task.due_date).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'})}
                                </div>
                              )}
                              {task.status === 'completed' && task.completed_at && (
                                <div className="text-[9px] text-green-600 font-medium">
                                  Feito em {new Date(task.completed_at).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Botão de Nova Tarefa na Coluna */}
                    <button
                      onClick={() => openModal(null, col.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Adicionar Cartão
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Nova/Editar Tarefa */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="bg-white dark:bg-[#1A2438] rounded-2xl p-6 md:p-8 w-full max-w-xl relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2980B9]">{editingTask ? "edit_note" : "add_task"}</span>
                {editingTask ? "Editar Cartão" : "Novo Cartão"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Refatorar página de login"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#2980B9] transition-all text-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Status (Coluna)</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#2980B9] transition-all text-gray-800 dark:text-gray-100 font-medium"
                  >
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#2980B9] transition-all text-gray-800 dark:text-gray-100 font-medium"
                  >
                    {priorities.map(prio => (
                      <option key={prio.id} value={prio.id}>{prio.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Adicione detalhes, links e instruções..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#2980B9] transition-all min-h-[100px] resize-none text-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tags (Opcional)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ex: Frontend, Urgente, Bug (separado por vírgula)"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#2980B9] transition-all text-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Responsável</label>
                  <select
                    value={formData.employee_id}
                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#2980B9] transition-all text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Não atribuído</option>
                    {employees?.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#2980B9] transition-all text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-gray-100 dark:border-gray-700/50 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#2980B9] to-[#1A5276] hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#2980B9]/30 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {editingTask ? 'save' : 'add_task'}
                  </span>
                  {editingTask ? "Salvar Alterações" : "Criar Cartão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
