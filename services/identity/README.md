# Identity Service

Microsserviço de autenticação e gestão de usuários do ProntuMed. Emite e valida JWTs, gerencia refresh tokens e controla os perfis de acesso (RBAC).

**Porta:** `5001`  
**Banco:** `db_identity` (PostgreSQL, porta 5432)  
**Runtime:** .NET 10 + ASP.NET Core

---

## Autenticação

O serviço usa **cookies HttpOnly** — não Bearer token no header. Isso protege contra ataques XSS, já que o JavaScript da página não consegue ler os cookies.

| Cookie | Validade | Path | Conteúdo |
|---|---|---|---|
| `access_token` | 15 minutos | `/` | JWT assinado com a chave configurada |
| `refresh_token` | 7 dias | `/auth/refresh` | Token opaco para renovar a sessão |

Chamadas de outros serviços internos (ex: BFF) precisam assinar cada request com **HMAC-SHA256** via headers:
- `X-HMAC-Signature` — `HMAC-SHA256(METHOD + PATH + TIMESTAMP, chave_secreta)` em hex minúsculo
- `X-HMAC-Timestamp` — Unix timestamp em segundos (janela de tolerância: 5 minutos)

Rotas isentas de HMAC: `/health`, `/scalar`, `/openapi`.

---

## Endpoints

### Auth — `/auth`

#### `POST /auth/login`
Autentica o usuário e seta os cookies de sessão.

**Request body:**
```json
{
  "email": "joao@clinica.com",
  "senha": "minhasenha123"
}
```

**Response `200 OK`:**
```json
{
  "expiraEm": "2026-06-15T22:00:00Z"
}
```
Junto com os cookies `access_token` e `refresh_token` no `Set-Cookie`.

**Erros:**
- `400` — validação (e-mail inválido, senha em branco)
- `401` — credenciais incorretas

---

#### `POST /auth/refresh`
Renova o par de tokens usando o cookie `refresh_token`. Não precisa de body.

**Response `200 OK`:**
```json
{
  "expiraEm": "2026-06-15T22:15:00Z"
}
```
Seta novos cookies `access_token` e `refresh_token`.

**Erros:**
- `401` — cookie `refresh_token` ausente, expirado ou revogado

---

#### `POST /auth/logout`
Revoga o refresh token e apaga os dois cookies. Requer usuário autenticado (cookie `access_token` válido).

**Response `204 No Content`**

**Erros:**
- `401` — não autenticado

---

#### `POST /auth/alterar-senha`
Altera a senha do usuário autenticado. Requer cookie `access_token` válido.

**Request body:**
```json
{
  "senhaAtual": "senhaAntiga123",
  "novaSenha": "novaSenhaForte456"
}
```

**Response `204 No Content`**

**Erros:**
- `400` — validação (nova senha menor que 8 caracteres, campos em branco)
- `401` — não autenticado ou senha atual incorreta

---

### Usuários — `/usuarios`

Todos os endpoints exigem autenticação (cookie `access_token`). Endpoints marcados com `[Admin]` exigem perfil `Admin`.

---

#### `GET /usuarios/me`
Retorna os dados do usuário autenticado no momento.

**Response `200 OK`:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "joao@clinica.com",
  "primeiroNome": "João",
  "sobrenome": "Silva",
  "perfil": "Doctor",
  "ativo": true
}
```

---

#### `GET /usuarios` `[Admin]`
Lista todos os usuários com paginação.

**Query params:**
| Param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pagina` | int | `1` | Número da página |
| `tamanhoPagina` | int | `20` | Itens por página |

**Response `200 OK`:**
```json
[
  {
    "id": "...",
    "email": "...",
    "primeiroNome": "...",
    "sobrenome": "...",
    "perfil": "Doctor",
    "ativo": true
  }
]
```

---

#### `GET /usuarios/{id}` `[Admin]`
Retorna um usuário pelo ID.

**Response `200 OK`:** mesmo formato de `/usuarios/me`

**Erros:**
- `404` — usuário não encontrado

---

#### `GET /usuarios/{id}/interno`
Mesmo resultado de `GET /usuarios/{id}`, mas sem exigir JWT de usuário — apenas a assinatura HMAC. Uso exclusivo de serviços internos que não atuam em nome de um usuário logado (ex: Notification Service, que precisa do nome/e-mail do médico para montar uma notificação a partir de um evento Kafka). **Não exposto pelo BFF.**

**Response `200 OK`:** mesmo formato de `/usuarios/me`

**Erros:**
- `401` — assinatura HMAC ausente ou inválida
- `404` — usuário não encontrado

---

#### `POST /usuarios` `[Admin]`
Cria um novo usuário no sistema.

**Request body:**
```json
{
  "email": "maria@clinica.com",
  "senha": "senhaForte123",
  "primeiroNome": "Maria",
  "sobrenome": "Santos",
  "perfil": "Receptionist"
}
```

Valores aceitos para `perfil`: `Patient`, `Doctor`, `Receptionist`, `Admin`.

**Response `201 Created`:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```
Header `Location: /usuarios/{id}`

**Erros:**
- `400` — validação (e-mail inválido, senha curta, perfil inválido)
- `409` — e-mail já cadastrado

Ao criar, publica o evento `UsuarioCriadoEvent` na tabela `eventos_saida` (Outbox Pattern), que o Debezium captura e publica no tópico Kafka `prontumed.User`.

---

#### `PATCH /usuarios/{id}/perfil` `[Admin]`
Altera o perfil (role) de um usuário.

**Request body:**
```json
{
  "novoPerfil": "Admin"
}
```

**Response `204 No Content`**

Publica o evento `PerfilAlteradoEvent` na tabela `eventos_saida`.

---

#### `PATCH /usuarios/{id}/desativar` `[Admin]`
Desativa um usuário (soft delete — o registro permanece no banco, conforme LGPD).

**Response `204 No Content`**

**Erros:**
- `404` — usuário não encontrado

---

### Health

#### `GET /health`
Verifica se o serviço está no ar. Isento de HMAC e autenticação.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "identity"
}
```

---

## Documentação interativa

Com o serviço rodando, acesse `http://localhost:5001/scalar/v1` para explorar todos os endpoints via Scalar UI.

---

## Como rodar localmente

**Pré-requisito:** container `postgres-identity` rodando (via `docker compose up -d`).

```bash
cd services/identity/IdentityService.API
dotnet run
```

O serviço sobe em `http://localhost:5001`.

---

## Variáveis de configuração

Definidas em `appsettings.Development.json` (não versionado):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=db_identity;Username=clinicos;Password=prontumed_secret"
  },
  "Jwt": {
    "Chave": "sua-chave-secreta-com-no-minimo-32-caracteres"
  },
  "Hmac": {
    "Chave": "chave-hmac-compartilhada-com-o-bff"
  }
}
```

---

## Estrutura interna

```
IdentityService.Domain/        # Entidades, regras de negócio, interfaces
├── Entities/                  # Usuario, TokenRenovacao
├── Events/                    # UsuarioCriadoEvent, PerfilAlteradoEvent
├── Repositories/              # IUsuarioRepository, ITokenRenovacaoRepository
└── Exceptions/                # UsuarioNaoEncontradoException, etc.

IdentityService.Application/   # Casos de uso (CQRS via MediatR)
├── Commands/                  # CriarUsuario, Login, Logout, RenovarToken, AlterarSenha, AlterarPerfil, DesativarUsuario
├── Queries/                   # ObterUsuarioPorId, ListarUsuarios
├── Behaviors/                 # ValidationBehavior (FluentValidation no pipeline)
├── DTOs/                      # TokenDto, UsuarioDto
└── Interfaces/                # IJwtService, IHashService, IOutboxPublisher

IdentityService.Infrastructure/ # Implementações técnicas
├── Persistence/               # AppDbContext, configurações EF Core, repositórios
├── Services/                  # JwtService (RS256), BcryptHashService
├── Outbox/                    # OutboxPublisher
└── Migrations/                # Migrations EF Core

IdentityService.API/           # Entrada HTTP
├── Controllers/               # AuthController, UsuariosController
├── Middlewares/               # HmacValidationMiddleware, ExceptionHandlingMiddleware
└── Program.cs
```

---

## Tabelas do banco

| Tabela | Descrição |
|---|---|
| `usuarios` | Todos os usuários do sistema, independente do perfil |
| `tokens_renovacao` | Refresh tokens ativos (hash + validade + revogação) |
| `eventos_saida` | Fila de eventos para o Kafka via Debezium (Outbox Pattern) |

---

## Eventos publicados

| Evento | Quando | Tópico Kafka |
|---|---|---|
| `UsuarioCriado` | Novo usuário cadastrado | `prontumed.User` |
| `PerfilAlterado` | Perfil do usuário modificado | `prontumed.User` |
