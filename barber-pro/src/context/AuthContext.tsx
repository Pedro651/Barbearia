"use client"
import { createContext, ReactNode, useEffect, useState } from 'react'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { useRouter } from "next/navigation";

import { api } from '../service/apiClient'

interface AuthContextData {
  user: UserProps | undefined;
  isAuthenticated: boolean;
  signIn: (credentials: SignInProps) => Promise<void>;
  signUp: (credentials: SignUpProps) => Promise<void>;
  logoutUser: () => Promise<void>;
  signOut: () => void;
  createAgenda: (data: agendoProps) => Promise<void>;
  buscarTodos: (dados: buscarAgenda) => Promise<any>;
  pegarEmail: () => Promise<buscaConta[]>;
  mudarRole: (userId: string, novaRole: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<void>;

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
} 

interface SignInProps {
  email: string;
  password: string;
}

interface SignUpProps{
  name: string;
  email: string;
  password: string;
}

type agendoProps = {
  date: string;
  barbeiro: string;
  hour: string;
  horarioId: string;
  servico: string;
};

interface buscarAgenda{
  name:string
  email: string;
  date: string;
  barbeiro:string;
  hour:string;
  servico:  string;    
}

interface buscaConta{
  id: string;
  name:string;
  email: string;
  role:"ADMIN" | "CLIENTE";
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps){
  useEffect(() => {
  async function loadUser() {
    const { "@barber.token": token } = parseCookies();

    if (!token) {
      setUser(undefined);
      return;
    }

    // Envia o token salvo no cookie para o backend.
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      // Use apenas a rota que você deseja manter.
      const response = await api.get("/auth/pegar");

      const {
        id,
        name,
        email,
        endereco,
        subscriptions,
        role
      } = response.data;

      setUser({
        id,
        name,
        email,
        endereco,
        subscriptions,
        role
      });
    } catch (error) {
      // Não chame signOut() aqui.
      // Um erro do servidor não significa necessariamente
      // que o token é inválido.
      console.error("Erro ao recuperar a sessão:", error);
    }
  }

  loadUser();
}, []);
  const [user, setUser] = useState<UserProps>()
  const isAuthenticated = !!user;
  const router = useRouter();

  function signOut(){
    try{
      destroyCookie(null, '@barber.token', { path: '/' })
      setUser(undefined);
      router.push('/login');
    }catch(err){
      console.log("Erro ao sair", err)
    }
  }

  async function signIn({ email, password }: SignInProps){
   
    const response = await api.post("/auth/login", {
      email,
      password,
    })

    const { id, name, token, subscriptions, endereco,role } = response.data;

    setCookie(undefined, '@barber.token', token, {
      maxAge: 60 * 60 * 24 * 30, // 1 mês
      path: '/'
    })

    setUser({
      id,
      name,
      email,
      endereco,
      subscriptions,
      role
    })

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    router.refresh();
    router.push('/')
  }

  async function signUp({ name, email, password }: SignUpProps){
    // Cria o usuário
    await api.post('/users/create', {
      name,
      email,
      password
    })

    // Após cadastrar com sucesso, faz o login automaticamente para gerar o token e redirecionar
    await signIn({ email, password });
  }

  async function logoutUser(){
    try{
      destroyCookie(null, '@barber.token', { path: '/' })
      setUser(undefined)
      router.refresh();
      router.push('/login')
    }catch(err){
      console.log(err)
    }
  }

  async function createAgenda({
  date,
  barbeiro,
  hour,
  horarioId,
  servico
}: agendoProps) {
  await api.post(`/schedule`, {
    date,
    barbeiro,
    hour,
    horarioId,
    servico
  })
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

  async function pegarEmail(){

    const getContas = await api.get('/auth/getTodas')

    return getContas.data;

  }

  async function mudarRole(userId: string, novaRole: string) {
  try {
    const resposta = await api.post("/auth/rolee", {
      userId: userId,
      role: novaRole,
    });

    console.log("Role alterada:", resposta.data);
  } catch (error) {
    console.error("Erro ao mudar a role:", error);
  }
}

   async function deleteUser(userId: string) {
  await api.delete(`/auth/${userId}`);
  }

  return(
    <AuthContext.Provider value={{ user, isAuthenticated,
    signIn,
    signUp, 
    signOut, 
    logoutUser,
    createAgenda,
    buscarTodos,
    pegarEmail,
    mudarRole,
    deleteUser}}>
      {children}
    </AuthContext.Provider>
  )
}