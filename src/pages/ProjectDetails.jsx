import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useProjectFiles } from "../hooks/useProjectFiles";
import { supabase } from "../lib/supabase";
import { useProjectFollows } from "../hooks/useProjectFollows";
import { useProjectComments } from "../hooks/useProjectComments";

function getHealthColor(project) {
  const budget = project.budget || 0;
  const spent = project.spent || 0;
  if (budget <= 0) return "green";
  const ratio = spent / budget;
  if (ratio <= 0.5) return "green";
  if (ratio <= 0.8) return "yellow";
  return "red";
}

function getHealthDot(color) {
  if (color === "green") return "🟢";
  if (color === "yellow") return "🟡";
  return "🔴";
}

function getHealthLabel(color) {
  if (color === "green") return "Saudável";
  if (color === "yellow") return "Atenção";
  return "Crítico";
}

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, isLoading: loadingProjects } = useProjects();
  const { tasks, isLoading: loadingTasks } = useTasks();
  const { files, isLoading: loadingFiles, uploadFile, deleteFile, getFileUrl } = useProjectFiles(id);

  const { follows, isFollowing, toggleFollow } = useProjectFollows(id);
  const { comments, isLoading: loadingComments, addComment, deleteComment } = useProjectComments(id);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [uploading, setUploading] = useState(false);

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
  const healthColor = getHealthColor(project);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório do Projeto", 14, 22);
    doc.setFontSize(11);
    doc.text(`Nome: ${project.name}`, 14, 35);
    doc.text(`Orçamento: R$ ${project.budget?.toLocaleString()}`, 14, 42);
    doc.text(`Gasto: R$ ${project.spent?.toLocaleString()}`, 14, 49);
    doc.text(`Progresso: ${project.progress || 0}%`, 14, 56);
    doc.autoTable({
      startY: 65,
      head: [["Tarefa", "Status", "Prioridade"]],
      body: projectTasks.map(t => [
        t.name,
        t.status === 'completed' ? 'Concluída' : t.status === 'in_progress' ? 'Em Progresso' : 'Pendente',
        t.priority || 'Média'
      ])
    });
    doc.save(`relatorio-${project.name}.pdf`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile.mutateAsync({ projectId: id, file, fileName: file.name });
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${file.file_name}"?`)) return;
    try {
      await deleteFile.mutateAsync({ id: file.id, filePath: file.file_path });
    } catch (err) {
      console.error("Erro ao excluir arquivo:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <style>{`
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
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/projects")} className="text-gray-500 hover:text-blue-600">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              healthColor === "green" ? "bg-green-100 text-green-700" :
              healthColor === "yellow" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {getHealthDot(healthColor)} {getHealthLabel(healthColor)}
            </span>
          </div>
          <p className="text-sm text-gray-500">{project.category} • {project.visibility === 'public' ? 'Público' : 'Privado'}</p>
        </div>
        {project.visibility === 'public' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFollow.mutate()}
              disabled={toggleFollow.isPending}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isFollowing ? 'person_remove' : 'person_add'}
              </span>
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
            <span className="text-sm text-gray-500">{follows.length} seguidor{follows.length !== 1 ? 'es' : ''}</span>
          </div>
        )}
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-xl p-6 hover-lift">
          <p className="text-gray-500 text-sm mb-1">Orçamento Total</p>
          <p className="text-2xl font-bold text-blue-600">R$ {project.budget?.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-6 hover-lift">
          <p className="text-gray-500 text-sm mb-1">Gasto Atual</p>
          <p className="text-2xl font-bold text-red-500">R$ {project.spent?.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-6 hover-lift">
          <p className="text-gray-500 text-sm mb-1">Progresso</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-green-600">{project.progress || 0}%</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${project.progress || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 mb-6">
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

      <div className="glass-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Arquivos do Projeto</h2>
          <label className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer ${
            uploading ? 'bg-gray-400 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            <span className="material-symbols-outlined text-lg">upload</span>
            {uploading ? "Enviando..." : "Upload"}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {loadingFiles ? (
          <p className="text-gray-500">Carregando arquivos...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum arquivo vinculado a este projeto.</p>
        ) : (
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">description</span>
                  <a
                    href={getFileUrl(file.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-800 hover:text-blue-600"
                  >
                    {file.file_name}
                  </a>
                </div>
                <button
                  onClick={() => handleDeleteFile(file)}
                  className="px-3 py-1.5 border border-red-300 rounded-lg hover:bg-red-50 text-sm text-red-500 flex items-center gap-1"
                  title="Excluir arquivo"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {project.visibility === 'public' && (
        <div className="glass-card rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Comentários</h2>

          {loadingComments ? (
            <p className="text-gray-500">Carregando comentários...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-4 mb-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {c.profiles?.avatar_url ? (
                      <img src={c.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      (c.profiles?.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-gray-800">{c.profiles?.name || "Usuário"}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{c.comment}</p>
                    {c.user_id === currentUserId && (
                      <button
                        onClick={() => deleteComment.mutate(c.id)}
                        disabled={deleteComment.isPending}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (!newComment.trim()) return;
                addComment.mutate({ project_id: id, comment: newComment.trim() }, {
                  onSuccess: () => setNewComment(""),
                });
              }}
              disabled={addComment.isPending || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
            >
              {addComment.isPending ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
