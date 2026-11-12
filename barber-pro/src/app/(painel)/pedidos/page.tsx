
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/service/apiClient";

type Agendamento = {
  id: string;
  cliente: string;
  email: string;
  servico: string;
  barbeiro: string;
  data: string;
  horario: string;
  status: "Confirmado" | "Pendente" | "Concluído";
};

type RelacaoAPI = {
  id: string;
  name: string;
};

type AgendamentoAPI = {
  id: string;
  servico: string | RelacaoAPI;
  barbeiro: string | RelacaoAPI;
  date: string;
  hour: string;
  status: boolean | string;
  user?: {
    name?: string;
    email?: string;
  };
};

function obterDataLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string) {
  if (!data) return "—";

  const [ano, mes, dia] = data.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

function obterNome(valor: string | RelacaoAPI | null | undefined) {
  if (!valor) return "Não informado";

  if (typeof valor === "string") {
    return valor;
  }

  return valor.name ?? "Não informado";
}

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [hoje, setHoje] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [barbeiroFiltro, setBarbeiroFiltro] = useState("Todos");
  const [servicoFiltro, setServicoFiltro] = useState("Todos");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState<Agendamento | null>(null);

  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  useEffect(() => {
    setHoje(obterDataLocal());
  }, []);

  useEffect(() => {
    async function buscarAgendamentos() {
      try {
        setCarregando(true);
        setErro("");

        const response = await api.get("/schedule/buscar");

        const dados: AgendamentoAPI[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const registros: Agendamento[] = dados.map((item) => ({
          id: item.id,
          cliente: item.user?.name ?? "Cliente",
          email: item.user?.email ?? "",

          // Converte os relacionamentos em nomes.
          servico: obterNome(item.servico),
          barbeiro: obterNome(item.barbeiro),

          data: String(item.date ?? "").slice(0, 10),
          horario: item.hour,

          status:
            item.status === "Concluído"
              ? "Concluído"
              : item.status === false || item.status === "Pendente"
                ? "Pendente"
                : "Confirmado",
        }));

        setAgendamentos(registros);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);

        setErro(
          "Não foi possível carregar os agendamentos. Verifique se o backend está ligado e se a rota GET /schedule/buscar existe."
        );
      } finally {
        setCarregando(false);
      }
    }

    buscarAgendamentos();
  }, []);

  // Atualiza o status do agendamento no backend.
  async function atualizarStatus(
    id: string,
    status: Agendamento["status"]
  ) {
    try {
      setAtualizandoStatus(true);
      setErro("");

      await api.patch(`/schedule/${id}`, {
        status,
      });

      setAgendamentos((prev) =>
        prev.map((agendamento) =>
          agendamento.id === id
            ? { ...agendamento, status }
            : agendamento
        )
      );

      setAgendamentoSelecionado((prev) =>
        prev && prev.id === id
          ? { ...prev, status }
          : prev
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setErro("Não foi possível atualizar o status do agendamento.");
    } finally {
      setAtualizandoStatus(false);
    }
  }

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos
      .filter((agendamento) => {
        const termo = pesquisa.toLowerCase();

        const correspondePesquisa =
          agendamento.cliente.toLowerCase().includes(termo) ||
          agendamento.email.toLowerCase().includes(termo);

        const correspondeData =
          !dataFiltro || agendamento.data === dataFiltro;

        const correspondeBarbeiro =
          barbeiroFiltro === "Todos" ||
          agendamento.barbeiro === barbeiroFiltro;

        const correspondeServico =
          servicoFiltro === "Todos" ||
          agendamento.servico === servicoFiltro;

        const correspondeStatus =
          statusFiltro === "Todos" ||
          agendamento.status === statusFiltro;

        return (
          correspondePesquisa &&
          correspondeData &&
          correspondeBarbeiro &&
          correspondeServico &&
          correspondeStatus
        );
      })
      .sort((a, b) =>
        `${a.data} ${a.horario}`.localeCompare(
          `${b.data} ${b.horario}`
        )
      );
  }, [
    agendamentos,
    pesquisa,
    dataFiltro,
    barbeiroFiltro,
    servicoFiltro,
    statusFiltro,
  ]);

  const totalAgendamentos = agendamentos.length;

  const agendamentosHoje = agendamentos.filter(
    (item) => hoje !== "" && item.data === hoje
  ).length;

  const proximosAgendamentos = agendamentos.filter(
    (item) =>
      hoje !== "" &&
      item.data > hoje &&
      item.status !== "Concluído"
  ).length;

  const barbeiros = Array.from(
    new Set(agendamentos.map((item) => item.barbeiro))
  );

  const servicos = Array.from(
    new Set(agendamentos.map((item) => item.servico))
  );

  function limparFiltros() {
    setPesquisa("");
    setDataFiltro("");
    setBarbeiroFiltro("Todos");
    setServicoFiltro("Todos");
    setStatusFiltro("Todos");
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-6 sm:px-10 lg:px-[4%]">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:text-black sm:text-sm"
        >
          ← Voltar para a home
        </Link>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37] sm:text-sm">
          Soares Barbearia
        </span>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 pb-16 pt-10 sm:px-10 lg:px-[4%]">
        <section>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c49b20]">
            Administração
          </span>

          <h1 className="mt-3 text-4xl font-black uppercase leading-tight tracking-[-0.06em] sm:text-5xl md:text-6xl lg:text-7xl">
            Agendamentos
          </h1>

          <p className="mt-3 text-sm text-neutral-500 sm:text-base">
            Gerencie os horários, os serviços e os atendimentos
            dos seus clientes.
          </p>
        </section>

        {erro && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {erro}
          </div>
        )}

        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              titulo: "Total de agendamentos",
              valor: totalAgendamentos,
              descricao: "Todos os registros disponíveis",
              numero: "01",
            },
            {
              titulo: "Atendimentos de hoje",
              valor: agendamentosHoje,
              descricao: "Agendamentos para hoje",
              numero: "02",
            },
            {
              titulo: "Próximos atendimentos",
              valor: proximosAgendamentos,
              descricao: "Atendimentos em datas futuras",
              numero: "03",
            },
          ].map((item) => (
            <div
              key={item.numero}
              className="border border-neutral-200 bg-white p-6 transition hover:border-[#d4af37]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
                  {item.titulo}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f1d9] text-sm font-bold text-[#9b7813]">
                  {item.numero}
                </span>
              </div>

              <p className="mt-5 text-4xl font-bold">
                {carregando
                  ? "—"
                  : String(item.valor).padStart(2, "0")}
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                {item.descricao}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c49b20]">
                Controle de horários
              </span>

              <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                Lista de agendamentos
              </h2>
            </div>

            <span className="text-xs text-neutral-500">
              {agendamentosFiltrados.length} resultado(s)
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-[#fafafa] p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="xl:col-span-2">
                <label
                  htmlFor="pesquisa"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide"
                >
                  Buscar cliente
                </label>

                <input
                  id="pesquisa"
                  type="search"
                  placeholder="Nome ou e-mail do cliente"
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide"
                >
                  Selecionar data
                </label>

                <input
                  id="data"
                  type="date"
                  value={dataFiltro}
                  onChange={(event) => setDataFiltro(event.target.value)}
                  className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label
                  htmlFor="barbeiro"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide"
                >
                  Barbeiro
                </label>

                <select
                  id="barbeiro"
                  value={barbeiroFiltro}
                  onChange={(event) =>
                    setBarbeiroFiltro(event.target.value)
                  }
                  className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#d4af37]"
                >
                  <option value="Todos">Todos os barbeiros</option>

                  {barbeiros.map((barbeiro) => (
                    <option key={barbeiro} value={barbeiro}>
                      {barbeiro}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="servico"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide"
                >
                  Serviço
                </label>

                <select
                  id="servico"
                  value={servicoFiltro}
                  onChange={(event) =>
                    setServicoFiltro(event.target.value)
                  }
                  className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#d4af37]"
                >
                  <option value="Todos">Todos os serviços</option>

                  {servicos.map((servico) => (
                    <option key={servico} value={servico}>
                      {servico}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label
                  htmlFor="status"
                  className="text-xs font-bold uppercase tracking-wide"
                >
                  Status:
                </label>

                <select
                  id="status"
                  value={statusFiltro}
                  onChange={(event) => setStatusFiltro(event.target.value)}
                  className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#d4af37]"
                >
                  <option value="Todos">Todos</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>

              <button
                type="button"
                onClick={limparFiltros}
                className="h-10 rounded-lg border border-neutral-300 bg-white px-5 text-xs font-bold uppercase tracking-wide transition hover:border-black hover:bg-black hover:text-white"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#fafafa]">
                    {[
                      "Cliente",
                      "Serviço",
                      "Barbeiro",
                      "Data",
                      "Horário",
                      "Status",
                      "Detalhes",
                    ].map((titulo) => (
                      <th
                        key={titulo}
                        className="px-5 py-5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500"
                      >
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {carregando ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-16 text-center text-sm text-neutral-500"
                      >
                        Carregando agendamentos...
                      </td>
                    </tr>
                  ) : agendamentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <p className="text-sm font-bold uppercase tracking-wide">
                          Nenhum agendamento encontrado
                        </p>

                        <p className="mt-2 text-sm text-neutral-500">
                          Quando os usuários fizerem agendamentos, eles aparecerão aqui.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    agendamentosFiltrados.map((agendamento) => (
                      <tr
                        key={agendamento.id}
                        className="border-b border-neutral-100 transition last:border-b-0 hover:bg-[#fdfbf5]"
                      >
                        <td className="px-5 py-5">
                          <p className="text-sm font-bold">
                            {agendamento.cliente}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {agendamento.email || "E-mail indisponível"}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm">
                          {agendamento.servico}
                        </td>

                        <td className="px-5 py-5 text-sm">
                          {agendamento.barbeiro}
                        </td>

                        <td className="px-5 py-5 text-sm">
                          {formatarData(agendamento.data)}
                        </td>

                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold">
                            {agendamento.horario}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
                              agendamento.status === "Confirmado"
                                ? "bg-green-50 text-green-700"
                                : agendamento.status === "Pendente"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {agendamento.status}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              setAgendamentoSelecionado(agendamento)
                            }
                            className="text-xs font-bold uppercase tracking-wide text-[#a88413] underline underline-offset-4 transition hover:text-black"
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {agendamentoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAgendamentoSelecionado(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalhes"
            className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b18c19]">
                  Soares Barbearia
                </span>

                <h2
                  id="titulo-detalhes"
                  className="mt-2 text-2xl font-black uppercase"
                >
                  Detalhes
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setAgendamentoSelecionado(null)}
                aria-label="Fechar detalhes"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-lg transition hover:bg-black hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                  Cliente
                </p>

                <p className="mt-1 font-semibold">
                  {agendamentoSelecionado.cliente}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {agendamentoSelecionado.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {[
                  ["Serviço", agendamentoSelecionado.servico],
                  ["Barbeiro", agendamentoSelecionado.barbeiro],
                  ["Data", formatarData(agendamentoSelecionado.data)],
                  ["Horário", agendamentoSelecionado.horario],
                ].map(([titulo, valor]) => (
                  <div key={titulo}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                      {titulo}
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {valor}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                  Status do agendamento
                </p>

                <select
                  value={agendamentoSelecionado.status}
                  disabled={atualizandoStatus}
                  onChange={(event) =>
                    atualizarStatus(
                      agendamentoSelecionado.id,
                      event.target.value as Agendamento["status"]
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-[#8b6b0c] outline-none transition focus:border-[#d4af37] disabled:opacity-50"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Concluído">Concluído</option>
                </select>

                {atualizandoStatus && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Atualizando status...
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAgendamentoSelecionado(null)}
              className="mt-8 w-full rounded-lg bg-black px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#d4af37] hover:text-black"
            >
              Fechar detalhes
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
