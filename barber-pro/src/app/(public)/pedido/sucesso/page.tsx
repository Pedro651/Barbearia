
import Link from "next/link";

export default function PedidoSucesso() {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-5">

            <div className="max-w-md w-full text-center border border-neutral-200 rounded-2xl p-8 shadow-sm">

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
                    ✓
                </div>

                <h1 className="text-2xl font-black uppercase text-black">
                    Pagamento realizado!
                </h1>

                <p className="mt-4 text-sm text-neutral-500">
                    Obrigado por comprar na Soares Barbearia!
                    Seu pagamento está sendo processado.
                </p>

                <Link
                    href="/produtos"
                    className="mt-8 inline-flex rounded-full bg-black px-8 py-4 text-xs font-bold uppercase text-white transition hover:bg-[#d4af37] hover:text-black"
                >
                    Voltar para a loja
                </Link>

            </div>

        </main>
    );
}
