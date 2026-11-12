# 💈 Soares Barbearia — Sistema Web

Sistema web desenvolvido para a **Soares Barbearia**, com o objetivo de modernizar a experiência dos clientes e facilitar o gerenciamento dos serviços, produtos, usuários e agendamentos.

A plataforma conta com uma vitrine de produtos, sistema de agendamento online e painel administrativo com controle de acesso por nível de permissão.

## 🚀 Tecnologias utilizadas

- **Next.js** — Desenvolvimento da interface web.
- **React** — Construção de componentes e interfaces.
- **TypeScript** — Tipagem estática.
- **Tailwind CSS** — Estilização da aplicação.
- **NestJS** — Desenvolvimento da API REST.
- **Prisma ORM** — Comunicação com o banco de dados.
- **PostgreSQL** — Banco de dados relacional.
- **JWT** — Autenticação e gerenciamento de sessões.
- **Axios** — Comunicação entre frontend e backend.

## ✨ Funcionalidades

### 👤 Área do cliente
- Cadastro e autenticação de usuários.
- Login com autenticação JWT.
- Visualização dos serviços disponíveis.
- Agendamento de serviços com barbeiros.
- Visualização de produtos disponíveis.
- Carrinho de compras sem integração de pagamento.
- Acesso às informações da barbearia.

### 🔐 Painel administrativo

Funcionalidades restritas a usuários com perfil de administrador (ADMIN).

- Visualização da quantidade de usuários online.
- Gerenciamento de contas de usuários.
- Exclusão de contas cadastradas.
- Gerenciamento de produtos (criar, editar e excluir).
- Gerenciamento de serviços (criar, editar e excluir).
- Visualização dos agendamentos realizados pelos clientes.
- Filtragem e consulta de agendamentos.
- Gerenciamento das informações da plataforma.

### 🛡️ Segurança e controle de acesso

- Autenticação baseada em JWT.
- Controle de acesso por níveis de permissão (ADMIN e CLIENTE).
- Proteção de rotas administrativas.
- Validação de dados no backend.
- Configuração de CORS.
- Gerenciamento de sessões de usuários.

## 🛍️ Mini loja

A plataforma possui uma pequena loja virtual para apresentar os produtos disponíveis na barbearia.

Os clientes podem visualizar os produtos e adicioná-los ao carrinho, porém **não existe integração com gateways de pagamento ou finalização de compras online**.

## 📅 Sistema de agendamentos

Os clientes podem realizar agendamentos escolhendo serviços, barbeiros, datas e horários disponíveis.

Os administradores possuem acesso ao gerenciamento dos agendamentos, podendo consultar e filtrar os registros.

## ⚙️ Instalação e execução

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Instale as dependências do frontend e backend:

```bash
npm install
```

Configure as variáveis de ambiente no arquivo `.env`.

Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

Inicie os servidores de desenvolvimento conforme a configuração de cada projeto.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Pedro Andrade**.
