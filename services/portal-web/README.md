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

O bff-web precisa estar rodando em `http://localhost:3000` para as chamadas de API funcionarem. Em desenvolvimento, use o **mock mode** para dispensar o backend.

### Mock mode (sem backend)

Ativo por padrão no `.env.local`:

```env
MOCK_AUTH=true
NEXT_PUBLIC_MOCK_AUTH=true
```

Com isso:
- Middleware ignora autenticação (qualquer rota acessível diretamente)
- Login aceita qualquer credencial e redireciona para `/agenda`
- Todas as chamadas de API retornam dados fictícios locais (`lib/mock-data.ts`)
- Usuário logado: Carlos Mendes (Admin)

Para desativar (apontar para o bff-web real), comente as duas linhas no `.env.local` e reinicie o servidor.

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_BFF_URL` | URL base do bff-web | `http://localhost:3000` |
| `MOCK_AUTH` | Bypass de autenticação no middleware | `true` (dev) |
| `NEXT_PUBLIC_MOCK_AUTH` | Dados mock no cliente + login sem backend | `true` (dev) |

---

## Telas

| Rota | Tela | Perfis | Status |
|---|---|---|---|
| `/login` | Login | Todos | ✅ |
| `/agenda` | Agenda de Hoje (timeline) | Doctor, Admin | ✅ |
| `/pacientes` | Lista de Pacientes | Receptionist, Admin | ✅ |
| `/agendar` | Agendar Consulta | Receptionist, Admin | ✅ |
| `/configuracoes` | Tema e sidebar | Todos | ✅ |
| `/proximas` | Próximas Consultas | Doctor | ⏳ |
| `/prontuarios` | Prontuários | Doctor | ⏳ |
| `/consultas` | Consultas | Receptionist, Admin, Patient | ⏳ |
| `/usuarios` | Usuários | Admin | ⏳ |
| `/grade` | Grade Horária | Admin | ⏳ |
| `/perfil` | Meu Perfil | Patient | ⏳ |

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
    consultas/           ← placeholder
    usuarios/            ← placeholder
    grade/               ← placeholder
    proximas/            ← placeholder
    prontuarios/         ← placeholder
    perfil/              ← placeholder
components/
  layout/
    sidebar.tsx          ← Sidebar com nav por perfil
    sidebar-wrapper.tsx  ← Lê o contexto do usuário e passa para Sidebar
  providers/
    theme-provider.tsx   ← Aplica CSS custom properties de tema no mount
    user-provider.tsx    ← Carrega GET /usuarios/me e expõe via context
  shared/
    status-badge.tsx     ← Badge de status de consulta
    em-construcao.tsx    ← Placeholder para telas ainda não implementadas
lib/
  api.ts                 ← Wrapper fetch: credentials:include + refresh automático em 401
  types.ts               ← DTOs compartilhados (UsuarioDto, PacienteResumoDto, etc.)
  themes.ts              ← Paletas de cor e presets de sidebar
  mock-data.ts           ← Dados fictícios para mock mode
  utils.ts               ← Helpers (cn, etc.)
middleware.ts            ← Proteção de rotas (bypass em mock mode)
```

---

## Design system

Cores e sidebar são configuráveis em runtime via CSS custom properties — sem rebuild.

**Paletas de cor disponíveis:** `teal` (padrão), `indigo`, `blue`, `violet`, `amber`, `rose`

**Presets de sidebar:** `branco`, `escuro` (`#001E27`), `grafite` (`#1C1C1E`)

As preferências são salvas em `localStorage` e restauradas pelo `ThemeProvider` no mount.

O ícone de logo (verde `bg-pm-green`) **nunca muda** com o tema — decisão de produto.

---

## Autenticação

- Cookie HttpOnly `access_token` (15min) + `refresh_token` (7d) — gerenciados pelo bff-web
- `lib/api.ts` intercepta 401 → tenta `POST /auth/refresh` → repete a chamada original → se falhar, redireciona para `/login`
- `UserProvider` expõe o usuário via context (`useUser()`) para componentes que precisam do nome ou perfil
- `middleware.ts` redireciona rotas protegidas sem cookie para `/login`
