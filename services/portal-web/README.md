# portal-web

Frontend web do ProntuMed. Next.js 14 App Router + TypeScript + Tailwind CSS puro.

- **Porta dev:** 3002
- **BFF consumido:** bff-web (porta 3000)
- **Package manager:** pnpm

---

## Como rodar localmente

```bash
cd services/portal-web
pnpm install
pnpm dev        # http://localhost:3002
```

O bff-web precisa estar rodando em `http://localhost:3000`.

### Mock mode (sem backend)

Desativado por padrão no `.env.local` (mock mode foi usado durante o desenvolvimento das telas e agora está desligado):

```env
MOCK_AUTH=false
NEXT_PUBLIC_MOCK_AUTH=false
```

Para ativar (dispensar o backend e visualizar as telas com dados fictícios):

```env
MOCK_AUTH=true
NEXT_PUBLIC_MOCK_AUTH=true
```

Com isso:
- Middleware ignora autenticação (qualquer rota acessível diretamente)
- Login aceita qualquer credencial e redireciona para `/agenda`
- Todas as chamadas de API retornam dados fictícios locais (`lib/mock-data.ts`)
- Usuário logado: Carlos Mendes (Admin)

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_BFF_URL` | URL base do bff-web | `http://localhost:3000` |
| `MOCK_AUTH` | Bypass de autenticação no middleware | `false` |
| `NEXT_PUBLIC_MOCK_AUTH` | Dados mock no cliente + login sem backend | `false` |

---

## Telas

Todas as telas estão implementadas e integradas ao bff-web real.

| Rota | Tela | Perfis | Status |
|---|---|---|---|
| `/login` | Login | Todos | ✅ Integrado |
| `/agenda` | Agenda de Hoje (timeline) | Doctor, Admin | ✅ Integrado |
| `/pacientes` | Lista de Pacientes + modal criar | Receptionist, Admin | ✅ Integrado |
| `/agendar` | Agendar Consulta (wizard 4 passos) | Receptionist, Admin | ✅ Integrado |
| `/configuracoes` | Tema e sidebar | Todos | ✅ Integrado |
| `/proximas` | Próximas Consultas | Doctor | ✅ Integrado |
| `/prontuarios` | Prontuários (event sourcing) | Doctor | ✅ Integrado |
| `/consultas` | Consultas (tabela + ações completas) | Receptionist, Admin | ✅ Integrado |
| `/usuarios` | Usuários (CRUD + modal criar) | Admin | ✅ Integrado |
| `/grade` | Grade Horária | Admin, Doctor | ✅ Integrado |
| `/perfil` | Meu Perfil (nome + senha) | Todos | ✅ Integrado |

---

## Estrutura de pastas

```
app/
  (auth)/login/          ← Tela de login (fora do layout do portal)
  (portal)/              ← Layout com sidebar (requer autenticação)
    agenda/
    pacientes/
    agendar/
    configuracoes/
    consultas/
    usuarios/
    grade/
    proximas/
    prontuarios/
    perfil/
components/
  layout/
    sidebar.tsx          ← Sidebar com nav filtrado por perfil
    sidebar-wrapper.tsx  ← Lê o contexto do usuário e passa para Sidebar
  providers/
    theme-provider.tsx   ← Aplica CSS custom properties de tema no mount
    user-provider.tsx    ← Carrega GET /usuarios/me e expõe via context
    sse-provider.tsx     ← Conecta SSE ao sistema de toasts (só com user autenticado)
  shared/
    status-badge.tsx     ← Badge de status de consulta
    toast-container.tsx  ← UI de toasts fixada no canto inferior direito
hooks/
  use-sse.ts             ← EventSource com reconnect exponencial (2s→30s)
lib/
  api.ts                 ← Wrapper fetch: credentials:include + refresh automático em 401
  types.ts               ← DTOs compartilhados (UsuarioDto, PacienteResumoDto, etc.)
  themes.ts              ← Paletas de cor e presets de sidebar
  mock-data.ts           ← Dados fictícios para mock mode
  toast-store.ts         ← zustand store de toasts (push + auto-dismiss 5s)
  utils.ts               ← Helpers (cn, etc.)
middleware.ts            ← Proteção de rotas (bypass em mock mode)
```

---

## Design system

Cores e sidebar são configuráveis em runtime via CSS custom properties — sem rebuild.

**Paletas de cor disponíveis:** `teal` (padrão), `indigo`, `blue`, `violet`, `amber`, `rose`

**Presets de sidebar:** `branco`, `escuro` (`#001E27`), `grafite` (`#1C1C1E`)

As preferências são salvas em `localStorage` e restauradas pelo `ThemeProvider` no mount.

---

## Autenticação

- Cookie HttpOnly `access_token` (15min) + `refresh_token` (7d) — gerenciados pelo bff-web
- `lib/api.ts` intercepta 401 → tenta `POST /auth/refresh` → repete a chamada original → se falhar, redireciona para `/login`
- `UserProvider` expõe o usuário via context (`useUser()`) para componentes que precisam do nome ou perfil
- `middleware.ts` redireciona rotas protegidas sem cookie para `/login`

---

## SSE (notificações em tempo real)

O `SseProvider` conecta ao endpoint `GET /events` do bff-web assim que o usuário está autenticado. Quando um evento de consulta chega via Kafka, o bff emite um payload via SSE e o portal exibe um toast:

| Evento | Toast |
|---|---|
| `ConsultaAgendadaEvent` | "Nova consulta agendada" (info) |
| `ConsultaConfirmadaEvent` | "Consulta confirmada" (success) |
| `ConsultaCanceladaEvent` | "Consulta cancelada" (warning) |
| `ConsultaConcluidaEvent` | "Consulta concluída" (success) |
| `ConsultaNoShowEvent` | "Paciente não compareceu" (error) |

A conexão SSE reconecta automaticamente com backoff exponencial (2s → 30s) em caso de queda.
