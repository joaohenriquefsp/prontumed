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
| `GET` | `/pacientes` | Doctor, Receptionist, Admin | Listar |
| `GET` | `/pacientes/cpf/:cpf` | Doctor, Receptionist, Admin | Buscar por CPF |
| `GET` | `/pacientes/:id` | Doctor, Receptionist, Admin | Obter por ID |
| `POST` | `/pacientes` | Receptionist, Admin | Cadastrar |
| `PUT` | `/pacientes/:id` | Receptionist, Admin | Atualizar |
| `PATCH` | `/pacientes/:id/desativar` | Admin | Desativar (soft delete) |

### Consultas

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/consultas` | Doctor, Receptionist, Admin | Listar com filtros |
| `GET` | `/consultas/:id` | Doctor, Receptionist, Admin | Obter por ID |
| `POST` | `/consultas` | Receptionist, Admin | Agendar |
| `PATCH` | `/consultas/:id/confirmar` | Receptionist, Admin | Confirmar |
| `PATCH` | `/consultas/:id/cancelar` | Receptionist, Admin | Cancelar |
| `PATCH` | `/consultas/:id/concluir` | Doctor | Concluir |
| `PATCH` | `/consultas/:id/no-show` | Doctor, Admin | Registrar ausência |
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

### Health

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Health check |

---

## Estrutura

```
src/
├── common/
│   ├── decorators/     # CurrentUser, Roles
│   ├── guards/         # JwtAuthGuard, RolesGuard
│   └── hmac/           # HmacService (assina chamadas internas)
└── modules/
    ├── auth/           # Login, refresh, logout, alterar-senha
    ├── users/          # Gestão de usuários (proxy → Identity Service)
    ├── patients/       # Gestão de pacientes (proxy → Patient Service)
    ├── appointments/   # Consultas e grade horária (proxy → Appointment Service)
    ├── medical-record/ # Prontuário (proxy → Medical Record Service)
    └── health/         # Health check
```

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
