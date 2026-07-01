// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { supabase } from "../lib/supabase";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      // 🔥 Login direto com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("E-mail não confirmado. Verifique sua caixa de entrada.");
          setInfoMessage("Confirme seu e-mail antes de fazer login.");
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Sucesso!
      if (data.user) {
        // Opcional: salva o usuário no localStorage para compatibilidade com outras partes do sistema
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError("Erro desconhecido. Tente novamente.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado. Tente novamente.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) {
        if (
          error.message?.includes("provider is not enabled") ||
          error.message?.includes("Unsupported provider")
        ) {
          setError(
            "O login com Google não está habilitado no painel do Supabase. Habilite-o em Authentication > Providers ou entre com e-mail/senha.",
          );
        } else {
          setError(error.message);
        }
        setIsLoading(false);
      }
      // O redirecionamento é automático após o login do Google
    } catch (err) {
      console.error("Erro Google:", err);
      setError("Erro ao fazer login com Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-body select-none">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/15 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-inverse-surface/5 border border-outline-variant/30 rounded-2xl shadow-xl p-8 backdrop-blur-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-label text-on-surface-variant hover:text-primary transition-colors mb-6 group"
        >
          <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Voltar para Início
        </Link>

        <div className="text-center mb-8">
          <Logo
            variant="icon"
            className="mx-auto mb-4 shadow-md"
            imgClassName="w-12 h-12"
          />
          <h2 className="font-title text-2xl font-bold text-on-surface">
            Bem-vindo ao Despesify 2
          </h2>
          <p className="font-body text-xs text-on-surface-variant mt-2 px-2">
            Acesse sua conta para gerenciar seus projetos, finanças,
            fornecedores e investimentos.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-error-container text-on-error-container border border-error/20 font-label text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}
        {infoMessage && (
          <div className="mb-5 p-3 rounded-lg bg-primary-fixed text-on-primary-fixed border border-primary/20 font-label text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 mb-6">
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1.5 font-bold">
              E-mail
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@despesify.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-label text-xs text-on-surface-variant font-bold">
                Senha
              </label>
              <button
                type="button"
                className="font-label text-xs text-primary hover:underline"
                disabled={isLoading}
                onClick={() => {
                  if (!email) {
                    setError("Insira seu e-mail para recuperar a senha.");
                    return;
                  }
                  setInfoMessage(`Link de recuperação enviado para: ${email}`);
                }}
              >
                Esqueceu sua senha?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-on-primary font-label text-sm font-bold rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              <>
                Entrar
                <span className="material-symbols-outlined text-lg">login</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-outline-variant/35"></div>
          <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold">
            Ou entre com
          </span>
          <div className="flex-1 h-[1px] bg-outline-variant/35"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={isLoading}
          className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-label text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-95 mb-6 disabled:opacity-50 disabled:pointer-events-none"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.45 7.55l3.8 2.95c.9-2.7 3.4-4.46 6.75-4.46z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.96h3.9c2.28-2.1 3.55-5.19 3.55-8.68z"
            />
            <path
              fill="#FBBC05"
              d="M5.25 14.5c-.25-.75-.39-1.55-.39-2.5s.14-1.75.39-2.5L1.45 6.55C.52 8.4.01 10.45.01 12.6c0 2.15.51 4.2 1.44 6.05l3.8-3.15z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.9-2.96c-1.08.72-2.45 1.16-4.06 1.16-3.35 0-6.19-2.2-7.2-5.27l-3.8 2.95C3.37 20.35 7.35 23 12 23z"
            />
          </svg>
          {isLoading ? "Carregando..." : "Entrar com Google"}
        </button>

        <div className="text-center font-label text-xs text-on-surface-variant">
          <span>É novo por aqui? </span>
          <Link
            to="/register"
            className="text-primary font-bold hover:underline"
          >
            Faça seu cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
