import type { AppProps } from 'next/app'
import { AuthProvider } from '../context/AuthContext'

// Componente principal da aplicação
function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Disponibiliza a autenticação para todas as páginas
    <AuthProvider>
      {/* Renderiza a página atual */}
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp