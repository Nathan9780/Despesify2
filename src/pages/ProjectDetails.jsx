import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, isLoading: loadingProjects } = useProjects();
  const { tasks, isLoading: loadingTasks } = useTasks();
  
  const [project, setProject] = useState(null);
  
  useEffect(() => {
    if (projects) {
      const p = projects.find(proj => proj.id === id);
      if (p) {
        setProject(p);
      }
    }
  }, [projects, id]);

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Projeto não encontrado</h2>
        <button onClick={() => navigate("/projects")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Voltar para Projetos
        </button>
      </div>
    );
  }

  const projectTasks = tasks?.filter(t => t.project_id === id) || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/projects")} className="text-gray-500 hover:text-blue-600">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.category} • {project.visibility === 'public' ? 'Público' : 'Privado'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Orçamento Total</p>
          <p className="text-2xl font-bold text-blue-600">R$ {project.budget?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Gasto Atual</p>
          <p className="text-2xl font-bold text-red-500">R$ {project.spent?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Progresso</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-green-600">{project.progress || 0}%</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${project.progress || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tarefas do Projeto</h2>
          <Link to="/tasks" className="text-sm text-blue-600 hover:underline">Ver no Quadro Kanban</Link>
        </div>
        
        {loadingTasks ? (
           <p className="text-gray-500">Carregando tarefas...</p>
        ) : projectTasks.length === 0 ? (
           <p className="text-gray-500 text-center py-8">Nenhuma tarefa vinculada a este projeto.</p>
        ) : (
          <div className="space-y-3">
            {projectTasks.map(task => (
              <div key={task.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-800">{task.name}</h3>
                  {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
