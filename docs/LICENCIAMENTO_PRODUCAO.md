# Licenciamento — Assistente Operacional

## Objetivo
Controle seguro de acesso por empresa, com teste gratuito, ativação manual e assinatura recorrente.

## Estados
- `trial`: período de teste com data de expiração.
- `active`: assinatura válida ou liberação manual válida.
- `past_due`: pagamento pendente; não renovar a validade automaticamente.
- `expired`: licença vencida.
- `blocked`: acesso bloqueado manualmente.

## Regra de acesso
A decisão de acesso deve ser feita no backend, nunca confiando em `localStorage`, parâmetros de URL ou JavaScript enviado ao cliente.

Uma sessão autenticada deve estar vinculada a uma `company_id`. Toda consulta e mutação de dados operacionais deve filtrar por essa empresa no backend/RLS.

## Assinatura
Campos mínimos recomendados:
- `company_id`
- `plan_id`
- `status`
- `current_period_start`
- `current_period_end`
- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `cancel_at_period_end`
- `created_at`
- `updated_at`

## Pagamento automático
Fluxo esperado:

`Checkout → Gateway → Webhook assinado → Backend → subscription → license → acesso`

O webhook deve ser idempotente: o mesmo evento recebido duas vezes não pode duplicar renovação nem alterar incorretamente o vencimento.

Nunca guardar segredo de gateway, chave privada ou token administrativo no frontend.

## Liberação manual
O proprietário pode definir:
- ativo;
- teste;
- bloqueado;
- data de expiração;
- período sem cobrança.

A liberação manual deve ser registrada com autor, data, motivo e validade.

## Próxima implementação
1. Banco multiempresa.
2. Autenticação.
3. RLS/isolamento por empresa.
4. Serviço de licença no backend.
5. Webhook de assinatura.
6. Tela de login/bloqueio/renovação.
7. Testes de segurança e expiração.
