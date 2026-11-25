# 💈 Soares Barbearia — Sistema Web

Sistema web desenvolvido para a **Soares Barbearia**, com o objetivo de modernizar a experiência dos clientes e facilitar o gerenciamento dos serviços, produtos, usuários, agendamentos e vendas.

A plataforma conta com uma vitrine de produtos, sistema de agendamento online, integração com pagamentos online e painel administrativo com controle de acesso por nível de permissão.

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
- **Stripe** — Integração com sistema de pagamentos online.
- **Google reCAPTCHA** — Proteção contra bots e tentativas automatizadas.
- **Nodemailer / SMTP** — Envio de notificações e códigos de autenticação por e-mail.

## ✨ Funcionalidades

### 👤 Área do cliente

- Cadastro e autenticação de usuários.
- Login com autenticação JWT.
- Proteção de login com CAPTCHA.
- Autenticação de dois fatores (2FA) por e-mail.
- Recebimento de códigos de verificação por e-mail.
- Recuperação e redefinição de senha.
- Notificações por e-mail sobre eventos e atividades da conta.
- Visualização dos serviços disponíveis.
- Agendamento de serviços com barbeiros.
- Visualização de produtos disponíveis.
- Carrinho de compras.
- Finalização de compras com pagamento online via Stripe.
- Acesso às informações da barbearia.

### 🔐 Painel administrativo

Funcionalidades restritas a usuários com perfil de administrador (ADMIN).

- Visualização da quantidade de usuários online.
- Gerenciamento de contas de usuários.
- Exclusão de contas cadastradas.
- Gerenciamento de produtos (criar, editar e excluir).
- Gerenciamento de serviços (criar, editar e excluir).
- Visualização dos pedidos realizados pelos clientes.
- Gerenciamento e atualização do status dos pedidos.
- Visualização dos agendamentos realizados pelos clientes.
- Filtragem e consulta de agendamentos.
- Acompanhamento das estatísticas de vendas e faturamento.
- Visualização do faturamento total.
- Gráficos de evolução do faturamento, permitindo acompanhar subidas e descidas das vendas.
- Análise do desempenho financeiro da plataforma.

### 📊 Sistema de estatísticas e faturamento

O painel administrativo possui uma área dedicada ao acompanhamento financeiro, permitindo:

- Consultar o resumo geral das vendas.
- Visualizar o faturamento da plataforma.
- Acompanhar a evolução das vendas por meio de gráficos.
- Identificar períodos de crescimento e queda no faturamento.
- Analisar o desempenho financeiro da loja.

### 🛡️ Segurança e controle de acesso

- Autenticação baseada em JWT.
- CAPTCHA para proteção contra acessos automatizados.
- Autenticação de dois fatores (2FA).
- Envio de códigos de verificação por e-mail.
- Notificações por e-mail relacionadas à segurança e à conta do usuário.
- Recuperação e redefinição de senha.
- Controle de acesso por níveis de permissão (ADMIN e CLIENTE).
- Proteção de rotas administrativas.
- Validação de dados no backend.
- Configuração de CORS.
- Gerenciamento de sessões de usuários.
- Integração segura com o Stripe para processamento de pagamentos.

## 🛍️ Mini loja virtual

A plataforma possui uma loja virtual para apresentar os produtos disponíveis na barbearia.

Os clientes podem visualizar os produtos, adicioná-los ao carrinho e realizar compras online por meio da integração com o Stripe.

O sistema permite que os pedidos sejam registrados e posteriormente gerenciados pelo painel administrativo.

## 📅 Sistema de agendamentos

Os clientes podem realizar agendamentos escolhendo serviços, barbeiros, datas e horários disponíveis.

Os administradores possuem acesso ao gerenciamento dos agendamentos, podendo consultar, filtrar e acompanhar os registros.

## ⚙️ Instalação e execução

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Instale as dependências do frontend e backend:

```bash
npm install
```

Configure as variáveis de ambiente nos arquivos `.env`.

Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

Inicie os servidores de desenvolvimento conforme a configuração de cada projeto.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Pedro Andrade**.
