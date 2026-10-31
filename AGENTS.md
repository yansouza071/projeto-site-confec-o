# Documentação do Agente de Atendimento Inteligente (Google ADK) - Confecção VesteBem

Este documento descreve a arquitetura, ferramentas (*EnvironmentToolset*), catálogo de *Skills*, fluxos de tomada de decisão e políticas de transbordo para suporte humano do Agente de Inteligência Artificial integrado ao WhatsApp e à loja virtual da **Confecção VesteBem**.

---

## 1. Arquitetura do Agente Google ADK

O agente foi projetado utilizando o **Google Agent Development Kit (ADK)** e o SDK moderno `@google/genai` (modelo de base recomendado: `gemini-3.8-flash`), integrando chamadas nativas de ferramentas (*Function Calling*), contexto persistente e orquestração de transbordo.

### 1.1. Camadas da Solução
1. **Camada de Canal (Interface & Mensageria):**
   - WhatsApp Business API (simulador web fiel com preview de mensagens, criptografia e status de entrega).
   - Chat Web flutuante disponível em todas as páginas da loja virtual.
2. **Camada de Orquestração (`AdkAgent`):**
   - Injeta *System Instructions* ricas com as regras de negócio, dados institucionais, políticas de alfaiataria e primeira troca grátis.
   - Analisa mensagens do usuário via modelo Gemini ou motor determinístico de alta fidelidade para execução de ações.
3. **Camada de Ferramentas (`EnvironmentToolset`):**
   - Expõe funções seguras do backend ao modelo por meio de `FunctionDeclaration`.
   - Comunica-se exclusivamente com a camada de Repositórios (*Repository Pattern*), isolando o modelo do acesso direto ao banco de dados.
4. **Camada de Transbordo Humano (`EM_ATENDIMENTO_HUMANO`):**
   - Monitora gatilhos de insatisfação, pedidos explícitos de atendimento humano ou dúvidas complexas de alfaiataria sob encomenda.
   - Transfere o controle da conversa para a fila de operadores humanos, notificando a equipe interna.

---

## 2. Ferramentas do Agente (`EnvironmentToolset`)

O `EnvironmentToolset` expõe 5 ferramentas principais para o modelo de IA:

### 2.1. `checkProductStock`
- **Finalidade:** Consulta em tempo real o estoque de peças de confecção, roupas, tamanhos (PP, P, M, G, GG, 36 a 44) e variações de cor.
- **Parâmetros:**
  - `query` (string, obrigatório): Nome ou categoria da peça (ex: `"vestido floral"`, `"camiseta basica"`, `"blazer linho"`).
  - `size` (string, opcional): Tamanho desejado (ex: `"G"`).
  - `color` (string, opcional): Tonalidade ou padronagem.
- **Retorno:** Quantidade disponível, cores em estoque, preço e composição têxtil.

### 2.2. `getOrderStatus`
- **Finalidade:** Consulta o status do pedido, transportadora responsável e linha do tempo de entrega.
- **Parâmetros:**
  - `orderIdOrTrackingCode` (string, opcional): Código do pedido (ex: `"ORD-7821"`) ou código de rastreamento dos Correios/transportadora (ex: `"VB849201832BR"`).
  - `customerPhoneOrEmail` (string, opcional): Telefone ou e-mail cadastrado.
- **Retorno:** Status atual, eventos de movimentação com data/local e itens do pacote.

### 2.3. `requestExchangeOrReturn`
- **Finalidade:** Abre protocolo oficial de troca ou devolução (ex: troca de tamanho de camiseta de P para M), gerando código de autorização de postagem reversa.
- **Parâmetros:**
  - `orderId` (string, opcional): Código do pedido original.
  - `itemDescription` (string, obrigatório): Peça a ser trocada.
  - `reason` (string, obrigatório): Motivo da solicitação.
  - `preferredAction` (string): `"troca_tamanho"`, `"troca_defeito"` ou `"devolucao_estorno"`.
  - `targetSize` (string, opcional): Novo tamanho desejado (ex: `"M"`).
- **Retorno:** Código de protocolo de troca, código dos Correios para logística reversa sem custo e reserva de estoque da nova peça.

### 2.4. `sendCustomerNotification`
- **Finalidade:** Dispara notificações e recados automáticos via WhatsApp ou E-mail.
- **Parâmetros:**
  - `channel` (string): `"whatsapp"` ou `"email"`.
  - `recipient` (string): Telefone ou e-mail.
  - `message` (string): Texto da notificação.
  - `notificationType` (string): `"order_tracking"`, `"stock_alert"`, `"exchange_update"`.

### 2.5. `escalateToHumanSupport`
- **Finalidade:** Transfere imediatamente a conversa para a equipe interna de suporte humano.
- **Parâmetros:**
  - `conversationId` (string): ID da sessão de atendimento.
  - `customerName` (string): Nome do cliente.
  - `reason` (string, obrigatório): Motivo do transbordo.
  - `priority` (string): Prioridade do chamado (`baixa`, `media`, `alta`).
  - `recentSummary` (string): Resumo do histórico para leitura rápida do atendente.

---

## 3. Catálogo de Skills (Palavras-Chave e Intenções)

### 3.1. Skills Básicas
| Intenção | Gatilhos / Palavras-chave | Comportamento do Agente |
|---|---|---|
| **Saudações & Menu** | "Olá", "Oi", "Menu", "Boa tarde", "Ajuda" | Apresenta o ateliê, horário de atendimento e lista numerada de opções disponíveis. |
| **Horários & Endereço** | "Horário", "Onde fica", "Endereço", "Loja física" | Informa o endereço (Rua das Rendeiras, 850 - Polo Têxtil, SP) e horários de funcionamento. |
| **Formas de Pagamento** | "Pagamento", "Cartão", "PIX", "Parcelamento", "Boleto" | Esclarece parcelamento em até 10x sem juros, desconto de 5% no PIX e tokenização de cartões. |
| **Status Simples de Pedido** | "Onde está meu pedido?", "Rastrear pedido", "Status" | Solicita ou pesquisa o código do pedido/rastreio e exibe a localização atual da encomenda. |

### 3.2. Skills Avançadas
| Intenção | Exemplo de Frase do Cliente | Execução de Ferramentas | Resultado Entregue ao Cliente |
|---|---|---|---|
| **Troca de Tamanho** | *"Quero trocar uma camiseta P por M"* | `checkProductStock` + `requestExchangeOrReturn` + `sendCustomerNotification` | Confirma disponibilidade do tamanho M no ateliê, emite o protocolo de troca e gera o código de postagem reversa dos Correios (`REV-XXXXXX`) com 1ª troca grátis. |
| **Consulta Específica de Estoque** | *"Vocês têm vestido floral tamanho G no estoque?"* | `checkProductStock(query: "vestido floral", size: "G")` | Confirma estoque do Vestido Midi Floral Primavera em tamanho G (9 un em Azul Sereno e 7 un em Rosa Chá), informa composição (96% Viscose, 4% elastano) e valor. |
| **Diagnóstico de Código de Rastreio** | *"Meu código de rastreio não funciona"* | `getOrderStatus(orderIdOrTrackingCode: "...")` | Consulta a base dos Correios/Loggi, valida a data de postagem, esclarece prazos de sincronização de dados e oferece transbordo caso o erro persista. |

---

## 4. Política e Fluxo de Transbordo Humano (`EM_ATENDIMENTO_HUMANO`)

O transbordo ocorre automaticamente quando:
1. O cliente solicita expressamente falar com uma pessoa (`"quero falar com atendente"`, `"humano"`, `"pessoa"`, `"falar com alguém"`).
2. O cliente expressa frustração ou insatisfação (`"insatisfeito"`, `"péssimo"`, `"reclamação"`).
3. O modelo identifica solicitações de alta complexidade fora do escopo padrão (ex: alfaiataria teatral, vestidos de noiva sob medida exclusiva).

### Fluxo de Execução do Transbordo:
```
[Mensagem do Cliente]
         │
         ▼
[AdkAgent avalia gatilho de transbordo]
         │
         ├─► [Executa EnvironmentToolset.escalateToHumanSupport]
         │         ├─ Altera status para 'EM_ATENDIMENTO_HUMANO'
         │         ├─ Registra ticket na fila do Painel do Operador
         │         └─ Dispara notificação interna no canal da equipe
         │
         └─► [Responde ao Cliente com Protocolo e Tempo de Espera Estimado]
```
No Painel do Operador (`HumanSupportDashboard`), a equipe interna do ateliê visualiza o histórico completo prévio da conversa com o bot e continua o diálogo no mesmo canal do cliente em tempo real.
