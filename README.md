# Telegram Intercept

> Criei esse projeto aqui porque estou em mil grupos de promoção no Telegram, não tava suportando o flood de notificações e só queria ser avisado no WhatsApp quando aparecesse um PS5 pra jogar GTA

Automação pessoal em Node.js / TypeScript para monitorar mensagens e canais do Telegram em tempo real via MTProto (`telegram`), filtrar conteúdos com base em regras/palavras-chave personalizadas e despachar alertas de forma desacoplada (por padrão integrado ao **Jarvis**, meu agente pessoal no WhatsApp --> [link](https://github.com/igoralbuquerque12/jarvis/)).

---

## 📌 Visão Geral

- **Client MTProto (`TelegramService`):** Escuta canais e chats no Telegram utilizando a biblioteca `telegram` (GramJS) via sessão de usuário.
- **Engine de Filtros (`CriteriaService`):** Avalia mensagens recebidas contra regras configuradas (ex: busca por PlayStation 5, monitor LG UltraGear 27", etc.).
- **Arquitetura de Alertas Desacoplada (`AlertService` + `AlertProvider`):** O envio de notificações depende de uma interface genérica (`AlertProvider`), permitindo plugar qualquer canal (WhatsApp, E-mail, Discord, Webhook) sem alterar a regra de negócio.
- **Integração Jarvis (`JarvisService`):** Implementação padrão do `AlertProvider` que envia mensagens para `POST /v1/messages` na API do Jarvis com autenticação `Bearer`.
- **Healthcheck (`Express`):** Servidor HTTP interno com rota `GET /health` para monitorar o status da aplicação e da conexão com o Telegram.
- **Docker Ready:** Configurado para execução contínua com `Dockerfile` e `docker-compose.yml`.

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js 20+
- Credenciais de API do Telegram (obtenha em [my.telegram.org](https://my.telegram.org/apps))
- Chave de API do Jarvis (gerada em [jarvis.igoralbuquerque.site/configuracoes/api](https://jarvis.igoralbuquerque.site/configuracoes/api)) ou outro provedor de alerta implementado.

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
PORT=3000

TELEGRAM_API_ID=1234567
TELEGRAM_API_HASH=seu_telegram_api_hash
TELEGRAM_SESSION=sua_session_string_se_ja_tiver

JARVIS_URL=https://api-jarvis.igoralbuquerque.site
JARVIS_ADMIN_KEY=jrv_sua_chave_de_api
```

> **Dica para a Session String:** Na primeira execução em ambiente local (`npm start` ou `npm run dev`), o bot solicitará no terminal o número de telefone, código 2FA e SMS/Telegram Code para autenticar. Após logar, a session gerada será exibida no terminal (quando `ENV=development`). Salve-a na variável `TELEGRAM_SESSION` para evitar novos logins interativos (especialmente necessário se for rodar via Docker).

### 3. Execução Local

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev
```

### 4. Execução via Docker

```bash
docker compose up -d --build
```

---

## 🛠 Estrutura do Projeto

```text
src/
├── config/
│   └── env.ts                # Configurações e validações de variáveis de ambiente
├── entities/
│   ├── alert.entity.ts       # Contrato desacoplado de alertas (AlertProvider, SendAlertDTO)
│   ├── criteria.entity.ts    # Interface de resultado dos filtros (MatchResult)
│   ├── jarvis.entity.ts      # DTO de requisição da API do Jarvis
│   └── message.entity.ts     # DTO de mensagens recebidas do Telegram
├── services/
│   ├── alert.service.ts      # Orquestrador de envio de alertas (agnóstico ao provedor)
│   ├── criteria.service.ts   # Regras e regex para match de mensagens (PS5, UltraGear 27, etc.)
│   ├── jarvis.service.ts     # Provedor de alerta integrado à API v1 do Jarvis
│   ├── message.service.ts    # Orquestração do fluxo de mensagens recebidas
│   └── telegram.service.ts   # Conexão e listeners MTProto do Telegram
└── index.ts                  # Ponto de entrada (bootstrap + servidor Express)
```

---

## ⚙️ Customização

### Adicionando novos critérios de busca
Para adicionar ou alterar produtos e palavras-chave monitoradas, crie um novo método de validação e registre-o dentro do método `evaluate()` em [`src/services/criteria.service.ts`](src/services/criteria.service.ts).

### Trocando ou adicionando outro provedor de alerta
Basta criar uma nova classe que implemente a interface `AlertProvider` (definida em [`src/entities/alert.entity.ts`](src/entities/alert.entity.ts)) e injetá-la no `AlertService` dentro do [`src/index.ts`](src/index.ts).
