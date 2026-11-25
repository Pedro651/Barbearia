
"use client";

// ADICIONADO: useRef para controlar e resetar o CAPTCHA.
import { useState, useContext, FormEvent, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

// ADICIONADO: componente do Google reCAPTCHA v2.
import ReCAPTCHA from "react-google-recaptcha";

export default function AuthPage() {
  const { signIn, signUp } = useContext(AuthContext);
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ADICIONADO: armazena o token gerado pelo Google CAPTCHA.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // ADICIONADO: permite controlar o componente CAPTCHA.
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !password.trim()) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    if (!isLogin && !name.trim()) {
      setErro("Preencha seu nome completo.");
      return;
    }

    // ADICIONADO: impede o envio se o CAPTCHA não foi resolvido.
    if (!captchaToken) {
      setErro("Confirme que você não é um robô.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Remove um desafio anterior.
        sessionStorage.removeItem("twoFactorChallengeId");
        sessionStorage.removeItem("twoFactorEmail");

        const resposta = await signIn({
          email: email.trim(),
          password,

          // ADICIONADO: envia o token CAPTCHA para o AuthContext.
          captchaToken,
        });

        // Confirma se o backend iniciou o 2FA.
        if (
          resposta?.twoFactorRequired === true &&
          resposta?.emailSent === true &&
          typeof resposta?.challengeId === "string" &&
          resposta.challengeId.length > 0
        ) {
          sessionStorage.setItem(
            "twoFactorChallengeId",
            resposta.challengeId
          );

          sessionStorage.setItem(
            "twoFactorEmail",
            email.trim()
          );

          setPassword("");

          router.push("/verificar-codigo");
          return;
        }

        setErro(
          "O e-mail não foi confirmado pelo servidor. Tente novamente."
        );
      } else {
        await signUp({
          name: name.trim(),
          email: email.trim(),
          password,

          // ADICIONADO: envia o token CAPTCHA no cadastro.
          captchaToken,
        });

        setIsLogin(true);
        setPassword("");
        setErro("");
      }
    } catch (err: any) {
      console.error("Erro na autenticação:", err);

      const mensagem = err?.response?.data?.message;

      setErro(
        Array.isArray(mensagem)
          ? mensagem.join(", ")
          : mensagem || err?.message || "Não foi possível realizar a operação."
      );
    } finally {
      setLoading(false);

      // ADICIONADO: invalida o token e reseta o CAPTCHA após a tentativa.
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    }
  }

  function trocarAba(login: boolean) {
    setIsLogin(login);
    setPassword("");
    setErro("");

    // ADICIONADO: reseta o CAPTCHA ao trocar entre login e cadastro.
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
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

        <div className="mb-8 grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          <button
            type="button"
            onClick={() => trocarAba(true)}
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
            onClick={() => trocarAba(false)}
            className={`rounded-md py-3 text-xs font-black uppercase tracking-wide transition ${
              !isLogin
                ? "bg-black text-white shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            Registrar
          </button>
        </div>

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
                type="text"
                placeholder="Seu nome completo"
                value={name}
                required
                onChange={(e) => {
                  setName(e.target.value);
                  setErro("");
                }}
                className="h-12 w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="voce@email.com"
              value={email}
              required
              onChange={(e) => {
                setEmail(e.target.value);
                setErro("");
              }}
              className="h-12 w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => {
                setPassword(e.target.value);
                setErro("");
              }}
              className="h-12 w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
            />
          </div>

          {/* ADICIONADO: CAPTCHA do Google reCAPTCHA v2. */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
              onErrored={() => {
                setCaptchaToken(null);
                setErro("Erro ao carregar o CAPTCHA. Tente novamente.");
              }}
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
      </div>

      <footer className="mx-auto w-full max-w-md text-center text-xs text-neutral-400">
        © Soares Barbearia. Todos os direitos reservados.
      </footer>
    </main>
  );
}
