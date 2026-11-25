
"use client";

import {
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  destroyCookie,
  parseCookies,
  setCookie,
} from "nookies";

import { useRouter } from "next/navigation";
import { api } from "../service/apiClient";

interface AuthContextData {
  user: UserProps | undefined;
  isAuthenticated: boolean;

  signIn: (credentials: SignInProps) => Promise<LoginResult>;
  verifyTwoFactor: (challengeId: string, code: string) => Promise<void>;

  signUp: (credentials: SignUpProps) => Promise<void>;
  logoutUser: () => Promise<void>;
  signOut: () => void;
  createAgenda: (data: agendoProps) => Promise<void>;
  buscarTodos: (dados: buscarAgenda) => Promise<any>;
  pegarEmail: () => Promise<buscaConta[]>;
  mudarRole: (userId: string, novaRole: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<void>;
}

interface LoginResult {
  twoFactorRequired: boolean;
  emailSent: boolean;
  challengeId?: string;
  message?: string;
}

interface UserProps {
  id: string;
  name: string;
  email: string;
  endereco: string | null;
  role: "ADMIN" | "CLIENTE";
  subscriptions?: SubscriptionProps | null;
}

interface SubscriptionProps {
  id: string;
  status: string;
}

type AuthProviderProps = {
  children: ReactNode;
};

// ADICIONADO: captchaToken para receber o token do Google no login.
interface SignInProps {
  email: string;
  password: string;
  captchaToken: string;
}

// ADICIONADO: captchaToken para receber o token do Google no cadastro.
interface SignUpProps {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
}

type agendoProps = {
  date: string;
  barbeiro: string;
  hour: string;
  horarioId: string;
  servico: string;
};

interface buscarAgenda {
  name: string;
  email: string;
  date: string;
  barbeiro: string;
  hour: string;
  servico: string;
}

interface buscaConta {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENTE";
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>();

  const router = useRouter();
  const isAuthenticated = !!user;

  // Salva o token e os dados do usuário após autenticação.
  function saveSession(data: any, emailFallback?: string) {
    const {
      id,
      name,
      email,
      token,
      subscriptions,
      endereco,
      role,
    } = data;

    if (!token) {
      throw new Error("O servidor não retornou o token de autenticação.");
    }

    setCookie(undefined, "@barber.token", token, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser({
      id,
      name,
      email: email || emailFallback || "",
      endereco,
      subscriptions,
      role,
    });
  }

  // Recupera a sessão salva.
  useEffect(() => {
    async function loadUser() {
      const { "@barber.token": token } = parseCookies();

      if (!token) {
        setUser(undefined);
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const response = await api.get("/auth/pegar");

        const {
          id,
          name,
          email,
          endereco,
          subscriptions,
          role,
        } = response.data;

        setUser({
          id,
          name,
          email,
          endereco,
          subscriptions,
          role,
        });
      } catch (error) {
        console.error("Erro ao recuperar a sessão:", error);
      }
    }

    loadUser();
  }, []);

  // Login: envia os dados e o CAPTCHA para o backend.
  async function signIn({
    email,
    password,
    captchaToken, // ADICIONADO: recebe o token do CAPTCHA.
  }: SignInProps): Promise<LoginResult> {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,

        // ADICIONADO: envia o token para o NestJS validar com o Google.
        captchaToken,
      });

      console.log("RESPOSTA DO LOGIN:", response.data);

      const data = response.data;

      if (
        data.twoFactorRequired === true &&
        data.emailSent === true &&
        typeof data.challengeId === "string" &&
        data.challengeId.length > 0
      ) {
        return {
          twoFactorRequired: true,
          emailSent: true,
          challengeId: data.challengeId,
          message: data.message,
        };
      }

      throw new Error("O servidor não confirmou o envio do código.");
    } catch (error: any) {
      console.error("ERRO COMPLETO DO LOGIN:", error);
      console.error("RESPOSTA DO SERVIDOR:", error.response?.data);
      console.error("STATUS HTTP:", error.response?.status);

      throw error;
    }
  }

  // Verifica o código recebido por e-mail.
  async function verifyTwoFactor(
    challengeId: string,
    code: string
  ): Promise<void> {
    const response = await api.post("/auth/2fa/verify", {
      challengeId,
      code,
    });

    // Salva a sessão somente após validar o código.
    saveSession(response.data);

    router.refresh();
  }

  // Cadastro: envia os dados e o CAPTCHA para o backend.
  async function signUp({
    name,
    email,
    password,
    captchaToken, // ADICIONADO: recebe o token do CAPTCHA.
  }: SignUpProps): Promise<void> {
    await api.post("/users/create", {
      name,
      email,
      password,

      // ADICIONADO: envia o CAPTCHA para o NestJS validar.
      captchaToken,
    });

    // ADICIONADO: não reutiliza o token do cadastro no login.
    // O usuário deverá resolver um novo CAPTCHA ao entrar.
  }

  function signOut() {
    try {
      destroyCookie(null, "@barber.token", { path: "/" });

      delete api.defaults.headers.common["Authorization"];

      setUser(undefined);
      router.push("/login");
    } catch (err) {
      console.log("Erro ao sair", err);
    }
  }

  async function logoutUser(): Promise<void> {
    try {
      destroyCookie(null, "@barber.token", { path: "/" });

      delete api.defaults.headers.common["Authorization"];

      setUser(undefined);

      router.refresh();
      router.push("/login");
    } catch (err) {
      console.log(err);
    }
  }

  async function createAgenda({
    date,
    barbeiro,
    hour,
    horarioId,
    servico,
  }: agendoProps): Promise<void> {
    await api.post("/schedule", {
      date,
      barbeiro,
      hour,
      horarioId,
      servico,
    });
  }

  async function buscarTodos({
    name,
    date,
    barbeiro,
    hour,
    servico,
    email,
  }: buscarAgenda) {
    const response = await api.get("/schedule/buscar", {
      params: {
        name,
        date,
        barbeiro,
        hour,
        servico,
        email,
      },
    });

    return response.data;
  }

  async function pegarEmail(): Promise<buscaConta[]> {
    const response = await api.get("/auth/getTodas");

    return response.data;
  }

  async function mudarRole(userId: string, novaRole: string) {
    try {
      const resposta = await api.post("/auth/rolee", {
        userId,
        role: novaRole,
      });

      console.log("Role alterada:", resposta.data);

      return resposta.data;
    } catch (error) {
      console.error("Erro ao mudar a role:", error);
      throw error;
    }
  }

  async function deleteUser(userId: string): Promise<void> {
    await api.delete(`/auth/${userId}`);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        verifyTwoFactor,
        signUp,
        signOut,
        logoutUser,
        createAgenda,
        buscarTodos,
        pegarEmail,
        mudarRole,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
