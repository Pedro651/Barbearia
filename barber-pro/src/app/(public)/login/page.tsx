"use client";

import { useState, useContext, FormEvent } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");




  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

     if (isLogin) {
    if (!email.trim() || !password.trim()) {
      setErro("Preencha o e-mail e a senha");
      return;
    }
  } else {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErro("Preencha o e-mail, a senha e o nome");
      return;
    }
  }

    setLoading(true);



    try {
      if (isLogin) {
        await signIn({
          email,
          password,
        });

        setEmail("");
        setPassword("");
      } else {
        await signUp({
          name,
          email,
          password,
        });

        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      console.error("Erro capturado no handleSubmit:", err);
    } finally {
    // Finaliza o carregamento mesmo quando ocorre um erro
    setLoading(false);
  }
  }

  return (
    <main className="flex min-h-screen flex-col justify-between bg-white px-5 py-10 text-black sm:px-10 lg:px-12">
      {/* Topo */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 transition hover:text-black"
        >
          ← Voltar para a home
        </Link>

        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
          SOARES BARBEARIA
        </span>
      </div>

      {/* Conteúdo central */}
      <div className="mx-auto my-auto w-full max-w-md py-8">
        <div className="mb-8 flex flex-col items-start">
          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
            SUA CONTA SOARES
          </span>

          <h1 className="text-4xl font-black uppercase tracking-[-0.050em] sm:text-5xl">
            {isLogin ? "ENTRAR" : "REGISTRAR"}
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {isLogin
              ? "Bem-vindo de volta. Entre para continuar."
              : "Crie a sua conta para agendar e gerir o seu estilo."}
          </p>
        </div>

        {/* Abas */}
        <div className="mb-8 grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErro("");
            }}
            className={`rounded-md py-3 text-xs font-black uppercase tracking-wide transition ${
              isLogin
                ? "bg-black text-white shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErro("");
            }}
            className={`rounded-md py-3 text-xs font-black uppercase tracking-wide transition ${
              !isLogin
                ? "bg-black text-white shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            Registrar
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-[11px] font-bold uppercase tracking-wider text-neutral-700"
              >
                Nome completo
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErro("");
                }}
                className="h-12 w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 text-sm text-black transition placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {/* E-mail */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErro("");
              }}
              className="h-12 w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 text-sm text-black transition placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              Senha
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErro("");
              }}
              className="h-12 w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 text-sm text-black transition placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
            />
          </div>

          {/* Erro ao entrar ou registrar */}
          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span aria-hidden="true">⚠</span>
              <p>{erro}</p>
            </div>
          )}

          {/* Botão de envio */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-black px-6 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Carregando..."
              : isLogin
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        {/* Divisor */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>

          <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            
          </span>
        </div>

        
      </div>

      {/* Rodapé */}
      <footer className="mx-auto w-full max-w-md text-center text-xs text-neutral-400">
        © Soares Barbearia. Todos os direitos reservados.
      </footer>
    </main>
  );
}