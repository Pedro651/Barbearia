
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { api } from "../../../service/apiClient";

// Tipos das informações recebidas do backend
interface Overview {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface Revenue {
  totalRevenue: number;
  dailyRevenue: {
    date: string;
    revenue: number;
  }[];
}

interface Orders {
  totalOrders: number;
}

interface Product {
  productId: string;
  productName: string;
  quantitySold: number;
}

interface Payments {
  approvedPayments: number;
  pendingPayments: number;
  refusedPayments: number;
  totalReceived: number;
}

export default function EstatisticasPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [orders, setOrders] = useState<Orders | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payments | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data local no formato YYYY-MM-DD
  function getLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const today = new Date();

  const [startDate, setStartDate] = useState(
    getLocalDate(new Date(today.getFullYear(), today.getMonth(), 1))
  );

  const [endDate, setEndDate] = useState(getLocalDate(today));

  // Formatar valores em reais
  function formatCurrency(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Carregar todas as estatísticas
  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [overviewResponse, revenueResponse, ordersResponse, productsResponse, paymentsResponse] =
        await Promise.all([
          api.get("/statistics/overview"),

          api.get("/statistics/revenue", {
            params: { startDate, endDate },
          }),

          api.get("/statistics/orders", {
            params: { startDate, endDate },
          }),

          api.get("/statistics/products"),

          api.get("/statistics/payments"),
        ]);

      setOverview(overviewResponse.data);
      setRevenue(revenueResponse.data);
      setOrders(ordersResponse.data);
      setProducts(productsResponse.data);
      setPayments(paymentsResponse.data);
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error.response?.data || error);

      setError(
        error.response?.data?.message ||
        "Não foi possível carregar as estatísticas."
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Dados do gráfico de faturamento
  const revenueChartData = revenue?.dailyRevenue?.map((item) => ({
    ...item,
    dateFormatted: item.date.split("-").reverse().slice(0, 2).join("/"),
  })) || [];

  // Calcular variação entre o primeiro e o último dia do período
  const firstRevenue = revenueChartData[0]?.revenue ?? 0;
  const lastRevenue =
    revenueChartData[revenueChartData.length - 1]?.revenue ?? 0;

  const variation =
    firstRevenue > 0
      ? ((lastRevenue - firstRevenue) / firstRevenue) * 100
      : null;

  const isGrowing = lastRevenue >= firstRevenue;

  // Dados do gráfico de pagamentos
  const paymentChartData = payments
    ? [
        { name: "Aprovados", value: payments.approvedPayments },
        { name: "Pendentes", value: payments.pendingPayments },
        { name: "Recusados", value: payments.refusedPayments },
      ]
    : [];

  const paymentColors = ["#16a34a", "#eab308", "#dc2626"];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-[#d4af37]" size={35} />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Botão para voltar à página inicial */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Voltar para Home
        </Link>

        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Estatísticas
            </h1>

            <p className="mt-1 text-gray-500">
              Acompanhe o desempenho da sua loja.
            </p>
          </div>

          <button
            onClick={loadStatistics}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-5 py-3 font-semibold text-black transition hover:bg-[#c19b2e]"
          >
            <RefreshCw size={18} />
            Atualizar dados
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Cards principais */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total de pedidos</p>
              <ShoppingCart className="text-[#d4af37]" size={23} />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {overview?.totalOrders ?? 0}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Faturamento total</p>
              <DollarSign className="text-green-600" size={23} />
            </div>

            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {formatCurrency(overview?.totalRevenue ?? 0)}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pedidos pagos</p>
              <CheckCircle className="text-green-600" size={23} />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {overview?.paidOrders ?? 0}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pedidos pendentes</p>
              <Clock className="text-yellow-500" size={23} />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {overview?.pendingOrders ?? 0}
            </h2>
          </div>
        </div>

        {/* Filtro de período */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Filtrar período
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Data inicial
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Data final
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="rounded-lg bg-gray-100 px-5 py-2 text-sm text-gray-600">
              Pedidos no período:{" "}
              <strong className="text-gray-900">
                {orders?.totalOrders ?? 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Gráfico de faturamento */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Evolução do faturamento
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Acompanhe as subidas e descidas do faturamento por dia.
              </p>
            </div>

            {variation !== null && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isGrowing
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isGrowing ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )}

                {variation > 0 ? "+" : ""}
                {variation.toFixed(1)}%
              </div>
            )}
          </div>

          <div className="mb-5">
            <p className="text-sm text-gray-500">
              Faturamento no período
            </p>

            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(revenue?.totalRevenue ?? 0)}
            </p>
          </div>

          <div className="h-[320px] w-full">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="dateFormatted"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      `R$ ${Number(value).toLocaleString("pt-BR")}`
                    }
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Faturamento",
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d4af37"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#d4af37" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Nenhum faturamento encontrado nesse período.
              </div>
            )}
          </div>
        </div>

        {/* Gráficos inferiores */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Produtos mais vendidos */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Produtos mais vendidos
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Os produtos com maior quantidade de vendas.
            </p>

            <div className="h-[300px] w-full">
              {products.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={products}
                    layout="vertical"
                    margin={{ left: 15, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />

                    <XAxis type="number" />

                    <YAxis
                      type="category"
                      dataKey="productName"
                      width={100}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="quantitySold"
                      name="Unidades vendidas"
                      fill="#d4af37"
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Nenhum produto vendido.
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas de pagamentos */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Estatísticas de pagamentos
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Situação dos pagamentos realizados.
            </p>

            <div className="h-[300px] w-full">
              {paymentChartData.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      label
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={paymentColors[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Nenhum pagamento encontrado.
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Total recebido
              </p>

              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(payments?.totalReceived ?? 0)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
