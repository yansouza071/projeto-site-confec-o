# Ateliê & Confecção VesteBem - E-Commerce e Agente Google ADK

Plataforma completa de e-commerce para loja de confecção de moda e vestuário, integrada a um **Agente de Suporte Inteligente via WhatsApp construído com o Google ADK (Agent Development Kit)**. Conta com gestão de estoque em tempo real, autenticação multifator (2FA por E-mail e SMS), checkout seguro com tokenização de cartão de crédito e rastreamento de pedidos em tempo real.

---

## 1. Visão Geral e Arquitetura

O projeto adota o padrão **Clean Code / Layered Architecture** com **Repository Pattern** para separar as regras de negócio do acesso a dados.

```
├── /server.ts                         # Servidor Express Full-Stack com Vite middlewares
├── /src/
│   ├── /server/
│   │   ├── /db/
│   │   │   ├── types.ts               # Modelos e tipagens do banco de dados
│   │   │   └── database.ts            # Repositório de persistência e seed de dados
│   │   ├── /repositories/
│   │   │   └── index.ts               # ProductRepo, OrderRepo, UserRepo, SupportRepo, etc.
│   │   ├── /adk/
│   │   │   ├── environmentToolset.ts  # Ferramentas expostas ao Google ADK
│   │   │   └── agent.ts               # Orquestrador do Agente ADK (@google/genai)
│   │   └── /routes/
│   │       └── api.ts                 # Rotas REST da API
│   ├── /components/                   # Componentes React (Header, Modais, WhatsApp, etc.)
│   ├── /services/                     # Cliente de API Frontend
│   └── App.tsx                        # Aplicação React principal
├── AGENTS.md                          # Documentação detalhada da arquitetura ADK
└── README.md                          # Este guia
```

---

## 2. Variáveis de Ambiente

Crie ou configure o arquivo `.env` com base no `.env.example`:

```env
# GEMINI_API_KEY: Chave de API do Google Gemini para chamadas do Agente ADK
# (Configurada automaticamente via painel Secrets no AI Studio)
GEMINI_API_KEY="SUA_CHAVE_GEMINI_AQUI"

# APP_URL: URL base da aplicação
APP_URL="http://localhost:3000"

# PORT: Porta de execução do servidor (padrão 3000)
PORT=3000
```

> **Nota:** O agente conta com um mecanismo de fallback inteligente que garante o funcionamento integral das *skills* e ferramentas mesmo em ambientes locais sem conexão ativa com o Gemini.

---

## 3. Instalação e Execução

### Pré-requisitos
- Node.js versão 18 ou superior
- NPM ou Yarn

### Passos de Execução
```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo de desenvolvimento (Porta 3000)
npm run dev

# 3. Executar verificação de tipos e lint
npm run lint

# 4. Compilar para produção
npm run build
```

---

## 4. Rotas da API REST (`/api/*`)

### 4.1. Catálogo e Estoque
- `GET /api/products`: Lista produtos com filtros por categoria, busca, tamanho e faixa de preço.
- `GET /api/products/:id`: Retorna detalhes do produto pelo ID ou slug.
- `GET /api/products/:id/stock`: Consulta em tempo real o estoque por tamanho e cor.

### 4.2. Autenticação e 2FA
- `POST /api/auth/register`: Cadastro de usuário com hash seguro (`bcrypt`).
- `POST /api/auth/login`: Login etapa 1 (validação e geração de código 2FA via E-mail/SMS).
- `POST /api/auth/verify-2fa`: Login etapa 2 (validação do código de 6 dígitos expirável).
- `POST /api/auth/forgot-password`: Disparo de token e código de recuperação de senha.
- `POST /api/auth/reset-password`: Redefinição de senha com validação de token/código.

### 4.3. Cartões e Pagamento
- `GET /api/cards`: Lista cartões de crédito salvos do usuário.
- `POST /api/cards`: Tokenização segura PCI-DSS de cartão de crédito (`tok_pci_...`).

### 4.4. Pedidos e Rastreamento
- `GET /api/orders`: Lista de pedidos realizados.
- `POST /api/orders`: Finalização de pedido com baixa automática no estoque e geração de código de rastreamento (`VB...BR`).
- `GET /api/tracking/:code`: Consulta de linha do tempo e eventos de transporte do pedido.
- `PATCH /api/orders/:id/status`: Atualização do status do pedido com disparo de notificação.

### 4.5. Agente Google ADK e Atendimento
- `POST /api/adk/chat`: Envio de mensagens ao Agente ADK no WhatsApp com execução de ferramentas.
- `GET /api/adk/conversations`: Listagem de conversas e fila de transbordo humano.
- `POST /api/adk/human-reply`: Resposta manual enviada por um atendente humano.
- `POST /api/adk/resolve`: Encerramento de chamado.
- `GET /api/notifications`: Central de disparos de SMS, E-mail e WhatsApp em tempo real.
- `GET /api/exchanges`: Protocolos de trocas e devoluções.

---

## 5. Esquema do Banco de Dados Relacional / In-Memory

### Entidades Principais:
1. **Product**: ID, Nome, Slug, Categoria, Preço, Composição, Instruções de Lavagem, Variações (Tamanho, Cor, Estoque, SKU), Estoque Total.
2. **User**: ID, Nome, E-mail, Telefone, Hash da Senha (bcrypt), Papel (`customer`, `admin`), Preferência de 2FA, Cartões Salvos.
3. **SavedCard**: ID, Titular, Bandeira, Últimos 4 dígitos, Validade, `cardToken` (Token PCI-DSS).
4. **Order**: ID, Cliente, Itens, Subtotal, Frete, Desconto, Total, Forma de Pagamento, Status (`em_producao_corte`, `em_transporte`, `entregue`), Código de Rastreio (`VB...BR`), Linha do Tempo.
5. **SupportConversation**: ID, Canal (`whatsapp`, `web`), Telefone, Status (`BOT_ADK`, `EM_ATENDIMENTO_HUMANO`, `FINALIZADO`), Histórico de Mensagens, Ferramentas Executadas.
6. **NotificationLog**: ID, Canal (`whatsapp`, `email`, `sms`), Destinatário, Mensagem, Tipo (`2fa_code`, `order_tracking`, `exchange_update`), Status.

---

## 6. Comandos e Cenários de Teste

### Teste de Skills Básicas:
1. Abra o WhatsApp do Ateliê e envie: `"Olá"` ou `"Menu"`.
   - *Resultado esperado:* O agente envia o menu de opções e informações do ateliê.
2. Envie: `"Qual o horário de funcionamento e onde fica o ateliê?"`.
   - *Resultado esperado:* O agente informa o endereço físico (Rua das Rendeiras, 850) e horário de atendimento.

### Teste de Skills Avançadas:
3. Envie: `"Vocês têm vestido floral tamanho G no estoque?"`.
   - *Resultado esperado:* O agente executa `checkProductStock`, confirma 9 unidades em Azul Sereno e 7 unidades em Rosa Chá, detalha tecido e preço.
4. Envie: `"Quero trocar uma camiseta P por M"`.
   - *Resultado esperado:* O agente executa `checkProductStock`, confirma estoque do tamanho M, gera o protocolo de troca e emite o código de postagem reversa dos Correios (`REV-XXXXXX`).
5. Envie: `"Onde está meu pedido? (VB849201832BR)"` ou `"Meu código de rastreio não funciona"`.
   - *Resultado esperado:* O agente consulta o status nos Correios, traz a linha do tempo de entrega ou diagnostica atrasos.

### Teste de Transbordo Humano:
6. Envie: `"Quero falar com um atendente humano"`.
   - *Resultado esperado:* O agente executa `escalateToHumanSupport`, altera o status para `EM_ATENDIMENTO_HUMANO`, notifica a equipe e transfere a conversa para o Painel do Operador.

### Teste de 2FA e Rastreamento:
7. Clique em **Entrar / 2FA** no topo do site e faça login com `maria.silva@exemplo.com.br` / `vestebem123`.
   - *Resultado esperado:* O sistema gera o código de 6 dígitos e abre a tela de verificação.
8. Realize uma compra pelo Carrinho e finalize no Checkout.
   - *Resultado esperado:* O estoque é baixado em tempo real e o código de rastreio `VB...BR` é disparado automaticamente para o E-mail e WhatsApp do cliente.
