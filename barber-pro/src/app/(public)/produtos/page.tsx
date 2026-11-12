
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../service/apiClient";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  avatar?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ProdutosPage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getProductImage(product: Product) {
  if (!product.avatar) return null;

  if (product.avatar.startsWith("http")) {
    return product.avatar;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) return null;

  return `${API_URL.replace(/\/$/, "")}/files/${product.avatar.replace(/^\/+/, "")}`;
}

  
  // Busca os produtos cadastrados no banco.
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/products/varios?limit=50&offset=0");

      const products: Product[] = Array.isArray(response.data)
        ? response.data
        : response.data?.products ?? [];

      setProductsList(products);
    } catch (err: any) {
      console.error("Erro ao buscar produtos:", err);

      setError(
        err.response?.data?.message ??
          "Não foi possível carregar os produtos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // Adicionar produto à sacola.
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  // Alterar quantidade do item.
  const handleUpdateQuantity = (
    productId: string,
    delta: number
  ) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;

            return newQty > 0
              ? { ...item, quantity: newQty }
              : null;
          }

          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Contagem total de itens.
  const totalItemsCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // Valor total da compra.
  const totalPrice = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  // Formata o preço.
  function formatPrice(price: number) {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Enviar pedido para o WhatsApp.
  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    let message =
      "Olá! Gostaria de fazer o seguinte pedido na Soares Barbearia:\n\n";

    cart.forEach((item) => {
      message += `• ${item.name} (${item.quantity}x) - ${formatPrice(
        item.price * item.quantity
      )}\n`;
    });

    message += `\n*Total: ${formatPrice(totalPrice)}*`;

    const encodedMessage = encodeURIComponent(message);

    window.open(
      `https://wa.me/5581999999999?text=${encodedMessage}`,
      "_blank"
    );
  };

  
 
  return (
    <main className="min-h-screen bg-white text-black flex flex-col justify-between px-5 py-10 sm:px-10 lg:px-16">

      <div className="mx-auto w-full max-w-[1440px]">

        {/* TOPO */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition"
          >
            ← Voltar para a home
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
              SOARES BARBEARIA
            </span>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative bg-neutral-100 hover:bg-black hover:text-white transition px-3 py-1.5 rounded-full text-xs font-black uppercase cursor-pointer"
            >
              Sacola ({totalItemsCount})
            </button>
          </div>
        </div>

        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-neutral-200 pb-8">
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
              DA NOSSA CASA PARA A SUA
            </span>

            <h1 className="text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
              PRODUTOS SOARES
            </h1>
          </div>

          <p className="max-w-md text-sm text-neutral-500">
            A experiência da barbearia continua em casa com a linha própria
            Soares, criada para cuidar, finalizar e manter seu estilo todos
            os dias.
          </p>
        </div>

        {/* CARREGANDO */}
        {loading && (
          <div className="py-20 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              Carregando produtos...
            </p>
          </div>
        )}

        {/* ERRO */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={() => void loadProducts()}
              className="mt-4 rounded-full bg-black px-5 py-2 text-xs font-bold uppercase text-white hover:bg-[#d4af37] hover:text-black"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* NENHUM PRODUTO */}
        {!loading && !error && productsList.length === 0 && (
          <div className="py-20 text-center">
            <h2 className="text-xl font-black uppercase">
              Nenhum produto disponível
            </h2>

            <p className="mt-3 text-sm text-neutral-500">
              Em breve teremos novidades na nossa loja.
            </p>
          </div>
        )}

        {/* GRID DE PRODUTOS */}
        {!loading && !error && productsList.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">

            {productsList.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col justify-between border border-neutral-200 bg-neutral-50 p-6 rounded-xl transition hover:border-black"
              >
                <div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200 mb-5">

                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)!}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-200">
                        <span className="text-5xl font-black text-[#d4af37]">
                          S
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                    SOARES BARBEARIA
                  </span>

                  <h3 className="text-xl font-black uppercase tracking-tight mt-1 mb-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-3 mb-4">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex items-center justify-between mt-auto gap-2">
                  <span className="text-lg font-black tracking-tight">
                    {formatPrice(product.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-[#d4af37] hover:text-black cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* SACOLA */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">

          <div className="w-full max-w-md bg-white text-black h-full flex flex-col justify-between p-6 sm:p-8 shadow-2xl">

            {/* TOPO DO CARRINHO */}
            <div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  SUA SACOLA ({totalItemsCount})
                </h2>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs font-bold uppercase text-neutral-500 hover:text-black cursor-pointer"
                >
                  Fechar ✕
                </button>
              </div>

              {/* ITENS */}
              {cart.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <p className="text-sm">Sua sacola está vazia.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">

                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-neutral-100 pb-3"
                    >
                      <div>
                        <h4 className="text-xs font-black uppercase">
                          {item.name}
                        </h4>

                        <span className="text-xs text-neutral-500">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* QUANTIDADE */}
                      <div className="flex items-center gap-2 border border-neutral-200 rounded-full px-2 py-1">

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(item.id, -1)
                          }
                          className="px-2 text-xs font-bold text-neutral-500 hover:text-black cursor-pointer"
                        >
                          -
                        </button>

                        <span className="text-xs font-bold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(item.id, 1)
                          }
                          className="px-2 text-xs font-bold text-neutral-500 hover:text-black cursor-pointer"
                        >
                          +
                        </button>

                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* TOTAL E FINALIZAÇÃO */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-200 pt-6 mt-auto">

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Total do Pedido
                  </span>

                  <span className="text-2xl font-black tracking-tight">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckoutWhatsApp}
                  className="w-full inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#d4af37] hover:text-black cursor-pointer"
                >
                  Finalizar Pedido via WhatsApp
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <footer className="mx-auto w-full max-w-[1440px] border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
        © Soares Barbearia. Estilo, precisão e cuidado em cada detalhe.
      </footer>

    </main>
  );
}
