
"use client";

import { useEffect, useMemo, useState } from "react";

type Servico = {
  id: string;
  name: string;
};

type Barbeiro = {
  id: string;
  name: string;
};

type Horario = {
  id: string;
  date: string;
  hour: string;
};

type Aba = "servicos" | "barbeiros" | "horarios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

function pegarToken() {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("@barber.token="));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

async function requisicao(url: string, options: RequestInit = {}) {
  const token = pegarToken();

  const resposta = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(
      dados?.message
        ? Array.isArray(dados.message)
          ? dados.message.join(", ")
          : dados.message
        : "Erro ao realizar operação."
    );
  }

  return dados;
}

export default function GerenciarAgenda() {
  const [aba, setAba] = useState<Aba>("servicos");

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [nome, setNome] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [dataSelecionada, setDataSelecionada] = useState("");
  const [novaHora, setNovaHora] = useState("09:00");
  const [horaEditando, setHoraEditando] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function mostrarMensagem(texto: string) {
    setMensagem(texto);
    setTimeout(() => setMensagem(""), 3000);
  }

  // BUSCAR SERVIÇOS

  async function carregarServicos() {
    const dados = await requisicao("/servicos/varios?limit=50&offset=0");
    setServicos(Array.isArray(dados) ? dados : []);
  }

  // BUSCAR BARBEIROS

  async function carregarBarbeiros() {
    const dados = await requisicao("/cortes/varios?limit=50&offset=0");
    setBarbeiros(Array.isArray(dados) ? dados : []);
  }

  // BUSCAR HORÁRIOS

  async function carregarHorarios() {
    const dados = await requisicao("/horario/varios?limit=50&offset=0");
    setHorarios(Array.isArray(dados) ? dados : []);
  }

  async function carregarDados() {
    setCarregando(true);

    try {
      if (aba === "servicos") await carregarServicos();
      if (aba === "barbeiros") await carregarBarbeiros();
      if (aba === "horarios") await carregarHorarios();
    } catch (erro) {
      mostrarMensagem(
        erro instanceof Error ? erro.message : "Erro ao carregar dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [aba]);

  // CRIAR E EDITAR SERVIÇOS E BARBEIROS

  async function salvarCadastro() {
    if (!nome.trim()) {
      mostrarMensagem("Informe um nome.");
      return;
    }

    setSalvando(true);

    try {
      const endpoint =
        aba === "servicos" ? "/servicos" : "/cortes";

      const rotaCriar =
        aba === "servicos" ? "/server" : "/barbeiroo";

      if (aba === "servicos") {
        if (editandoId) {
          await requisicao(`${endpoint}/${editandoId}`, {
            method: "PATCH",
            body: JSON.stringify({ name: nome.trim() }),
          });
        } else {
          await requisicao(`${endpoint}${rotaCriar}`, {
            method: "POST",
            body: JSON.stringify({ name: nome.trim() }),
          });
        }

        await carregarServicos();
      } else {
        if (editandoId) {
          await requisicao(`${endpoint}/${editandoId}`, {
            method: "PATCH",
            body: JSON.stringify({ name: nome.trim() }),
          });
        } else {
          await requisicao(`${endpoint}${rotaCriar}`, {
            method: "POST",
            body: JSON.stringify({ name: nome.trim() }),
          });
        }

        await carregarBarbeiros();
      }

      setNome("");
      setEditandoId(null);

      mostrarMensagem(
        editandoId
          ? "Cadastro atualizado com sucesso!"
          : "Cadastro criado com sucesso!"
      );
    } catch (erro) {
      mostrarMensagem(
        erro instanceof Error ? erro.message : "Erro ao salvar cadastro."
      );
    } finally {
      setSalvando(false);
    }
  }

  function editarCadastro(item: Servico | Barbeiro) {
    setNome(item.name);
    setEditandoId(item.id);
  }

  // EXCLUIR SERVIÇO OU BARBEIRO

  async function excluirCadastro(id: string) {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;

    try {
      const endpoint =
        aba === "servicos" ? "/servicos" : "/cortes";

      await requisicao(`${endpoint}/${id}`, {
        method: "DELETE",
      });

      if (aba === "servicos") {
        await carregarServicos();
      } else {
        await carregarBarbeiros();
      }

      if (editandoId === id) {
        setEditandoId(null);
        setNome("");
      }

      mostrarMensagem("Registro excluído com sucesso!");
    } catch (erro) {
      mostrarMensagem(
        erro instanceof Error ? erro.message : "Erro ao excluir."
      );
    }
  }

  // CRIAR E EDITAR HORÁRIOS

  async function adicionarHorario() {
    if (!dataSelecionada) {
      mostrarMensagem("Selecione uma data.");
      return;
    }

    if (!novaHora) {
      mostrarMensagem("Selecione um horário.");
      return;
    }

    const existente = horarios.find(
      (item) =>
        item.date.slice(0, 10) === dataSelecionada &&
        item.hour === novaHora &&
        item.id !== horaEditando
    );

    if (existente) {
      mostrarMensagem("Esse horário já está cadastrado.");
      return;
    }

    setSalvando(true);

    try {
      const corpo = {
        date: `${dataSelecionada}T12:00:00.000Z`,
        hour: novaHora,
      };

      if (horaEditando) {
        await requisicao(`/horario/${horaEditando}`, {
          method: "PATCH",
          body: JSON.stringify(corpo),
        });
      } else {
        await requisicao("/horario/hora", {
          method: "POST",
          body: JSON.stringify(corpo),
        });
      }

      await carregarHorarios();

      setHoraEditando(null);
      mostrarMensagem(
        horaEditando
          ? "Horário atualizado!"
          : "Horário cadastrado!"
      );
    } catch (erro) {
      mostrarMensagem(
        erro instanceof Error ? erro.message : "Erro ao salvar horário."
      );
    } finally {
      setSalvando(false);
    }
  }

  function editarHorario(item: Horario) {
    setDataSelecionada(item.date.slice(0, 10));
    setNovaHora(item.hour);
    setHoraEditando(item.id);
  }

  // EXCLUIR HORÁRIO

  async function excluirHorario(id: string) {
    if (!window.confirm("Deseja excluir este horário?")) return;

    try {
      await requisicao(`/horario/${id}`, {
        method: "DELETE",
      });

      await carregarHorarios();
      mostrarMensagem("Horário excluído!");
    } catch (erro) {
      mostrarMensagem(
        erro instanceof Error ? erro.message : "Erro ao excluir horário."
      );
    }
  }

  // LISTAS FILTRADAS

  const listaCadastro = useMemo(() => {
    const lista = aba === "servicos" ? servicos : barbeiros;

    return lista.filter((item) =>
      item.name.toLowerCase().includes(busca.toLowerCase())
    );
  }, [aba, servicos, barbeiros, busca]);

  const horariosDaData = useMemo(() => {
    return horarios
      .filter((item) => item.date.slice(0, 10) === dataSelecionada)
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }, [horarios, dataSelecionada]);

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-6 sm:px-10 lg:px-[4%]">
        <a
          href="/"
          className="text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:text-black sm:text-sm"
        >
          ← Voltar para a home
        </a>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37] sm:text-sm">
          Soares Barbearia
        </span>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-10 sm:px-10 lg:px-[4%]">
        <section>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c49b20]">
            Administração
          </span>

          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] sm:text-6xl">
            Gerenciar agenda
          </h1>

          <p className="mt-3 text-sm text-neutral-500 sm:text-base">
            Gerencie serviços, barbeiros e disponibilidade de horários.
          </p>
        </section>

        {mensagem && (
          <div className="mt-6 rounded-xl border border-[#d4af37] bg-[#faf7eb] p-4 text-sm font-semibold text-[#8b6b0c]">
            {mensagem}
          </div>
        )}

        {/* ABAS */}

        <div className="mt-10 flex flex-wrap gap-2 border-b border-neutral-200">
          {[
            { id: "servicos", nome: "Serviços" },
            { id: "barbeiros", nome: "Barbeiros" },
            { id: "horarios", nome: "Datas e horários" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setAba(item.id as Aba);
                setNome("");
                setBusca("");
                setEditandoId(null);
                setHoraEditando(null);
              }}
              className={`border-b-2 px-5 py-4 text-xs font-bold uppercase tracking-wide transition ${
                aba === item.id
                  ? "border-[#d4af37] text-[#a88413]"
                  : "border-transparent text-neutral-500 hover:text-black"
              }`}
            >
              {item.nome}
            </button>
          ))}
        </div>

        {/* SERVIÇOS E BARBEIROS */}

        {aba !== "horarios" && (
          <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="h-fit rounded-2xl border border-neutral-200 p-6">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#b18c19]">
                {editandoId ? "Editar cadastro" : "Novo cadastro"}
              </span>

              <h2 className="mt-2 text-2xl font-bold uppercase">
                {aba === "servicos" ? "Serviço" : "Barbeiro"}
              </h2>

              <label className="mb-2 mt-6 block text-xs font-bold uppercase tracking-wide">
                Nome
              </label>

              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder={
                  aba === "servicos"
                    ? "Nome do serviço"
                    : "Nome do barbeiro"
                }
                className="h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-[#d4af37]"
              />

              <button
                type="button"
                disabled={salvando}
                onClick={salvarCadastro}
                className="mt-5 w-full rounded-lg bg-black px-5 py-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#d4af37] hover:text-black disabled:opacity-50"
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alterações"
                    : "Adicionar"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setNome("");
                  }}
                  className="mt-3 w-full text-xs font-bold uppercase text-neutral-500 hover:text-black"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            <div>
              <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center">
                <h2 className="text-xl font-bold uppercase">
                  {aba === "servicos"
                    ? "Serviços cadastrados"
                    : "Barbeiros cadastrados"}
                </h2>

                <span className="text-xs text-neutral-500">
                  {listaCadastro.length} registro(s)
                </span>
              </div>

              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Pesquisar..."
                className="mt-4 h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-[#d4af37]"
              />

              <div className="mt-4 space-y-3">
                {carregando ? (
                  <p className="py-10 text-center text-sm text-neutral-500">
                    Carregando...
                  </p>
                ) : (
                  listaCadastro.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-neutral-200 p-5 sm:flex-row sm:items-center"
                    >
                      <span className="text-sm font-bold">{item.name}</span>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => editarCadastro(item)}
                          className="text-xs font-bold uppercase text-[#a88413] hover:text-black"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => excluirCadastro(item.id)}
                          className="text-xs font-bold uppercase text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {!carregando && listaCadastro.length === 0 && (
                  <p className="py-10 text-center text-sm text-neutral-500">
                    Nenhum registro encontrado.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* DATAS E HORÁRIOS */}

        {aba === "horarios" && (
          <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="h-fit rounded-2xl border border-neutral-200 p-6">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#b18c19]">
                Disponibilidade
              </span>

              <h2 className="mt-2 text-2xl font-bold uppercase">
                Gerenciar horário
              </h2>

              <label className="mb-2 mt-6 block text-xs font-bold uppercase">
                Data
              </label>

              <input
                type="date"
                value={dataSelecionada}
                onChange={(event) => {
                  setDataSelecionada(event.target.value);
                  setHoraEditando(null);
                }}
                className="h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-[#d4af37]"
              />

              <label className="mb-2 mt-5 block text-xs font-bold uppercase">
                Horário
              </label>

              <input
                type="time"
                value={novaHora}
                onChange={(event) => setNovaHora(event.target.value)}
                className="h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-[#d4af37]"
              />

              <button
                type="button"
                disabled={salvando}
                onClick={adicionarHorario}
                className="mt-5 w-full rounded-lg bg-black px-5 py-4 text-xs font-bold uppercase text-white transition hover:bg-[#d4af37] hover:text-black disabled:opacity-50"
              >
                {salvando
                  ? "Salvando..."
                  : horaEditando
                    ? "Salvar horário"
                    : "Adicionar horário"}
              </button>

              {horaEditando && (
                <button
                  type="button"
                  onClick={() => setHoraEditando(null)}
                  className="mt-3 w-full text-xs font-bold uppercase text-neutral-500 hover:text-black"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            <div>
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-xl font-bold uppercase">
                  Horários da data
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {dataSelecionada || "Selecione uma data para visualizar"}
                </p>
              </div>

              {!dataSelecionada ? (
                <p className="py-12 text-center text-sm text-neutral-500">
                  Selecione uma data para gerenciar os horários.
                </p>
              ) : carregando ? (
                <p className="py-12 text-center text-sm text-neutral-500">
                  Carregando...
                </p>
              ) : horariosDaData.length === 0 ? (
                <p className="py-12 text-center text-sm text-neutral-500">
                  Nenhum horário cadastrado para essa data.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {horariosDaData.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-neutral-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">
                          {item.hour}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase text-green-700">
                          Cadastrado
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => editarHorario(item)}
                          className="text-xs font-bold uppercase text-[#a88413] hover:text-black"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => excluirHorario(item.id)}
                          className="text-xs font-bold uppercase text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
