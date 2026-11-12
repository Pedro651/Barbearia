
"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  useEffect(() => {
  setMontado(true);
}, []);
  
  const { user, isAuthenticated,signOut } = useContext(AuthContext);
const router = useRouter();

  const fecharMenu = () => setMenuAberto(false);

  function signOutt() {
    signOut();
    router.push("/");
  }


  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white text-black shadow-sm">
      <div className="mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          onClick={fecharMenu}
          className="shrink-0 font-serif text-xl leading-none"
        >
          SOARES
          <span className="mt-1 block text-center text-[7px] tracking-widest">
            BARBEARIA
          </span>
        </Link>

        {/* Links do computador */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          <Link
            href="/#servicos"
            className="text-xs font-semibold hover:text-yellow-700"
          >
            SERVIÇOS
          </Link>

          <Link
            href="/#produtos"
            className="text-xs font-semibold hover:text-yellow-700"
          >
            PRODUTOS
          </Link>

          <Link
            href="/#equipe"
            className="text-xs font-semibold hover:text-yellow-700"
          >
            EQUIPE
          </Link>

          <Link
            href="/#localizacao"
            className="text-xs font-semibold hover:text-yellow-700"
          >
            VISITE
          </Link>

          {montado && user?.role === "ADMIN" && (
            <>
              <Link
                href="/pedidos"
                className="text-xs font-semibold hover:text-yellow-700"
              >
                Pedidos
              </Link>

              <Link
                href="/servicos"
                className="text-xs font-semibold hover:text-yellow-700"
              >
                Serviços
              </Link>
              <Link
                href="/agenda"
                className="text-xs font-semibold hover:text-yellow-700"
              >
                Agenda
              </Link>
            </>
          )}
        </nav>

        {/* Botões */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
    {isAuthenticated ? (
      <>
        <Link
          href="/editar"
          title={user?.name || "Meu perfil"}
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white sm:inline-flex"
        >
          <UserRound size={20} strokeWidth={1.8} />
        </Link>

        <button
          onClick={signOutt}
          className="rounded-full border border-black bg-black px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-black"
  >
          Sair
        </button>
      </>
    ) : (
      <Link
        href="/login"
        className="hidden rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold text-white sm:inline-flex"
      >
        Entrar
      </Link>
    )}

    <Link
      href="/agendar"
      className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white sm:px-5"
    >
      Agendar
    </Link>
  </div>

          {/* Menu do celular */}
          <button
            type="button"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            className="flex h-9 w-9 items-center justify-center text-2xl text-black md:hidden"
          >
            {menuAberto ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* Links do celular */}
      {menuAberto && (
        <nav className="flex flex-col gap-1 border-t border-neutral-200 bg-white px-4 py-3 text-black md:hidden">
          <Link
            href="/#servicos"
            onClick={fecharMenu}
            className="py-3 text-sm font-semibold"
          >
            Serviços
          </Link>

          <Link
            href="/#produtos"
            onClick={fecharMenu}
            className="py-3 text-sm font-semibold"
          >
            Produtos
          </Link>

          <Link
            href="/#equipe"
            onClick={fecharMenu}
            className="py-3 text-sm font-semibold"
          >
            Equipe
          </Link>

          <Link
            href="/#localizacao"
            onClick={fecharMenu}
            className="py-3 text-sm font-semibold"
          >
            Visite
          </Link>

          <Link
            href="/login"
            onClick={fecharMenu}
            className="py-3 text-sm font-semibold sm:hidden"
          >
            Entrar
          </Link>
        </nav>
      )}
    </header>
  );
}
