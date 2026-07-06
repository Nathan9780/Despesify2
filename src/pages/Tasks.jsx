import React, { useState, useMemo } from "react";
import { useTasks } from "../hooks/useTasks";
import { useEmployees } from "../hooks/useEmployees";
import toast from "react-hot-toast";

const columns = [
  { id: "pending", title: "A Fazer" },
  { id: "in_progress", title: "Em Progresso" },
  { id: "completed", title: "Concluído" },
];

export function Tasks() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const { employees } = useEmployees();
  const [showModal, setShowModal] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    employee_id: "",
    due_date: "",
  });

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    
    setDraggedTaskId(null);
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      try {
        await updateTask.mutateAsync({ id: taskId, status: targetStatus });
        toast.success("Tarefa atualizada!");
      } catch (err) {
        toast.error("Erro ao mover tarefa");
      }
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync({
        name: formData.name,
        description: formData.description,
        employee_id: formData.employee_id || null,
        due_date: formData.due_date || null,
        status: "pending"
      });
      toast.success("Tarefa criada!");
      setShowModal(false);
      setFormData({ name: "", description: "", employee_id: "", due_date: "" });
    } catch (err) {
      toast.error("Erro ao criar tarefa");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir esta tarefa?")) {
      try {
        await deleteTask.mutateAsync(id);
        toast.success("Tarefa excluída");
      } catch (err) {
        toast.error("Erro ao excluir");
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Carregando tarefas...</div>;
  }

  return (
    <div className="p-4 md:p-8 pt-24 min-h-screen bg-gray-50 dark:bg-[#0B1121] transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-display">Quadro de Tarefas</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Organize e acompanhe as atividades da sua equipe.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#2980B9] hover:bg-[#2980B9]/90 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-[#2980B9]/20"
          >
            <span className="material-symbols-outlined">add</span>
            Nova Tarefa
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)] overflow-x-auto pb-4">
          {columns.map(col => (
            <div 
              key={col.id} 
              className="flex-1 min-w-[300px] bg-gray-200/50 dark:bg-gray-800/30 rounded-2xl p-4 flex flex-col border border-gray-200 dark:border-gray-700/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-between">
                {col.title}
                <span className="bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-sm">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </h2>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-10">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`bg-white dark:bg-[#1A2438] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 cursor-move transition-transform ${draggedTaskId === task.id ? 'opacity-50' : 'hover:-translate-y-1 hover:shadow-md'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{task.name}</h3>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-700/30">
                      {task.employee_id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {task.employees?.name?.charAt(0) || "?"}
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                            {task.employees?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Não atribuído</span>
                      )}
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white dark:bg-[#1A2438] rounded-2xl p-6 w-full max-w-md relative z-10 shadow-xl border border-gray-100 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Nova Tarefa</h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9] min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atribuir a</label>
                <select
                  value={formData.employee_id}
                  onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9]"
                >
                  <option value="">Selecione um funcionário...</option>
                  {employees?.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Limite (Opcional)</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#2980B9]"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2980B9] hover:bg-[#2980B9]/90 text-white py-2.5 rounded-xl font-medium transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
