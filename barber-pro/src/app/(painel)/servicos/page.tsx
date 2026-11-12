
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../../../service/apiClient";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENTE";
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  avatar?: string;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
};

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "users" | "products">(
    "overview"
  );

  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getProductImage(avatar?: string) {
  if (!avatar) return null;

  // Se o backend já retornar uma URL completa, usa ela.
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  // Se retornar apenas o nome do arquivo, monta o endereço.
  const fileName = avatar
    .replace(/^\/+/, "")
    .replace(/^files\//, "");

  return `http://localhost:3333/files/${fileName}`;
}

  // Busca todas as contas.
  async function pegarEmail() {
    const response = await api.get("/auth/getTodas");

    const contas: User[] = Array.isArray(response.data)
      ? response.data
      : response.data?.users ?? [];

    setUsers(contas);
  }

  // Busca os produtos cadastrados no banco.
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const erros: string[] = [];

    try {
      await pegarEmail();
    } catch (err: any) {
      erros.push(
        err.response?.data?.message ??
          "Não foi possível carregar as contas."
      );
    }

    try {
      const response = await api.get(
        "/products/varios?limit=50&offset=0"
      );

      const lista: Product[] = Array.isArray(response.data)
        ? response.data
        : response.data?.products ?? [];

      setProducts(lista);
    } catch (err: any) {
      erros.push(
        err.response?.data?.message ??
          "Não foi possível carregar os produtos."
      );
    }

    if (erros.length > 0) {
      setError(erros.join(" "));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function notify(message: string) {
    setSuccess(message);
    setError("");

    window.setTimeout(() => setSuccess(""), 3500);
  }

  // Altera a função do usuário.
  async function changeRole(user: User) {
    const newRole: User["role"] =
      user.role === "ADMIN" ? "CLIENTE" : "ADMIN";

    if (!window.confirm(`Deseja mudar ${user.name} para ${newRole}?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setChangingRoleId(user.id);

    try {
      const response = await api.post("/auth/rolee", {
        userId: user.id,
        role: newRole,
      });

      const roleAtualizada: User["role"] =
        response.data?.role ?? newRole;

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, role: roleAtualizada }
            : item
        )
      );

      notify(`Função de ${user.name} alterada para ${roleAtualizada}.`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "Não foi possível alterar a função."
      );
    } finally {
      setChangingRoleId(null);
    }
  }

  // Exclui uma conta.
  async function deleteUser(user: User) {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir a conta de ${user.name}?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/auth/${user.id}`);

      setUsers((current) =>
        current.filter((item) => item.id !== user.id)
      );

      notify("Conta excluída com sucesso.");
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "Não foi possível excluir a conta."
      );
    }
  }

  // Atualiza os campos do formulário.
  function handleFormChange(
    field: keyof ProductForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Limpa o formulário e cancela a edição.
  function cancelEdit() {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);

    const fileInput = document.getElementById(
      "product-image"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  }

  // Cria ou edita um produto.
  async function publishProduct(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const price = Number(form.price.replace(",", "."));

    if (!form.name.trim() || !form.description.trim()) {
      setError("Preencha o nome e a descrição do produto.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Informe um preço válido, maior que zero.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", String(price));

      if (imageFile) {
        formData.append("file", imageFile);
      }

      if (editingId) {
        // Atualiza o produto existente.
        await api.patch(`/products/${editingId}`, formData);
        notify("Produto atualizado com sucesso!");
      } else {
        // Cadastra um novo produto.
        await api.post("/products/create", formData);
        notify("Produto cadastrado com sucesso!");
      }

      cancelEdit();

      // Busca novamente os dados salvos no banco.
      await loadData();

      setTab("products");
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "Não foi possível salvar o produto."
      );
    } finally {
      setSaving(false);
    }
  }

  // Coloca os dados do produto no formulário para editar.
  function editProduct(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
    });

    setImageFile(null);
    setError("");
    setSuccess("");

    setTab("products");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Exclui um produto do banco.
  async function deleteProduct(product: Product) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o produto "${product.name}"?`
    );

    if (!confirmar) return;

    setError("");
    setSuccess("");
    setDeletingProductId(product.id);

    try {
      await api.delete(`/products/${product.id}`);

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      notify("Produto excluído com sucesso.");

      if (editingId === product.id) {
        cancelEdit();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "Não foi possível excluir o produto."
      );
    } finally {
      setDeletingProductId(null);
    }
  }

  const admins = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* MENU LATERAL */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/10 bg-[#0d0d0d] p-6 md:flex md:flex-col">

        <a href="/" className="mb-12 block">
          <span className="text-xs tracking-[0.35em] text-[#e8c547]">
            SOARES
          </span>

          <h1 className="mt-1 text-2xl font-black tracking-wider">
            BARBEARIA
          </h1>

          <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            Painel administrativo
          </p>
        </a>

        <nav className="space-y-2">
          {[
            { id: "overview", label: "Visão geral", icon: "◫" },
            { id: "users", label: "Contas", icon: "♙" },
            { id: "products", label: "Produtos", icon: "▤" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as typeof tab)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                tab === item.id
                  ? "bg-[#e8c547] font-bold text-black"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <a
            href="/"
            className="block rounded-xl px-4 py-3 text-sm text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            ← Voltar ao site
          </a>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <section className="min-w-0 md:ml-64">

        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#080808]/95 px-5 py-5 backdrop-blur md:px-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#e8c547]">
              Administração
            </p>

            <h2 className="mt-1 text-xl font-bold md:text-2xl">
              {tab === "overview"
                ? "Visão geral"
                : tab === "users"
                  ? "Gerenciar contas"
                  : "Gerenciar produtos"}
            </h2>
          </div>
        </header>

        <div className="space-y-7 p-5 pb-24 md:p-10">

          {/* MENSAGENS */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
            >
              {Array.isArray(error) ? error.join(", ") : error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-[#e8c547]/30 bg-[#e8c547]/10 p-4 text-sm text-[#e8c547]"
            >
              {success}
            </div>
          )}

          {/* RESUMO */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[
              { label: "Contas cadastradas", value: users.length },
              { label: "Administradores", value: admins },
              { label: "Produtos cadastrados", value: products.length },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#111111] p-5 md:p-6"
              >
                <p className="text-xs text-neutral-500">
                  {item.label}
                </p>

                <p className="mt-3 text-3xl font-black text-[#e8c547]">
                  {loading ? "—" : item.value}
                </p>
              </div>
            ))}
          </div>

          {/* VISÃO GERAL */}
          {tab === "overview" && (
            <section className="rounded-2xl border border-white/10 bg-[#111111] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#e8c547]">
                Central de controle
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Bem-vindo à administração.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">
                Gerencie as contas dos clientes, controle as permissões
                dos administradores e cadastre os produtos da Soares
                Barbearia.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => setTab("users")}
                  className="rounded-xl bg-[#e8c547] px-5 py-3 text-sm font-bold text-black hover:bg-[#f3d86e]"
                >
                  Gerenciar contas
                </button>

                <button
                  onClick={() => setTab("products")}
                  className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold hover:border-[#e8c547]"
                >
                  Ver produtos
                </button>
              </div>
            </section>
          )}

          {/* CONTAS */}
          {tab === "users" && (
            <section>
              <div className="mb-5">
                <h3 className="text-lg font-bold">
                  Contas dos usuários
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Veja os usuários cadastrados e gerencie suas permissões.
                </p>
              </div>

              {loading ? (
                <p className="py-10 text-center text-sm text-neutral-500">
                  Carregando contas...
                </p>
              ) : users.length === 0 ? (
                <div className="rounded-xl border border-white/10 p-8 text-center">
                  <p className="text-sm text-neutral-300">
                    Nenhuma conta encontrada.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-[#151515] text-xs uppercase tracking-wider text-neutral-500">
                      <tr>
                        <th className="px-5 py-4">Usuário</th>
                        <th className="px-5 py-4">Função</th>
                        <th className="px-5 py-4">Ações</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-5">
                            <p className="font-semibold">{user.name}</p>
                            <p className="mt-1 text-xs text-neutral-500">
                              {user.email}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                                user.role === "ADMIN"
                                  ? "bg-[#e8c547]/15 text-[#e8c547]"
                                  : "bg-white/10 text-neutral-300"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex gap-2">
                              <button
                                onClick={() => void changeRole(user)}
                                disabled={changingRoleId === user.id}
                                className="rounded-lg border border-white/15 px-3 py-2 text-xs hover:border-[#e8c547] hover:text-[#e8c547] disabled:opacity-50"
                              >
                                {changingRoleId === user.id
                                  ? "Alterando..."
                                  : user.role === "ADMIN"
                                    ? "Tornar cliente"
                                    : "Tornar administrador"}
                              </button>

                              <button
                                onClick={() => void deleteUser(user)}
                                className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* PRODUTOS */}
          {tab === "products" && (
            <div className="grid items-start gap-8 xl:grid-cols-2">

              {/* FORMULÁRIO */}
              <section className="rounded-2xl border border-white/10 bg-[#111111] p-5 md:p-7">

                <p className="text-xs uppercase tracking-[0.2em] text-[#e8c547]">
                  Loja
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {editingId ? "Editar produto" : "Cadastrar produto"}
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                  {editingId
                    ? "Altere as informações do produto."
                    : "Cadastre um novo produto para sua loja."}
                </p>

                <form
                  onSubmit={publishProduct}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-xs text-neutral-400">
                      Nome do produto
                    </label>

                    <input
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={(e) =>
                        handleFormChange("name", e.target.value)
                      }
                      placeholder="Ex.: Pomada modeladora"
                      className="w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-[#e8c547]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-neutral-400">
                      Descrição
                    </label>

                    <textarea
                      required
                      maxLength={1000}
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      placeholder="Descreva o produto..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-[#e8c547]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-neutral-400">
                      Preço (R$)
                    </label>

                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        handleFormChange("price", e.target.value)
                      }
                      placeholder="49.90"
                      className="w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-[#e8c547]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-neutral-400">
                      Imagem do produto
                    </label>

                    <input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] ?? null)
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-[#e8c547] file:px-3 file:py-2 file:text-xs file:font-bold file:text-black"
                    />

                    <p className="mt-2 text-xs text-neutral-600">
                      {editingId
                        ? "Selecione uma nova imagem somente se quiser substituir a atual."
                        : "Escolha uma imagem do seu computador."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-[#e8c547] px-5 py-3 font-bold text-black transition hover:bg-[#f3d86e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Salvando..."
                      : editingId
                        ? "Salvar alterações"
                        : "Cadastrar produto"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="w-full rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
                    >
                      Cancelar edição
                    </button>
                  )}
                </form>
              </section>

              {/* LISTA DE PRODUTOS */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Produtos cadastrados
                    </h3>

                    <p className="mt-1 text-xs text-neutral-500">
                      Produtos armazenados no banco de dados.
                    </p>
                  </div>

                  <button
                    onClick={() => void loadData()}
                    disabled={loading}
                    className="rounded-lg border border-white/15 px-3 py-2 text-xs hover:border-[#e8c547] disabled:opacity-50"
                  >
                    Atualizar
                  </button>
                </div>

                {loading ? (
                  <p className="py-10 text-center text-sm text-neutral-500">
                    Carregando produtos...
                  </p>
                ) : products.length === 0 ? (
                  <p className="rounded-xl border border-white/10 p-8 text-center text-sm text-neutral-500">
                    Nenhum produto cadastrado ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <article
                        key={product.id}
                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111111] p-4 sm:flex-row"
                      >
                         {product.avatar ? (
                        <img
                          src={
                            product.avatar.startsWith("http")
                              ? product.avatar
                              : `http://localhost:3333/files/${product.avatar
                                  .replace(/^\/+/, "")
                                  .replace(/^files\//, "")}`
                          }
                          alt={product.name}
                          onError={(e) => {
                            console.log("Erro ao carregar imagem:", e.currentTarget.src);
                          }}
                          className="h-24 w-full rounded-xl bg-black object-cover sm:h-20 sm:w-20"
                        />
                      ) : (
                        <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl bg-black text-2xl text-[#e8c547] sm:h-20 sm:w-20">
                          S
                        </div>
                      )}

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold">
                            {product.name}
                          </h4>

                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                            {product.description}
                          </p>

                          <p className="mt-2 font-bold text-[#e8c547]">
                            {Number(product.price).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => editProduct(product)}
                              className="rounded-lg border border-white/15 px-3 py-2 text-xs hover:border-[#e8c547] hover:text-[#e8c547]"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => void deleteProduct(product)}
                              disabled={deletingProductId === product.id}
                              className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {deletingProductId === product.id
                                ? "Excluindo..."
                                : "Excluir"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </section>

      {/* MENU MOBILE */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-white/10 bg-[#0d0d0d] p-2 md:hidden">
        {[
          { id: "overview", label: "Início" },
          { id: "users", label: "Contas" },
          { id: "products", label: "Produtos" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as typeof tab)}
            className={`rounded-lg px-2 py-3 text-xs ${
              tab === item.id
                ? "font-bold text-[#e8c547]"
                : "text-neutral-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  );
}
