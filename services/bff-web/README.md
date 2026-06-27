# BFF Web

Backend For Frontend do Portal Web (Next.js). Único ponto de entrada para o frontend web — agrega chamadas aos microsserviços internos, valida JWT, aplica RBAC e assina todas as requisições internas com HMAC.

**Porta:** `3000`  
**Perfis atendidos:** Doctor, Receptionist, Admin, Patient

---

## Como rodar localmente

```bash
# 1. Copiar e preencher as variáveis de ambiente
cp .env.example .env
# editar .env com as chaves JWT e HMAC usadas nos microsserviços

# 2. Instalar dependências
pnpm install

# 3. Rodar em modo dev
pnpm run start:dev
```

---

## Variáveis de configuração

| Variável | Descrição |
|---|---|
| `IDENTITY_SERVICE_URL` | URL do Identity Service (ex: `http://localhost:5001`) |
| `PATIENT_SERVICE_URL` | URL do Patient Service (ex: `http://localhost:5002`) |
| `APPOINTMENT_SERVICE_URL` | URL do Appointment Service (ex: `http://localhost:5003`) |
| `MEDICAL_RECORD_SERVICE_URL` | URL do Medical Record Service (ex: `http://localhost:5004`) |
| `JWT_CHAVE` | Chave secreta JWT — mesma do Identity Service |
| `HMAC_CHAVE` | Chave HMAC compartilhada com os microsserviços |
| `REDIS_HOST` | Host do Redis (padrão: `localhost`) |
| `REDIS_PORT` | Porta do Redis (padrão: `6379`) |
| `KAFKA_BROKERS` | Brokers Kafka separados por vírgula (ex: `localhost:9092`). Deixar vazio desabilita o consumer |
| `ALLOWED_ORIGINS` | Origins permitidas para CORS (separadas por vírgula) |

---

## Endpoints

### Auth

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | — | Autentica e seta cookie HttpOnly |
| `POST` | `/auth/refresh` | Cookie | Renova access token |
| `POST` | `/auth/logout` | JWT | Revoga sessão |
| `POST` | `/auth/alterar-senha` | JWT | Altera senha do usuário logado |

### Usuários

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/usuarios/me` | Todos | Dados do usuário logado |
| `GET` | `/usuarios` | Admin | Listar usuários |
| `GET` | `/usuarios/:id` | Admin | Obter por ID |
| `POST` | `/usuarios` | Admin | Criar usuário |
| `PATCH` | `/usuarios/:id/perfil` | Admin | Alterar perfil |
| `PATCH` | `/usuarios/:id/desativar` | Admin | Desativar usuário |

### Pacientes

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/pacientes` | Doctor, Receptionist, Admin | Listar (cache Redis `pacientes:lista`, TTL 60s) |
| `GET` | `/pacientes/cpf/:cpf` | Doctor, Receptionist, Admin | Buscar por CPF |
| `GET` | `/pacientes/:id` | Doctor, Receptionist, Admin | Obter por ID (cache Redis `paciente:{id}`, TTL 300s) |
| `POST` | `/pacientes` | Receptionist, Admin | Cadastrar (invalida `pacientes:lista`) |
| `PUT` | `/pacientes/:id` | Receptionist, Admin | Atualizar (invalida `paciente:{id}` + `pacientes:lista`) |
| `PATCH` | `/pacientes/:id/desativar` | Admin | Desativar (invalida `paciente:{id}` + `pacientes:lista`) |

### Consultas

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/consultas` | Doctor, Receptionist, Admin | Listar com filtros (cache Redis `consultas:medico:{id}`, TTL 60s, quando `idMedico` presente) |
| `GET` | `/consultas/:id` | Doctor, Receptionist, Admin | Obter por ID (cache Redis `consulta:{id}`, TTL 60s) |
| `POST` | `/consultas` | Receptionist, Admin | Agendar |
| `PATCH` | `/consultas/:id/confirmar` | Receptionist, Admin | Confirmar (invalida `consulta:{id}`) |
| `PATCH` | `/consultas/:id/cancelar` | Receptionist, Admin | Cancelar (invalida `consulta:{id}`) |
| `PATCH` | `/consultas/:id/concluir` | Doctor | Concluir (invalida `consulta:{id}`) |
| `PATCH` | `/consultas/:id/no-show` | Doctor, Admin | Registrar ausência (invalida `consulta:{id}`) |
| `GET` | `/disponibilidade` | Doctor, Receptionist, Admin | Slots disponíveis |

### Grade de Horários

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/grade-horarios` | Doctor, Receptionist, Admin | Listar grades |
| `POST` | `/grade-horarios` | Admin | Criar grade |
| `DELETE` | `/grade-horarios/:id` | Admin | Remover grade |

### Prontuário

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/prontuarios/:idPaciente` | Doctor | Obter prontuário completo |
| `POST` | `/prontuarios/:idPaciente` | Doctor | Criar prontuário |
| `POST` | `/prontuarios/:idPaciente/entradas` | Doctor | Adicionar entrada |
| `GET` | `/prontuarios/:idPaciente/entradas/:id` | Doctor | Obter entrada |
| `GET` | `/prontuarios/:idPaciente/historico` | Doctor, Admin | Histórico de eventos |

### SSE — Real-time

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/events` | JWT | Stream SSE — notificações em tempo real |

**Payload SSE enviado ao frontend:**
```json
{
  "tipo": "ConsultaConfirmadaEvent",
  "idConsulta": "3fa85f64-...",
  "idMedico": "7cb12a31-...",
  "idPaciente": "9de45f21-..."
}
```

O BFF emite para o `userId` do médico (`idMedico`) e do paciente (`idPaciente`) envolvidos na consulta. O frontend exibe um toast correspondente ao tipo do evento.

### Health

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Health check |

---

## Cache Redis

| Chave | TTL | Criada em | Invalidada em |
|---|---|---|---|
| `pacientes:lista` | 60s | `GET /pacientes` | `POST/PUT/PATCH pacientes` + Kafka `prontumed.Paciente` |
| `paciente:{id}` | 300s | `GET /pacientes/:id` | `PUT/PATCH pacientes/:id` + Kafka `prontumed.Paciente` |
| `consultas:medico:{idMedico}` | 60s | `GET /consultas?idMedico=X` | Kafka `prontumed.Consulta` |
| `consulta:{id}` | 60s | `GET /consultas/:id` | confirmar / cancelar / concluir / no-show + Kafka `prontumed.Consulta` |

O Redis conecta no startup via `OnModuleInit` (`redis.service.ts`). Se o Redis estiver indisponível, o BFF degrada graciosamente: o erro é logado e as chamadas passam direto para os microsserviços.

---

## Kafka

O `KafkaConsumerService` consome dois tópicos:

| Tópico | Ação ao receber evento |
|---|---|
| `prontumed.Consulta` | Invalida chaves Redis de consulta + emite SSE ao médico e ao paciente |
| `prontumed.Paciente` | Invalida chaves Redis de paciente |

O consumer é desabilitado automaticamente se `KAFKA_BROKERS` não estiver configurado.

---

## Estrutura

```
src/
├── common/
│   ├── decorators/     # CurrentUser, Roles
│   ├── guards/         # JwtAuthGuard, RolesGuard
│   ├── hmac/           # HmacService (assina chamadas internas)
│   ├── redis/          # RedisService (cache read-through + invalidação via OnModuleInit)
│   ├── events/         # EventsService + EventsController (GET /events SSE)
│   └── kafka/          # KafkaConsumerService (consome prontumed.Consulta + prontumed.Paciente)
└── modules/
    ├── auth/           # Login, refresh, logout, alterar-senha
    ├── users/          # Gestão de usuários (proxy → Identity Service)
    ├── patients/       # Gestão de pacientes (proxy → Patient Service, com cache)
    ├── appointments/   # Consultas e grade horária (proxy → Appointment Service, com cache)
    ├── medical-record/ # Prontuário (proxy → Medical Record Service)
    └── health/         # Health check
```
