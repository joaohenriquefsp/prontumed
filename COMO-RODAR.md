# Como Rodar o ProntuMed Localmente

Ambiente local com infra em Docker e microsserviços rodando pelo terminal (opção B).

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Docker Desktop | 4.x |
| .NET SDK | 10.0 |
| Node.js | 22.x |
| pnpm | 9.x |

---

## 1 · Variáveis de ambiente

```bash
# Na raiz do projeto
cp .env.example .env
```

O `.env.example` já tem os valores corretos para desenvolvimento. Não é necessário alterar nada.

---

## 2 · Subir a infraestrutura (Docker)

```bash
# Na raiz do projeto
docker compose up -d
```

Aguarde todos os containers ficarem healthy (pode levar ~60 segundos):

```bash
docker compose ps
```

| Container | Porta | Função |
|---|---|---|
| `postgres-identity` | 5432 | Banco Identity |
| `postgres-patients` | 5433 | Banco Patients |
| `postgres-appointments` | 5434 | Banco Appointments |
| `postgres-medical` | 5435 | Banco Medical Records |
| `postgres-notifications` | 5436 | Banco Notifications |
| `kafka` | 9092 | Mensageria |
| `prontumed-redis` | 6379 | Cache |
| `smtp4dev` | 5080 (UI) / 2525 (SMTP) | E-mails dev |
| `kafka-ui` | 8080 | Painel Kafka |
| `debezium-connect` | 8083 | CDC Connector |

---

## 3 · Criar arquivos de configuração local

Os arquivos abaixo são ignorados pelo git. Crie-os manualmente (conteúdo abaixo).

### `services/identity/IdentityService.API/appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=db_identity;Username=clinicos;Password=prontumed_secret"
  },
  "Jwt": {
    "Chave": "prontumed-dev-jwt-chave-minimo-32-caracteres!!!",
    "Emissor": "prontumed-identity",
    "Audiencia": "prontumed-services",
    "ExpiracaoMinutos": 15,
    "RefreshExpiracaoDias": 7
  },
  "Hmac": {
    "Chave": "prontumed-dev-hmac-chave-compartilhada-2026"
  }
}
```

### `services/patient/PatientService.API/appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=db_patients;Username=clinicos;Password=prontumed_secret"
  },
  "Jwt": {
    "Chave": "prontumed-dev-jwt-chave-minimo-32-caracteres!!!",
    "Emissor": "prontumed-identity",
    "Audiencia": "prontumed-services"
  },
  "Hmac": {
    "Chave": "prontumed-dev-hmac-chave-compartilhada-2026"
  }
}
```

### `services/appointment/AppointmentService.API/appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5434;Database=db_appointments;Username=clinicos;Password=prontumed_secret"
  },
  "Jwt": {
    "Chave": "prontumed-dev-jwt-chave-minimo-32-caracteres!!!",
    "Emissor": "prontumed-identity",
    "Audiencia": "prontumed-services"
  },
  "Hmac": {
    "Chave": "prontumed-dev-hmac-chave-compartilhada-2026"
  }
}
```

### `services/medical-record/MedicalRecordService.API/appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5435;Database=db_medical_records;Username=clinicos;Password=prontumed_secret"
  },
  "Jwt": {
    "Chave": "prontumed-dev-jwt-chave-minimo-32-caracteres!!!",
    "Emissor": "prontumed-identity",
    "Audiencia": "prontumed-services"
  },
  "Hmac": {
    "Chave": "prontumed-dev-hmac-chave-compartilhada-2026"
  }
}
```

### `services/notification/NotificationService.Worker/appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5436;Database=db_notifications;Username=clinicos;Password=prontumed_secret"
  },
  "Kafka": {
    "BootstrapServers": "localhost:9092",
    "GroupId": "notification-service",
    "TopicoConsultas": "prontumed.Consulta"
  },
  "Smtp": {
    "Host": "localhost",
    "Port": 2525,
    "RemetenteEmail": "naoresponda@prontumed.com.br",
    "RemetenteNome": "ProntuMed"
  },
  "ServicosInternos": {
    "IdentityServiceUrl": "http://localhost:5001",
    "PatientServiceUrl": "http://localhost:5002"
  },
  "Hmac": {
    "Chave": "prontumed-dev-hmac-chave-compartilhada-2026"
  }
}
```

### `services/bff-web/.env`
```
NODE_ENV=development
PORT=3000
IDENTITY_SERVICE_URL=http://localhost:5001
PATIENT_SERVICE_URL=http://localhost:5002
APPOINTMENT_SERVICE_URL=http://localhost:5003
MEDICAL_RECORD_SERVICE_URL=http://localhost:5004
JWT_CHAVE=prontumed-dev-jwt-chave-minimo-32-caracteres!!!
HMAC_CHAVE=prontumed-dev-hmac-chave-compartilhada-2026
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
ALLOWED_ORIGINS=http://localhost:3002
```

### `services/portal-web/.env.local`
```
NEXT_PUBLIC_BFF_URL=http://localhost:3000
MOCK_AUTH=false
NEXT_PUBLIC_MOCK_AUTH=false
```

---

## 4 · Aplicar migrations EF Core

Abra **um terminal por serviço** e execute `dotnet ef database update`.

```bash
# Identity
cd services/identity/IdentityService.API
dotnet ef database update --project ../IdentityService.Infrastructure

# Patient
cd services/patient/PatientService.API
dotnet ef database update --project ../PatientService.Infrastructure

# Appointment
cd services/appointment/AppointmentService.API
dotnet ef database update --project ../AppointmentService.Infrastructure

# Medical Record
cd services/medical-record/MedicalRecordService.API
dotnet ef database update --project ../MedicalRecordService.Infrastructure
```

> **Nota**: O serviço de Notification não usa EF Core diretamente (não tem migrations).

---

## 5 · Aplicar seeds (dados de exemplo)

```powershell
# PowerShell — na raiz do projeto
.\infra\seeds\seed.ps1
```

Isso insere usuários, pacientes, grades de horário e consultas para a demo.

---

## 6 · Rodar os microsserviços .NET

Abra **um terminal por serviço**:

```bash
# Terminal 1 — Identity Service (porta 5001)
cd services/identity/IdentityService.API
dotnet run

# Terminal 2 — Patient Service (porta 5002)
cd services/patient/PatientService.API
dotnet run

# Terminal 3 — Appointment Service (porta 5003)
cd services/appointment/AppointmentService.API
dotnet run

# Terminal 4 — Medical Record Service (porta 5004)
cd services/medical-record/MedicalRecordService.API
dotnet run

# Terminal 5 — Notification Worker (sem porta, só consome Kafka)
cd services/notification/NotificationService.Worker
dotnet run
```

---

## 7 · Rodar o BFF Web

```bash
# Terminal 6
cd services/bff-web
npm install     # primeira vez
npm run start:dev
# BFF disponível em http://localhost:3000
```

---

## 8 · Rodar o Portal Web

```bash
# Terminal 7
cd services/portal-web
pnpm install    # primeira vez
pnpm dev
# Portal disponível em http://localhost:3002
```

---

## 9 · Registrar conectores Debezium (CDC)

Após todos os serviços estarem rodando, registre os conectores para que mudanças
nos bancos sejam publicadas no Kafka automaticamente.

```bash
# Na raiz do projeto
cd infra/debezium
./register-connectors.sh
```

Verifique o status em: **http://localhost:8083/connectors**

---

## Validação do ambiente

### Redis cache funcionando

Agende uma consulta pelo portal e verifique via redis-cli:

```bash
docker exec -it prontumed-redis redis-cli
> KEYS consultas:*
> TTL consultas:medico:<uuid-do-medico>
```

Após a consulta ser criada, as chaves devem aparecer. Uma segunda requisição à mesma
rota deve ser servida do cache (sem log de chamada ao microsserviço).

### Kafka + SSE funcionando

1. Agende ou cancele uma consulta no portal
2. O evento `prontumed.Consulta` deve aparecer no **Kafka UI** → http://localhost:8080
3. O portal deve exibir um toast de notificação em tempo real (canto inferior direito)
4. O Notification Worker deve enviar um e-mail (visível em http://localhost:5080)

---

## Credenciais de acesso

| Usuário | E-mail | Senha | Perfil |
|---|---|---|---|
| Administrador | admin@prontumed.com | Prontumed@123 | Admin |
| Dr. Lucas | lucas@prontumed.com | Prontumed@123 | Doctor |
| Dra. Marina | marina@prontumed.com | Prontumed@123 | Doctor |
| Dr. Rafael | rafael@prontumed.com | Prontumed@123 | Doctor |
| Ana (recep.) | ana@prontumed.com | Prontumed@123 | Receptionist |
| Fernanda (pac.) | fernanda@prontumed.com | Prontumed@123 | Patient |

---

## Parar tudo

```bash
# Microsserviços: Ctrl+C em cada terminal
# Infra Docker:
docker compose down
```

Para limpar volumes (apagar dados):
```bash
docker compose down -v
```
