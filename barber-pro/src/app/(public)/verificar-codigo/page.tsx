
"use client";

import { useState, useContext, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function VerificarCodigoPage() {
  const { verifyTwoFactor } = useContext(AuthContext);
  const router = useRouter();

  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [challengeId, setChallengeId] = useState("");

  useEffect(() => {
    const desafio = sessionStorage.getItem("twoFactorChallengeId");
    const emailSalvo = sessionStorage.getItem("twoFactorEmail");

    if (!desafio) {
      router.replace("/login");
      return;
    }

    setChallengeId(desafio);
    setEmail(emailSalvo || "");
  }, [router]);

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!challengeId) {
      setErro("Faça login novamente para solicitar outro código.");
      router.replace("/login");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setErro("O código precisa ter exatamente 6 números.");
      return;
    }

    setLoading(true);

    try {
      await verifyTwoFactor(challengeId, code);

      // Remove os dados temporários após a autenticação
      sessionStorage.removeItem("twoFactorChallengeId");
      sessionStorage.removeItem("twoFactorEmail");

      router.replace("/");
    } catch (err: any) {
      console.error("Erro ao verificar código:", err);

      const mensagem = err?.response?.data?.message;

      setErro(
        Array.isArray(mensagem)
          ? mensagem.join(", ")
          : mensagem || "Código inválido ou expirado."
      );
    } finally {
      setLoading(false);
    }
  }

  function voltarParaLogin() {
    sessionStorage.removeItem("twoFactorChallengeId");
    sessionStorage.removeItem("twoFactorEmail");

    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen flex-col justify-between bg-white px-5 py-10 text-black sm:px-10 lg:px-12">
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

      <div className="mx-auto my-auto w-full max-w-md py-8">
        <div className="mb-8 flex flex-col items-start">
          <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
            SEGURANÇA DA SUA CONTA
          </span>

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <span className="text-2xl">✉</span>
          </div>

          <h1 className="text-4xl font-black uppercase tracking-[-0.050em]">
            VERIFICAR
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Digite os 6 números enviados para seu e-mail para acessar sua conta.
          </p>

          <p className="mt-3 text-sm font-bold text-black">
            {email}
          </p>
        </div>

        <form
          onSubmit={handleVerifyCode}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="code"
              className="text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              Código de verificação
            </label>

            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setErro("");
              }}
              className="h-16 w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 text-center text-2xl font-black tracking-[0.5em] text-black placeholder:text-neutral-300 focus:border-[#d4af37] focus:bg-white focus:outline-none"
            />
          </div>

          {erro && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              ⚠ {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6 || !challengeId}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-black px-6 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Confirmar código"}
          </button>

          <button
            type="button"
            onClick={voltarParaLogin}
            disabled={loading}
            className="h-12 w-full text-xs font-bold uppercase tracking-wide text-neutral-500 transition hover:text-black"
          >
            ← Voltar para o login
          </button>
        </form>
      </div>

      <footer className="mx-auto w-full max-w-md text-center text-xs text-neutral-400">
        © Soares Barbearia. Todos os direitos reservados.
      </footer>
    </main>
  );
}
