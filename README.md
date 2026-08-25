# Gestão de Estoque de Veículos

Sistema para controle de estoque de veículos e histórico de proprietário, composto por uma API em **.NET 10** e uma aplicação web em **React 19 + TypeScript**, com persistência em **Oracle Database**.

## Visão Geral

A aplicação permite cadastrar, consultar, atualizar e remover veículos de um estoque, além de manter o histórico completo de proprietários de cada veículo (com datas de aquisição e venda). O domínio gira em torno de duas entidades principais:

- **Veículo** — marca, modelo, ano, placa, cor, tipo, quilometragem, preço e situação (`Disponível`, `Vendido`, `Reservado`).
- **Proprietário** — nome, CPF, datas de aquisição/venda e observações, sempre vinculado a um veículo. Um veículo pode ter vários proprietários ao longo do tempo, e a regra de negócio identifica automaticamente o proprietário atual (aquele sem data de venda).

O frontend oferece listagem paginada com filtros, formulários de cadastro/edição e um modal de histórico de proprietários integrado à tela do veículo.

## Stack Tecnológica

**Backend**

- .NET 10 (Minimal APIs)
- ADO.NET via [Oracle.ManagedDataAccess.Core](https://www.nuget.org/packages/Oracle.ManagedDataAccess.Core) 23.26.300
- Swagger / OpenAPI (Swashbuckle 10.2.3)

**Frontend**

- React 19 + TypeScript 6
- Vite 8 (dev server e build)
- TanStack Query 5 (estado de servidor)
- React Router 7
- Tailwind CSS 4
- Zod 4 (validação de schemas)

**Banco de Dados**

- Oracle Database (testado com Oracle 23ai Free / `freepdb1`)

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) e [pnpm](https://pnpm.io/) (ou npm)
- Instância acessível do Oracle Database (local ou remota)

## Estrutura do Projeto

```
gestao-estoque-veiculos/
├── backend/
│   └── GestaoVeiculos.Api/
│       ├── Domain/          # Entidades e exceções de domínio
│       ├── Data/            # ConexaoFactory (OracleConnection)
│       ├── Repositories/    # Acesso a dados (ADO.NET)
│       ├── Services/        # Regras de negócio
│       ├── Endpoints/       # Rotas (Minimal APIs)
│       ├── Infrastructure/  # GlobalExceptionHandler
│       ├── Models/          # Requests, responses e page options
│       └── Program.cs
├── frontend/
│   └── GestaoVeiculos.Web/
│       └── src/
│           ├── pages/       # Páginas de rota
│           ├── features/    # veiculos/ e proprietarios/
│           ├── components/  # UI compartilhada (Button, Input, Modal, Table…)
│           ├── api/         # Cliente HTTP
│           ├── schemas/     # Schemas Zod
│           ├── hooks/       # Hooks compartilhados
│           └── router.tsx
├── database/
│   └── create_tables.sql    # Script de criação das tabelas
├── README.md
└── respostas.md             # Respostas das questões técnicas dissertativas
```

## Banco de Dados

1. Crie um usuário/schema no Oracle (ex.: `estoque`) com permissão para criar tabelas.
2. Execute o script [database/create_tables.sql](database/create_tables.sql) conectado a esse usuário. Ele cria as tabelas `VEICULO` e `PROPRIETARIO` (com FK e constraints).
3. Configure a connection string em [backend/GestaoVeiculos.Api/appsettings.Development.json](backend/GestaoVeiculos.Api/appsettings.Development.json):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "User Id=estoque;Password=SUA_SENHA;Data Source=localhost:1521/freepdb1;"
  }
}
```

## Como Rodar

### Backend

```bash
cd backend/GestaoVeiculos.Api
dotnet restore
dotnet run
```

- HTTP: <http://localhost:5093>
- HTTPS: <https://localhost:7221>
- Swagger (em Development): <http://localhost:5093/swagger>
- Health check: `GET /` → `{ dataHora, mensagem }`

### Frontend

```bash
cd frontend/GestaoVeiculos.Web
pnpm install   # ou: npm install
pnpm dev       # ou: npm run dev
```

- Dev server: <http://localhost:5173> (origem já liberada no CORS do backend)

Scripts adicionais do frontend: `build`, `preview`, `lint`, `lint:fix`, `format`, `format:check`.

## Configuração

Toda a configuração fica em [appsettings.Development.json](backend/GestaoVeiculos.Api/appsettings.Development.json):

- `ConnectionStrings:DefaultConnection` — string de conexão Oracle.
- `Cors:AllowedOrigins` — array de origens permitidas (por padrão, `http://localhost:5173`).

Para outros ambientes, crie o `appsettings.{Ambiente}.json` correspondente ou defina via variáveis de ambiente.

## Endpoints Principais

Base URL: `http://localhost:5093`

**Veículos** (`/veiculos`)

- `GET    /veiculos` — lista paginada (com filtros via query string)
- `GET    /veiculos/{id}` — detalhe do veículo
- `POST   /veiculos` — cria veículo
- `PUT    /veiculos/{id}` — atualiza veículo
- `DELETE /veiculos/{id}` — remove veículo

**Proprietários** (`/proprietarios`)

- `GET    /proprietarios` — lista paginada
- `GET    /proprietarios/veiculo/{id}` — histórico de proprietários de um veículo
- `POST   /proprietarios` — cria proprietário
- `PUT    /proprietarios/{id}` — atualiza proprietário
- `DELETE /proprietarios/{id}` — remove proprietário

Documentação interativa completa disponível no Swagger em ambiente Development.

## Questões Técnicas

As respostas às cinco questões técnicas dissertativas exigidas no desafio estão em [respostas.md](respostas.md), cobrindo gerenciamento de conexões, prevenção de SQL Injection, relacionamento entre tabelas, transações e organização do projeto.

## Decisões Técnicas

- **Minimal APIs** em vez de Controllers — menos boilerplate para uma API focada e enxuta.
- **ADO.NET com Oracle.ManagedDataAccess** em vez de EF Core — controle fino sobre o SQL executado no Oracle, sem overhead de tracking do EF.
- **Clean Architecture leve** (`Domain` → `Repositories` → `Services` → `Endpoints`) — separação clara de responsabilidades sem introduzir camadas desnecessárias.
- **Repository Pattern com `IConexaoFactory`** — isola a criação de `OracleConnection` e facilita substituição/teste.
- **Entidades ricas** — `Veiculo` e `Proprietario` encapsulam regras (ex.: `IsProprietarioAtual`) via métodos de fábrica e construtores privados.
- **`GlobalExceptionHandler` + `ProblemDetails`** — respostas de erro padronizadas em formato RFC 7807.
- **CORS configurável via `appsettings`** — origens liberadas por ambiente, sem hardcode.
- **React 19 + Vite 8** — build rápido, HMR moderno e stack atualizada.
- **TanStack Query** para estado de servidor — cache, refetch, invalidação e loading states resolvidos de forma declarativa.
- **Zod** para validação — mesma fonte gera schema em runtime e tipos estáticos.
- **Tailwind CSS 4** — utilitários com o novo plugin `@tailwindcss/vite`, sem CSS-in-JS.
- **Organização por features no frontend** (`src/features/veiculos`, `src/features/proprietarios`) — código de cada domínio próximo, favorecendo escalabilidade.
