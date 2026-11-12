
"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AuthContext } from "@/context/AuthContext";

type Service = {
  id: string;
  name: string;
};

type Barber = {
  id: string;
  name: string;
};

type Horario = {
  id: string;
  date: string;
  hour: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export default function Agendar() {
  const [step, setStep] = useState(1);

  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [teamList, setTeamList] = useState<Barber[]>([]);
  const [availableTimes, setAvailableTimes] = useState<Horario[]>([]);

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [selectedBarber, setSelectedBarber] =
    useState<Barber | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedHorarioId, setSelectedHorarioId] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const { user, isAuthenticated, createAgenda } =
    useContext(AuthContext);

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Busca serviços, barbeiros e horários
  useEffect(() => {
    async function buscarDados() {
      try {
        setCarregando(true);

        const token = document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("@barber.token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("Token não encontrado.");
        }

        const headers = {
          Authorization: `Bearer ${decodeURIComponent(token)}`,
        };

        const [resServicos, resBarbeiros, resHorarios] =
          await Promise.all([
            fetch(`${API_URL}/servicos/varios?limit=50&offset=0`, {
              headers,
            }),
            fetch(`${API_URL}/cortes/varios?limit=50&offset=0`, {
              headers,
            }),
            fetch(`${API_URL}/horario/varios?limit=50&offset=0`, {
              headers,
            }),
          ]);

        if (
          !resServicos.ok ||
          !resBarbeiros.ok ||
          !resHorarios.ok
        ) {
          throw new Error("Erro ao buscar os dados.");
        }

        const servicos = await resServicos.json();
        const barbeiros = await resBarbeiros.json();
        const horarios = await resHorarios.json();

        setServicesList(
          Array.isArray(servicos) ? servicos : servicos.data ?? []
        );

        setTeamList(
          Array.isArray(barbeiros) ? barbeiros : barbeiros.data ?? []
        );

        setAvailableTimes(
          Array.isArray(horarios) ? horarios : horarios.data ?? []
        );
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setErro(
          "Não foi possível carregar os serviços, barbeiros e horários."
        );
      } finally {
        setCarregando(false);
      }
    }

    if (isAuthenticated) {
      buscarDados();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  // Filtra horários pela data escolhida
  const horariosDaData = availableTimes.filter(
    (horario) =>
      horario.date?.slice(0, 10) === selectedDate
  );

  // Finaliza o agendamento
  async function handleFinish() {
    if (
      !selectedService ||
      !selectedBarber ||
      !selectedDate ||
      !selectedTime ||
      !selectedHorarioId
    ) {
      setErro("Selecione o serviço, barbeiro, data e horário.");
      return;
    }

    if (!user?.id) {
      setErro("Não foi possível identificar sua conta.");
      router.push("/login");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const dadosAgendamento = {
        date: `${selectedDate}T12:00:00.000Z`,
        barbeiro: selectedBarber.id,
        hour: selectedTime,
        horarioId: selectedHorarioId,
        servico: selectedService.id,
      };

      console.log("DADOS DO AGENDAMENTO:", dadosAgendamento);

      await createAgenda(dadosAgendamento);

      await Swal.fire({
        title: "Agendamento confirmado!",
        text: "Seu horário foi reservado com sucesso.",
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#e8c547",
        background: "#111111",
        color: "#ffffff",
        iconColor: "#e8c547",
        customClass: {
          popup: "soares-alert",
          confirmButton: "soares-alert-button",
        },
      });

      router.push("/");
    } catch (error: any) {
      console.error("ERRO COMPLETO:", error);
      console.error("RESPOSTA DO BACKEND:", error.response?.data);
      console.error("STATUS:", error.response?.status);

      const mensagem = error.response?.data?.message;

      setErro(
        Array.isArray(mensagem)
          ? mensagem.join(", ")
          : mensagem || "Não foi possível salvar o agendamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black flex flex-col justify-between px-5 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-[1440px]">

        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition"
          >
            ← Voltar para a home
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
            SOARES BARBEARIA
          </span>
        </div>

        <div className="flex flex-col items-start mb-8">
          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
            AGENDAMENTO
          </span>

          <h1 className="text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            AGENDAR HORÁRIO
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Escolha o serviço, o barbeiro e o melhor dia e horário para você.
          </p>
        </div>

        {erro && (
          <p
            role="alert"
            className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {erro}
          </p>
        )}

        {carregando ? (
          <div className="py-20 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Carregando serviços, barbeiros e horários...
            </p>
          </div>
        ) : (
          <>
            <div className="border-t border-b border-neutral-200 py-4 mb-12">
              <div className="flex flex-wrap items-center gap-6 sm:gap-10">

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      step === 1
                        ? "bg-[#d4af37] text-black"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    1
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Serviço
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!selectedService}
                  onClick={() => selectedService && setStep(2)}
                  className={`flex items-center gap-3 ${
                    selectedService
                      ? "cursor-pointer"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      step === 2
                        ? "bg-[#d4af37] text-black"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    2
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Barbeiro
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!selectedBarber}
                  onClick={() => selectedBarber && setStep(3)}
                  className={`flex items-center gap-3 ${
                    selectedBarber
                      ? "cursor-pointer"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      step === 3
                        ? "bg-[#d4af37] text-black"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    3
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Data e Horário
                  </span>
                </button>

              </div>
            </div>

            <div className="mb-16">

              {/* ETAPA 1: SERVIÇO */}
              {step === 1 && (
                <section>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6 sm:text-3xl">
                    1. Escolha o serviço
                  </h2>

                  {servicesList.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      Nenhum serviço cadastrado.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {servicesList.map((service) => {
                        const isSelected =
                          selectedService?.id === service.id;

                        return (
                          <button
                            type="button"
                            key={service.id}
                            onClick={() => {
                              setSelectedService(service);
                              setErro("");
                              setStep(2);
                            }}
                            className={`rounded-lg border p-6 transition flex items-center justify-between text-left ${
                              isSelected
                                ? "border-black bg-black text-white"
                                : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 text-black"
                            }`}
                          >
                            <span className="text-sm font-black uppercase tracking-wide">
                              {service.name}
                            </span>

                            <span
                              className={`text-xs font-bold ${
                                isSelected
                                  ? "text-[#d4af37]"
                                  : "text-neutral-400"
                              }`}
                            >
                              Selecionar →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ETAPA 2: BARBEIRO */}
              {step === 2 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                      2. Escolha o barbeiro
                    </h2>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold uppercase text-neutral-500 hover:text-black underline"
                    >
                      ← Voltar aos serviços
                    </button>
                  </div>

                  {teamList.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      Nenhum barbeiro cadastrado.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {teamList.map((barber) => {
                        const isSelected =
                          selectedBarber?.id === barber.id;

                        return (
                          <button
                            type="button"
                            key={barber.id}
                            onClick={() => {
                              setSelectedBarber(barber);
                              setErro("");
                              setStep(3);
                            }}
                            className={`rounded-lg border p-6 transition flex flex-col justify-between text-left ${
                              isSelected
                                ? "border-black bg-black text-white"
                                : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 text-black"
                            }`}
                          >
                            <h3 className="text-xl font-black uppercase tracking-tight">
                              {barber.name}
                            </h3>

                            <span
                              className={`mt-6 text-xs font-bold ${
                                isSelected
                                  ? "text-[#d4af37]"
                                  : "text-neutral-400"
                              }`}
                            >
                              Escolher profissional →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ETAPA 3: DATA E HORÁRIO */}
              {step === 3 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                      3. Escolha a data e o horário
                    </h2>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-bold uppercase text-neutral-500 hover:text-black underline"
                    >
                      ← Voltar aos barbeiros
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-neutral-50 border border-neutral-200 p-6 sm:p-8 rounded-xl">

                    <div className="flex flex-col gap-3">
                      <label
                        htmlFor="data-agendamento"
                        className="text-xs font-bold uppercase tracking-wider text-neutral-700"
                      >
                        Selecione o dia
                      </label>

                      <input
                        id="data-agendamento"
                        type="date"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={selectedDate}
                        onChange={(event) => {
                          setSelectedDate(event.target.value);
                          setSelectedTime("");
                          setSelectedHorarioId("");
                          setErro("");
                        }}
                        className="h-12 w-full rounded-md border border-neutral-300 bg-white px-4 text-sm text-black focus:border-black focus:outline-none"
                      />

                      {selectedDate && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Data escolhida:{" "}
                          <strong className="text-black">
                            {selectedDate.split("-").reverse().join("/")}
                          </strong>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Horários disponíveis
                      </span>

                      {!selectedDate ? (
                        <p className="text-sm text-neutral-500">
                          Primeiro selecione uma data.
                        </p>
                      ) : horariosDaData.length === 0 ? (
                        <p className="text-sm text-neutral-500">
                          Não existem horários cadastrados para essa data.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {horariosDaData.map((horario) => {
                            const isSelected =
                              selectedHorarioId === horario.id;

                            return (
                              <button
                                type="button"
                                key={horario.id}
                                onClick={() => {
                                  setSelectedTime(horario.hour);
                                  setSelectedHorarioId(horario.id);
                                  setErro("");
                                }}
                                className={`py-2.5 text-xs font-bold rounded-md border transition ${
                                  isSelected
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-neutral-200 hover:border-neutral-400"
                                }`}
                              >
                                {horario.hour}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      disabled={
                        !selectedDate ||
                        !selectedTime ||
                        !selectedHorarioId ||
                        salvando
                      }
                      onClick={handleFinish}
                      className={`inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full px-8 text-xs font-black uppercase tracking-wide transition ${
                        selectedDate && selectedTime && selectedHorarioId && !salvando
                          ? "bg-[#d4af37] text-black hover:bg-black hover:text-white cursor-pointer"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      }`}
                    >
                      {salvando
                        ? "Salvando..."
                        : "Confirmar Agendamento ✓"}
                    </button>
                  </div>
                </section>
              )}

            </div>
          </>
        )}
      </div>

      <footer className="mx-auto w-full max-w-[1440px] border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
        © Soares Barbearia. Estilo, precisão e cuidado em cada detalhe.
      </footer>
    </main>
  );
}
