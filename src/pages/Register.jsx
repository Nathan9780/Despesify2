import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/layout/ui/Logo";

// CPF validation algorithm
function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf === "" || cpf.length !== 11) return false;

  // Eliminates known invalid CPFs
  if (/^(.)\1+$/.test(cpf)) return false;

  let add = 0;
  for (let i = 0; i < 9; i++) {
    add += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  add = 0;
  for (let i = 0; i < 10; i++) {
    add += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.plan) {
          navigate("/dashboard");
        } else {
          navigate("/select-plan");
        }
      } catch (e) {
        console.error("Failed to parse currentUser in Register", e);
      }
    }
  }, [navigate]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "",
    city: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    cpf: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Formatting inputs in real time
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    // Mask: (XX) XXXXX-XXXX
    let formatted = "";
    if (value.length > 0) {
      formatted += "(" + value.substring(0, 2);
    }
    if (value.length > 2) {
      formatted += ") " + value.substring(2, 7);
    }
    if (value.length > 7) {
      formatted += "-" + value.substring(7, 11);
    }

    setFormData((prev) => ({ ...prev, phone: formatted || value }));
  };

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    // Mask: XXX.XXX.XXX-XX
    let formatted = "";
    if (value.length > 0) {
      formatted += value.substring(0, 3);
    }
    if (value.length > 3) {
      formatted += "." + value.substring(3, 6);
    }
    if (value.length > 6) {
      formatted += "." + value.substring(6, 9);
    }
    if (value.length > 9) {
      formatted += "-" + value.substring(9, 11);
    }

    setFormData((prev) => ({ ...prev, cpf: formatted || value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    // 1. Mandatory validation
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "Este campo é obrigatório.";
      }
    });

    // 2. Email format & check
    if (formData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = "Insira um formato de e-mail válido.";
      } else {
        // Check if email already registered in mock DB
        const usersStr = localStorage.getItem("users");
        const users = usersStr ? JSON.parse(usersStr) : [];
        const isRegistered =
          users.some(
            (u) => u.email.toLowerCase() === formData.email.toLowerCase(),
          ) || formData.email.toLowerCase() === "demo@despesify.com";
        if (isRegistered) {
          newErrors.email = "Este e-mail já está cadastrado.";
        }
      }
    }

    // 3. Password matching
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas devem coincidir.";
      }
    }

    // 4. CPF validity
    if (formData.cpf) {
      const plainCpf = formData.cpf.replace(/[^\d]/g, "");
      if (plainCpf.length !== 11) {
        newErrors.cpf = "O CPF deve conter 11 dígitos.";
      } else if (!validateCPF(plainCpf)) {
        newErrors.cpf = "CPF inválido. Insira um número de CPF real.";
      }
    }

    // 5. Age validation (minimum 18 years)
    if (formData.birthDate) {
      const today = new Date();
      const birth = new Date(formData.birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (isNaN(birth.getTime())) {
        newErrors.birthDate = "Data de nascimento inválida.";
      } else if (age < 18) {
        newErrors.birthDate = "Idade mínima permitida: 18 anos.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // Save user to simulated DB
    setTimeout(() => {
      const usersStr = localStorage.getItem("users");
      const users = usersStr ? JSON.parse(usersStr) : [];

      const newUser = {
        name: formData.name,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate,
        cpf: formData.cpf,
        plan: null, // selected in next step
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      setIsLoading(false);
      navigate("/select-plan");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-white dark:bg-inverse-surface/5 border border-outline-variant/30 rounded-2xl shadow-xl p-8 backdrop-blur-md relative z-10">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-label text-on-surface-variant hover:text-primary transition-colors mb-6 group"
        >
          <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Voltar para o Login
        </Link>

        {/* Heading */}
        <div className="text-center mb-8">
          <Logo variant="icon" className="mx-auto mb-4 shadow-md" imgClassName="w-12 h-12" />
          <h2 className="font-title text-2xl font-bold text-on-surface">
            Crie sua conta gratuitamente
          </h2>
          <p className="font-body text-xs text-on-surface-variant mt-2">
            Crie sua conta gratuitamente e comece a organizar seus projetos.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome Completo */}
            <div className="col-span-1 md:col-span-2">
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: João da Silva"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.name ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.name && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.cpf ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.cpf && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.cpf}
                </p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.birthDate ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.birthDate && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.birthDate}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.phone ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.phone && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                E-mail
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seuemail@exemplo.com"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.email ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.email && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                Estado
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Ex: São Paulo"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.state ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.state && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.state}
                </p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                Cidade
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Campinas"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.city ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.city && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.city}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                Senha
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.password ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.password && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1 font-bold">
                Confirmar Senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita sua senha"
                className={`w-full px-4 py-2.5 rounded-xl bg-surface border ${errors.confirmPassword ? "border-error" : "border-outline-variant/60"} text-body font-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm`}
              />
              {errors.confirmPassword && (
                <p className="text-error font-label text-[10px] mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Create Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 bg-primary text-on-primary font-label text-sm font-bold rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              <>
                Criar Conta
                <span className="material-symbols-outlined text-lg">
                  person_add
                </span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center font-label text-xs text-on-surface-variant mt-6 pt-4 border-t border-outline-variant/20">
          <span>Já possui uma conta? </span>
          <Link to="/login" className="text-primary font-bold hover:underline">
            Faça seu login
          </Link>
        </div>
      </div>
    </div>
  );
}
