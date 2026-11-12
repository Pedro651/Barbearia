"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  LockKeyhole,
  Mail,
  Save,
} from "lucide-react";

import { AuthContext } from "@/context/AuthContext";
import { api } from "../../../service/apiClient";

export default function EditarPerfil() {
  const router = useRouter();
  const { user, isAuthenticated,  } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
   
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    setName(user.name || "");
    setEmail(user.email || "");
  }, [user, isAuthenticated, router]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (password && password !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      const dados: {
        name: string;
        email: string;
        password?: string;
      } = {
        name: name.trim(),
        email: email.trim(),
      };

      // Só envia a senha se o usuário quiser alterá-la.
      if (password) {
        dados.password = password;
      }

      const response = await api.patch(`/users/${user.id}`, dados);

      // Atualiza os campos com os dados retornados, se disponíveis.
      if (response.data?.name) {
        setName(response.data.name);
      }

      if (response.data?.email) {
        setEmail(response.data.email);
      }

      setPassword("");
      setConfirmarSenha("");
      setSucesso("Seus dados foram atualizados com sucesso!");
    } catch (error: any) {
      const mensagem = error.response?.data?.message;

      setErro(
        Array.isArray(mensagem)
          ? mensagem.join(", ")
          : mensagem || "Não foi possível atualizar seus dados."
      );
    } finally {
      setLoading(false);
    }
  }

 

  const inputClass =
    "w-full rounded-xl border border-neutral-800 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#e8c547]";

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-[#e8c547]"
        >
          <ArrowLeft size={18} />
          Voltar ao perfil
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#e8c547]">
            Soares Barbearia
          </p>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Editar perfil
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Atualize seu nome, e-mail ou senha.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-neutral-800 bg-[#111111] p-6 sm:p-8"
        >
          {/* Nome */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UserRound size={17} className="text-[#e8c547]" />
              Nome completo
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={inputClass}
              required
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Mail size={17} className="text-[#e8c547]" />
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className={inputClass}
              autoComplete="email"
              required
            />
          </div>

          {/* Nova senha */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <LockKeyhole size={17} className="text-[#e8c547]" />
              Nova senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe vazio para manter a senha atual"
              className={inputClass}
              autoComplete="new-password"
            />
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <LockKeyhole size={17} className="text-[#e8c547]" />
              Confirmar nova senha
            </label>

            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a nova senha novamente"
              className={inputClass}
              autoComplete="new-password"
            />
          </div>

          {erro && (
            <p role="alert" className="text-sm text-red-400">
              {erro}
            </p>
          )}

          {sucesso && (
            <p role="status" className="text-sm text-[#e8c547]">
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e8c547] px-6 py-3 font-bold text-black transition hover:bg-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </main>
  );
}