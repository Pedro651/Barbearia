"use client";

import Header from "./(public)/_components/header";
import Link from "next/link";

const services = [
  {
    label: "PRECISÃO",
    title: "CORTE",
    description:
      "Cortes feitos sob medida para valorizar seu estilo e sua personalidade.",
    image: "/images/corte-infantil.jpg",
    alt: "Corte de cabelo masculino feito com precisão",
  },
  {
    label: "CUIDADO",
    title: "BARBA",
    description:
      "Acabamento impecável, cuidado nos detalhes e respeito à sua identidade.",
    image: "/images/barba.jpg",
    alt: "Barbeiro fazendo a barba de um cliente",
  },
  {
    label: "SOARES",
    title: "EXPERIÊNCIA",
    description:
      "Um ambiente pensado para você relaxar e sair com sua melhor versão.",
    image: "/images/barbearia.jpg",
    alt: "Interior da Soares Barbearia",
  },
];

const team = [
  { name: "MAYANDERSON", role: "SÓCIO & BARBEIRO" },
  { name: "DOUGLAS", role: "SÓCIO & BARBEIRO" },
  { name: "NETO", role: "BARBEIRO" },
  { name: "MAX", role: "BARBEIRO" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-white pt-11">
      <Header />

      {/* HERO */}
      <section className="mx-auto grid min-h-[85vh] max-w-[1440px] grid-cols-1 items-center gap-10 px-5 py-12 sm:px-10 md:grid-cols-2 md:px-12 lg:px-20">
        <div className="flex flex-col items-start">
          <span className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c547]">
            CANDEIAS · JABOATÃO
          </span>

          <h1 className="text-5xl font-black uppercase leading-[0.85] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
            SOARES
            <br />
            BARBEARIA
          </h1>

          <p className="mt-7 max-w-md text-sm leading-6 text-neutral-400 sm:text-base">
            Técnica, identidade e cuidado em cada detalhe. Uma experiência
            criada por quem vive a barbearia todos os dias.
          </p>

          <div className="mt-6 flex w-full flex-wrap gap-3 sm:w-auto">
            <Link
              href="/agendar"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f8f5f0] px-6 py-3 text-xs font-semibold text-black transition hover:bg-[#e8c547]"
            >
              Agendar horário
            </Link>

            <Link
              href="/#servicos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-500 px-6 py-3 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
            >
              Conhecer a casa
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-[520px] overflow-hidden border border-neutral-800 sm:h-[460px] lg:h-[500px]">
          <img
            src="/images/barbeiro.jpg"
            alt="Barbeiro Soares trabalhando"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          <span className="absolute inset-x-0 top-0 bg-black/30 px-2 py-3 text-center text-[10px] font-bold tracking-widest sm:text-xs">
            11 DE MAIO — DIA DO BARBEIRO
          </span>

          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 text-center">
            <h2 className="text-xl font-black uppercase sm:text-3xl">
              SER <span className="text-[#e8c547]">BARBEIRO</span> É ...
            </h2>
          </div>

          <Link
            href="/sobre"
            aria-label="Conheça a Soares Barbearia"
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-black transition hover:bg-[#e8c547]"
          >
            ↗
          </Link>
        </div>
      </section>

      {/* FAIXA ANIMADA */}
      <div className="overflow-hidden border-y border-neutral-800 py-4">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-8">
              {[
                "CORTE",
                "BARBA",
                "IDENTIDADE",
                "PRODUTOS SOARES",
                "CANDEIAS",
              ].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="text-2xl font-black uppercase tracking-tight sm:text-3xl"
                >
                  {item}
                  <span className="ml-2 text-[#e8c547]">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* SERVIÇOS */}
      <section
        id="servicos"
        className="scroll-mt-0 bg-white text-black"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
          <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="max-w-4xl text-[clamp(2.5rem,7.5vw,6rem)] font-black uppercase leading-[0.82] tracking-[-0.065em]">
              SEU ESTILO,
              <br />
              NOSSO OFÍCIO
            </h2>

            <p className="max-w-[280px] pb-1 text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
              Do clássico ao contemporâneo, com atenção verdadeira em cada atendimento.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {services.map((service, index) => (
              <article key={service.title} className="group min-w-0">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <img
                    src={service.image}
                    alt={service.alt}
                    loading="lazy"
                    className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                      index === 2 ? "grayscale" : ""
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5" />

                  <span className="absolute left-4 top-4 rounded-full bg-[#e8c547] px-3 py-1.5 text-[10px] font-black uppercase leading-none tracking-wide text-black sm:left-5 sm:top-5">
                    {service.label}
                  </span>

                  <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 text-lg text-white transition group-hover:border-[#e8c547] group-hover:bg-[#e8c547] group-hover:text-black">
                    ↗
                  </span>
                </div>

                <div className="pt-4 sm:pt-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-4xl lg:text-3xl xl:text-4xl">
                      {service.title}
                    </h3>

                    <span className="text-xs font-medium text-neutral-400">
                      0{index + 1}
                    </span>
                  </div>

                  <p className="max-w-sm text-sm leading-6 text-neutral-600">
                    {service.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-neutral-200 pt-7 sm:mt-16 sm:flex-row sm:items-center">
            <p className="max-w-md text-sm leading-6 text-neutral-600">
              Seu próximo corte começa aqui. Agende seu horário com a Soares.
            </p>

            <Link
              href="/agendar"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#e8c547] px-7 py-3 text-xs font-black uppercase tracking-wide text-black transition hover:bg-black hover:text-white sm:w-auto"
            >
              Agendar agora ↗
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUTOS */}
      <section
        id="produtos"
        className="border-t border-neutral-800 bg-[#080808] text-white"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-5 py-16 sm:px-10 sm:py-20 md:grid-cols-2 md:px-12 lg:px-20 lg:py-24">
          <div className="order-2 flex flex-col items-start md:order-1">
            <span className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c547]">
              DA NOSSA CASA PARA A SUA
            </span>

            <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
              PRODUTOS
              <br />
              SOARES
            </h2>

            <p className="mt-6 max-w-md text-sm leading-6 text-neutral-400 sm:text-base">
              A experiência da barbearia continua em casa com a linha própria
              Soares, criada para cuidar, finalizar e manter seu estilo todos os dias.
            </p>

            <div className="mt-8 w-full sm:w-auto">
              <Link
                href="/produtos"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#f8f5f0] px-8 py-3 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-[#e8c547] sm:w-auto"
              >
                Ver produtos
              </Link>
            </div>
          </div>

          <div className="relative order-1 mx-auto h-[360px] w-full max-w-[520px] overflow-hidden rounded-lg border border-neutral-800 sm:h-[460px] md:order-2 lg:h-[500px]">
            <img
              src="/images/produtos.jpg"
              alt="Linha de produtos Soares Barbearia"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section
        id="equipe"
        className="border-t border-neutral-200 bg-white text-black"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl text-[clamp(2.5rem,6.5vw,5rem)] font-black uppercase leading-[0.85] tracking-[-0.05em]">
              QUEM FAZ A
              <br />
              SOARES
            </h2>

            <p className="max-w-md text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
              Mayanderson e Douglas fundaram a Soares e, ao lado de Neto e Max,
              transformam técnica e cuidado em identidade.
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-neutral-200 border border-neutral-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col justify-center p-6 sm:p-8"
              >
                <h3 className="text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
                  {member.name}
                </h3>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO — VISITE */}
      <section
        id="localizacao"
        className="scroll-mt-24 border-t border-neutral-200 bg-white text-black"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">
            <h2 className="text-[clamp(2.5rem,6.5vw,5.5rem)] font-black uppercase leading-[0.85] tracking-[-0.05em]">
              SUA PRÓXIMA
              <br />
              PARADA
            </h2>

            <div className="flex flex-col items-start pt-2">
              <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                SOARES BARBEARIA
              </h3>

              <address className="mt-4 not-italic text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
                Avenida Presidente Kennedy, 5300
                <br />
                Candeias, Jaboatão dos Guararapes — PE
                <br />
                CEP 54440-480
              </address>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <a
                  href="https://maps.google.com/?q=Avenida+Presidente+Kennedy+5300+Candeias+Jaboatão+dos+Guararapes+PE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-black px-8 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#e8c547] hover:text-black sm:w-auto"
                >
                  Abrir no mapa
                </a>

                <a
                  href="https://instagram.com/soares.barbearia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-neutral-300 px-8 py-3 text-xs font-bold uppercase tracking-wide text-black transition hover:border-black sm:w-auto"
                >
                  @soares.barbearia
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-neutral-800 px-5 py-7 sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-black uppercase tracking-tight">
            SOARES <span className="text-[#e8c547]">BARBEARIA.</span>
          </span>

          <span className="text-xs text-neutral-500">
            Estilo, precisão e cuidado em cada detalhe.
          </span>
        </div>
      </footer>
    </main>
  );
}