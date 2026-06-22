# BFF Mobile

Backend For Frontend do App Mobile (React Native + Expo). Atende os perfis Doctor e Patient com endpoints compostos e otimizados para dispositivos móveis — uma chamada já retorna os dados agregados de múltiplos microsserviços.

**Porta:** `3001`  
**Perfis atendidos:** Doctor, Patient

---

## Como rodar localmente

```bash
# 1. Copiar e preencher as variáveis de ambiente
cp .env.example .env

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
| `JWT_CHAVE` | Chave secreta JWT — mesma do Identity Service |
| `HMAC_CHAVE` | Chave HMAC compartilhada com os microsserviços |
| `REDIS_HOST` | Host do Redis (padrão: `localhost`) |
| `REDIS_PORT` | Porta do Redis (padrão: `6379`) |
| `KAFKA_BROKERS` | Brokers Kafka separados por vírgula. Deixar vazio desabilita o consumer |
| `ALLOWED_ORIGINS` | Origins permitidas para CORS |

---

## Endpoints

### Auth

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | — | Autentica e seta cookie HttpOnly |
| `POST` | `/auth/refresh` | Cookie | Renova access token |
| `POST` | `/auth/logout` | JWT | Revoga sessão |

### Agenda (Doctor)

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/agenda/hoje` | Doctor | Consultas do dia com nome do paciente composto |
| `GET` | `/agenda/proximas` | Doctor | Próximas consultas com nome do paciente |
| `PATCH` | `/agenda/:id/concluir` | Doctor | Concluir consulta |
| `PATCH` | `/agenda/:id/no-show` | Doctor | Registrar ausência |

> `GET /agenda/hoje` e `GET /agenda/proximas` fazem composição: chamam Appointment Service para obter as consultas e Patient Service para enriquecer com o nome e telefone de cada paciente — o app mobile recebe tudo em uma única chamada.

### Minhas Consultas (Patient)

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/minhas-consultas` | Patient | Consultas do paciente logado com nome do médico |
| `GET` | `/minhas-consultas/:id` | Patient | Detalhe de uma consulta com nome do médico |

> Composição: Appointment Service (consultas) + Identity Service (nome do médico).

### Perfil

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/perfil` | JWT | Dados do usuário logado |

### SSE — Real-time

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/events` | JWT | Stream SSE — notificações quando consultas do usuário mudam |

> O app mobile conecta em foreground e recebe `{ data: { tipo, idConsulta, idMedico, idPaciente } }` como sinal para refazer o fetch da tela ativa.

### Health

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Health check |

---

## Estrutura

```
src/
├── common/
│   ├── decorators/   # CurrentUser, Roles
│   ├── guards/       # JwtAuthGuard, RolesGuard
│   ├── hmac/         # HmacService (assina chamadas internas)
│   ├── redis/        # RedisService (cache read-through + invalidação)
│   ├── events/       # EventsService + EventsController (GET /events SSE)
│   └── kafka/        # KafkaConsumerService (consome prontumed.Consulta)
└── modules/
    ├── auth/         # Login, refresh, logout
    ├── agenda/       # Tela de agenda do médico (compõe Appointment + Patient)
    ├── consultas/    # Tela de consultas do paciente (compõe Appointment + Identity)
    ├── perfil/       # Dados do usuário logado
    └── health/       # Health check
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
