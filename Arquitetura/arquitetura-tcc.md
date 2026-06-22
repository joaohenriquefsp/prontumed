# Proposta Arquitetural — TCC
## Sistema de Gestão Clínica Baseado em Microsserviços e Comunicação Orientada a Eventos

---

## 1. Visão Geral da Arquitetura Proposta

A arquitetura proposta para o sistema de gestão clínica é baseada em microsserviços independentes, comunicação orientada a eventos e separação clara de responsabilidades por domínio de negócio. O objetivo central é superar as limitações das arquiteturas monolíticas tradicionais, promovendo escalabilidade horizontal, resiliência a falhas, facilidade de manutenção e capacidade de evolução contínua.

O sistema foi projetado para atender clínicas médicas gerais, com capacidade de escala para hospitais, suportando os perfis de Médico, Recepcionista, Administrador e Paciente.

---

## 2. Tecnologias e Ferramentas Utilizadas

### 2.1 Backend — Microsserviços

**ASP.NET Core (.NET 10)**  
Framework open-source da Microsoft para desenvolvimento de aplicações web e APIs de alta performance. Cada microsserviço do sistema é uma aplicação ASP.NET Core independente, com seu próprio ciclo de vida, banco de dados e pipeline de deployment. A escolha se justifica pela maturidade do ecossistema, suporte nativo a injeção de dependência, alto desempenho e ampla adoção em sistemas críticos corporativos. O .NET 10 é a versão LTS mais recente e traz melhorias de performance significativas em relação às versões anteriores.

**Entity Framework Core**  
ORM (Object-Relational Mapper) oficial do ecossistema .NET. Responsável pelo mapeamento entre entidades de domínio e tabelas relacionais, gerenciamento de migrations e abstração do acesso ao banco de dados. Permite que a camada de Infrastructure implemente os repositórios definidos no Domain sem expor detalhes de persistência às camadas superiores.

**MediatR**  
Biblioteca que implementa o padrão Mediator em .NET, utilizada para operacionalizar o padrão CQRS (Command Query Responsibility Segregation). Commands e Queries são despachados via MediatR, desacoplando os Controllers dos Handlers de casos de uso na camada Application.

**FluentValidation**  
Biblioteca para construção de regras de validação de forma fluente e expressiva. Aplicada na camada Application para validar Commands e Queries antes de sua execução, garantindo consistência dos dados de entrada sem poluir a lógica de negócio.

**Polly**  
Biblioteca de resiliência para .NET que implementa padrões como Circuit Breaker, Retry e Timeout. Utilizada nas chamadas HTTP entre o BFF e os microsserviços internos, garantindo que falhas pontuais em um serviço não se propaguem em cascata para os demais.

**Serilog**  
Biblioteca de logging estruturado para .NET. Logs são emitidos em formato JSON, facilitando a ingestão por ferramentas de observabilidade. Cada microsserviço inclui contexto de correlação nos logs para rastreabilidade de requisições distribuídas.

---

### 2.2 API Gateway / BFF

**NestJS**  
Framework Node.js progressivo para construção de aplicações server-side eficientes e escaláveis. Utilizado como BFF (Backend For Frontend), é o único ponto de entrada para todos os clientes do sistema — um único BFF atende tanto o Portal Web quanto o App Mobile, organizando suas rotas por perfil de cliente. Responsável por validação de formato dos dados de entrada, validação de tokens JWT, autorização RBAC, roteamento para microsserviços internos, composição de respostas e assinatura HMAC nas chamadas internas. A validação de regras de negócio (unicidade, invariantes de domínio) é responsabilidade de cada microsserviço — o BFF não é trusted pelos serviços internos.

**Passport.js**  
Middleware de autenticação para Node.js, integrado ao NestJS para implementação do fluxo OAuth2 com PKCE. Gerencia a validação de tokens JWT emitidos pelo Identity Service.

---

### 2.3 Frontend

**Next.js 14 (App Router)**  
Framework React com suporte a Server-Side Rendering (SSR), Static Site Generation (SSG) e React Server Components. Utilizado no Portal Web, que atende todos os perfis de usuário (Médico, Recepcionista, Admin e Paciente) com layouts e rotas separadas por role via RBAC. O App Router permite granularidade de renderização por segmento de rota, otimizando performance e segurança.

**React Native + Expo**  
Framework para desenvolvimento de aplicativos móveis multiplataforma (iOS e Android) utilizando React. O Expo simplifica o processo de build e distribuição. Utilizado no App Mobile, que atende Médico (agenda, prontuário, notificações push) e Paciente (consultas, notificações push). A escolha permite compartilhamento de lógica de negócio e tipos TypeScript com o Portal Web dentro do monorepo.

**Turborepo**  
Ferramenta de gerenciamento de monorepos JavaScript/TypeScript de alta performance. Permite que Portal Web e App Mobile coexistam no mesmo repositório compartilhando Design Tokens, componentes base, tipos TypeScript e utilitários, sem duplicação de código.

**Design Tokens**  
Sistema de variáveis de design (cores, tipografia, espaçamentos, bordas) compartilhadas entre Portal Web e App Mobile. Garante consistência visual entre plataformas e facilita a aplicação de temas (ex: modo escuro) de forma centralizada.

---

### 2.4 Banco de Dados

**PostgreSQL**  
Sistema de gerenciamento de banco de dados relacional open-source, reconhecido por sua robustez, suporte a transações ACID e recursos avançados como JSONB, full-text search e Write-Ahead Log (WAL). Cada microsserviço possui sua própria instância PostgreSQL isolada, seguindo o padrão Database per Service do DDD. O WAL é também a base para o funcionamento do Debezium (CDC).

**DBeaver**  
Ferramenta de administração de banco de dados universal, utilizada durante o desenvolvimento para inspeção, query e gerenciamento dos bancos PostgreSQL de cada microsserviço.

---

### 2.5 Mensageria e Eventos

**Apache Kafka**  
Plataforma distribuída de streaming de eventos, projetada para alta throughput, baixa latência e durabilidade de mensagens. Utilizado como Event Broker central da arquitetura. Eventos de domínio (ex: `ConsultaAgendadaEvent`, `PacienteCadastradoEvent`) são publicados em tópicos Kafka e consumidos pelos serviços interessados de forma assíncrona e desacoplada.

**Debezium**  
Plataforma open-source de Change Data Capture (CDC) baseada em Kafka Connect. Monitora o Write-Ahead Log (WAL) do PostgreSQL e captura automaticamente todas as alterações nas tabelas monitoradas (INSERT, UPDATE, DELETE), publicando-as como eventos no Kafka. Utilizado em conjunto com o Outbox Pattern para garantir entrega confiável de eventos sem two-phase commit.

**Outbox Pattern**  
Padrão arquitetural que resolve o problema de consistência entre persistência de dados e publicação de eventos. Ao invés de publicar diretamente no Kafka após salvar no banco (operação não atômica), o serviço salva o evento em uma tabela `outbox_events` na mesma transação SQL. O Debezium captura essa inserção via CDC e publica no Kafka, garantindo que nenhum evento seja perdido mesmo em caso de falha do broker.

**CloudEvents**  
Especificação aberta para padronização do formato de eventos em sistemas distribuídos. Todos os eventos publicados no Kafka seguem a especificação CloudEvents, garantindo interoperabilidade e consistência na estrutura dos payloads entre serviços.

---

### 2.6 Segurança

**OAuth2 + PKCE**  
OAuth2 é o protocolo padrão de autorização para sistemas modernos. O fluxo com PKCE (Proof Key for Code Exchange) é obrigatório para clientes públicos (como aplicativos móveis) onde não é possível armazenar um client secret de forma segura. Utilizado para autenticação de todos os usuários do sistema.

**JWT (JSON Web Token)**  
Padrão aberto (RFC 7519) para transmissão segura de informações entre partes como objeto JSON assinado. Tokens de curta duração (15 minutos) carregam as claims de identidade e role do usuário. Refresh tokens (7 dias) permitem renovação transparente sem nova autenticação.

**RBAC (Role-Based Access Control)**  
Modelo de controle de acesso baseado em papéis. Quatro roles são definidos: `Patient`, `Doctor`, `Receptionist` e `Admin`. Guards no BFF validam o role do usuário antes de rotear cada requisição, garantindo que cada perfil acesse apenas os recursos autorizados.

**HMAC (Hash-based Message Authentication Code)**  
Mecanismo de autenticação de mensagens baseado em função hash criptográfica. Utilizado para autenticação de serviço a serviço: o BFF assina cada requisição enviada aos microsserviços internos com uma chave secreta compartilhada. A mensagem assinada inclui `{Method}{Path}{QueryString}{Timestamp}`, impedindo alterações de parâmetros sem invalidar a assinatura. Um nonce armazenado em `IMemoryCache` protege contra replay attacks dentro da janela de tempo válida. Os microsserviços rejeitam qualquer chamada sem assinatura HMAC válida, implementando o princípio de Zero Trust na comunicação interna.

**LGPD (Lei Geral de Proteção de Dados)**  
A LGPD (Lei nº 13.709/2018) estabelece regras sobre coleta, armazenamento e tratamento de dados pessoais no Brasil. A arquitetura incorpora requisitos da LGPD como: criptografia de dados sensíveis at rest, soft delete com anonimização, log de acesso ao prontuário eletrônico e rastreabilidade de alterações via Event Sourcing no Medical Record Service.

---

### 2.7 Infraestrutura

**Docker**  
Plataforma de containerização que empacota cada microsserviço e suas dependências em containers isolados e portáveis. Garante paridade entre ambientes de desenvolvimento, homologação e produção.

**Docker Compose**  
Ferramenta para definição e execução de aplicações multi-container. Um único arquivo `docker-compose.yml` na raiz do repositório sobe toda a infraestrutura local: cinco instâncias PostgreSQL, Kafka, Zookeeper, Debezium Connect, Kafka UI e todos os microsserviços.

---

## 3. Padrões Arquiteturais Aplicados

### 3.1 Domain-Driven Design (DDD)
O DDD organiza o sistema em Bounded Contexts — fronteiras explícitas onde um modelo de domínio específico é válido e consistente. Cada microsserviço corresponde a um Bounded Context: Identity, Patient, Appointment, Medical Record e Notification. Dentro de cada contexto, os conceitos de Aggregate Root, Value Objects e Domain Events estruturam o modelo de domínio de forma coesa e sem vazamento de responsabilidades entre contextos.

### 3.2 Clean Architecture
Cada microsserviço é estruturado em quatro camadas concêntricas: Domain (centro), Application, Infrastructure e API (externa). A regra de dependência determina que camadas externas dependem de camadas internas, nunca o contrário. Isso garante que a lógica de negócio (Domain e Application) seja completamente independente de frameworks, banco de dados e protocolos de comunicação.

### 3.3 CQRS (Command Query Responsibility Segregation)
Separação entre operações de escrita (Commands) e leitura (Queries). Commands alteram o estado do sistema e publicam Domain Events. Queries retornam projeções otimizadas para leitura sem passar pela lógica de negócio. Implementado via MediatR, reduz acoplamento entre casos de uso e permite otimizações independentes de leitura e escrita.

### 3.4 Event Sourcing
Aplicado exclusivamente no Medical Record Service. Ao invés de armazenar o estado atual do prontuário, o sistema armazena a sequência de eventos que levaram a esse estado. O estado atual é derivado pela projeção dos eventos. Isso garante histórico imutável e auditabilidade total, requisitos da legislação brasileira (CFM e LGPD) para registros médicos.

### 3.5 Saga Pattern (Máquina de Estados Interna)
Aplicado no Appointment Service para gerenciar o ciclo de vida de uma consulta com rastreabilidade de estado e compensação local em caso de falha.

**Decisão de design deliberada:** verificação de disponibilidade, reserva de slot e criação da consulta são operações dentro do mesmo Bounded Context (Appointment Service) e ocorrem em uma única transação SQL atômica. Não há coordenação cross-service nessa etapa — o Outbox Pattern já garante a entrega confiável do evento para o Notification Service via Kafka.

O Saga Pattern se manifesta como uma **máquina de estados persistida** na tabela `estado_saga`, que rastreia cada transição do agendamento:

```
Agendado → Confirmado → Concluido
         ↘             ↘ Cancelado (com compensação: libera o slot)
         ↘               NoShow
         → Concluido  (transição direta também válida)
         → NoShow     (transição direta também válida)
```

Essa abordagem é preferida a um Saga orquestrado cross-service por dois motivos: (1) toda a lógica de negócio de agendamento pertence ao mesmo Bounded Context, portanto não há justificativa para distribuir a transação entre serviços; (2) a complexidade operacional de coordenar múltiplos serviços com two-phase commit ou compensação remota não traz benefício para o domínio clínico do MVP. A consistência eventual entre Appointment Service e Notification Service é garantida pelo Outbox + Debezium, que é tratamento adequado para comunicação assíncrona entre contextos distintos.

### 3.6 BFF (Backend For Frontend)
Camada intermediária dedicada entre frontends e microsserviços. Diferentemente de um API Gateway genérico, o BFF é otimizado para as necessidades específicas de cada cliente, compondo respostas que agregam dados de múltiplos serviços em uma única requisição. Reduz over-fetching e under-fetching nos frontends.

### 3.7 Database per Service
Cada microsserviço possui sua própria instância de banco de dados PostgreSQL, completamente isolada. Nenhum serviço acessa o banco de outro diretamente. A comunicação entre serviços ocorre exclusivamente via eventos Kafka ou chamadas REST através do BFF. Isso garante acoplamento mínimo e permite que cada serviço evolua seu schema de forma independente.

---

## 4. Bounded Contexts e Responsabilidades

| Contexto | Responsabilidade | Padrão específico |
|---|---|---|
| Identity | Autenticação, usuários, roles, JWT | OAuth2 + PKCE |
| Patient | Cadastro e dados de pacientes | CQRS |
| Appointment | Agendamentos, agenda médica | CQRS + Saga Pattern |
| Medical Record | Prontuário eletrônico | CQRS + Event Sourcing |
| Notification | Disparo de notificações | Event Consumer (worker puro) |

---

## 5. Fluxo de Comunicação — Agendamento de Consulta

O fluxo abaixo demonstra a integração entre os padrões aplicados em um cenário real do sistema:

```
Recepcionista (Portal Web)
  → BFF NestJS [valida JWT + RBAC + HMAC]
    → Appointment Service [Command: AgendarConsulta]
      → Salva consulta + eventos_saida (transação atômica)
        → Debezium captura WAL
          → Publica ConsultaAgendadaEvent no Kafka (tópico prontumed.Consulta)
            → Notification Service consome evento
              → Busca dados do paciente/médico via HTTP+HMAC (Patient/Identity Service)
              → Envia email ao paciente (real, via SMTP)
              → Envia push ao paciente (simulado na v1 — depende do App Mobile existir)
```

Este fluxo demonstra: separação de responsabilidades (CQRS), consistência eventual (Outbox + Debezium + Kafka), processamento assíncrono desacoplado (Event-Driven) e Zero Trust interno (HMAC).

---

## 6. Benefícios da Arquitetura Proposta

**Escalabilidade independente:** Cada serviço pode ser escalado horizontalmente de forma isolada conforme a demanda. Em períodos de alta demanda de agendamentos, apenas o Appointment Service precisa de mais instâncias.

**Resiliência a falhas:** O Circuit Breaker (Polly) impede propagação de falhas em cascata. O Outbox Pattern garante que eventos não se percam mesmo com Kafka indisponível. O Notification Service pode falhar sem afetar o agendamento.

**Evolução independente:** Novos requisitos em um contexto (ex: adicionar prescrição digital ao Medical Record) não exigem alterações nos demais serviços.

**Auditabilidade:** Event Sourcing no prontuário garante histórico imutável e rastreável, atendendo requisitos legais. HMAC garante autenticidade de todas as comunicações internas.

**Escalabilidade para hospital:** A arquitetura suporta novos Bounded Contexts (Faturamento, Farmácia, Laboratório, Internações) sem alteração nos contextos existentes.

---

## 7. Desafios e Limitações

**Consistência eventual:** A comunicação assíncrona via Kafka implica que dados nem sempre estão imediatamente consistentes entre serviços. Requer tratamento adequado de idempotência nos consumers.

**Complexidade operacional:** Gerenciar múltiplos serviços, bancos de dados e um broker de mensagens aumenta a complexidade de deployment e observabilidade em relação a um monolito.

**Overhead de desenvolvimento inicial:** A estrutura DDD + Clean Architecture exige maior investimento inicial na definição dos modelos de domínio antes de produzir funcionalidades visíveis.

**Transações distribuídas:** Operações que cruzam múltiplos serviços não têm transações ACID nativas. O Saga Pattern mitiga isso, mas exige implementação cuidadosa das etapas de compensação.

