"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useContext(AuthContext); // Adicionado isLoading
  const router = useRouter();

  useEffect(() => {
    // Só redireciona se O CARREGAMENTO ACABOU e o usuário não for ADMIN
    if ( isAuthenticated && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isAuthenticated, user,  router]);

  

  // 2. Se terminou de carregar e não está autenticado ou não é admin
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <p className="p-6 text-center text-sm font-semibold">Acesso não autorizado.</p>;
  }

  // 3. Tudo certo, renderiza o conteúdo protegido
  return <>{children}</>;
}