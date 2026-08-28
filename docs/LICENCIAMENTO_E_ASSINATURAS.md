# Assistente Operacional — Licenciamento e Assinaturas

## Objetivo

Transformar o Assistente Operacional em um produto multiempresa com acesso controlado por licença, teste gratuito e assinatura.

## Regras do produto

- Cliente pode ser `em_teste`, `ativo`, `vencido`, `bloqueado` ou `inativo`.
- O administrador pode ativar manualmente um cliente.
- O administrador pode conceder teste por qualquer quantidade de dias.
- O administrador pode prorrogar ou bloquear um cliente a qualquer momento.
- Pagamento confirmado deve ativar ou renovar a assinatura automaticamente.
- Falha/expiração de pagamento deve impedir novo acesso quando a licença expirar.
- O cliente nunca deve conseguir alterar seu próprio status, plano ou vencimento pelo navegador.

## Segurança

O navegador é apenas a interface. A decisão de autorização deve ser feita no backend/banco.

Nunca colocar no `index.html`:

- segredo de gateway;
- chave privada;
- credencial de banco;
- regra confiável de autorização baseada somente em localStorage.

O backend deve validar a sessão e a licença antes de liberar dados protegidos.

## Fluxo de assinatura

`Cliente escolhe plano -> gateway cria cobrança -> cliente paga -> gateway envia webhook assinado -> backend valida evento -> assinatura atualizada -> licença ativa -> acesso liberado.`

## Fluxo de teste/manual

`Admin seleciona cliente -> escolhe teste ou ativação -> define duração/data -> backend grava licença -> cliente recebe acesso.`

## Estados

- `trial`: teste válido até `expires_at`.
- `active`: assinatura ou acesso manual válido.
- `past_due`: pagamento pendente; manter acesso somente conforme política configurada.
- `expired`: prazo terminou sem renovação válida.
- `blocked`: bloqueio manual do administrador; tem prioridade sobre os demais estados.
- `inactive`: cliente sem acesso.

## Dados mínimos

### tenants

- `id`
- `name`
- `document`
- `status`
- `created_at`

### users

- `id`
- `tenant_id`
- `name`
- `email`
- `role`
- `created_at`

### plans

- `id`
- `name`
- `price_cents`
- `interval`
- `active`

### subscriptions

- `id`
- `tenant_id`
- `plan_id`
- `provider`
- `provider_subscription_id`
- `status`
- `current_period_start`
- `current_period_end`
- `created_at`
- `updated_at`

### licenses

- `id`
- `tenant_id`
- `status`
- `source` (`trial`, `manual`, `subscription`)
- `starts_at`
- `expires_at`
- `created_by`
- `created_at`
- `updated_at`

### payment_events

- `id`
- `provider`
- `provider_event_id`
- `event_type`
- `payload_hash`
- `processed_at`
- `created_at`

`provider_event_id` deve ser único para impedir processamento duplicado de webhook.

## Regra de autorização

Uma sessão só pode acessar dados de um `tenant_id` autorizado. O status efetivo deve considerar bloqueio manual e validade da licença.

Prioridade:

1. `blocked` -> negar acesso.
2. licença válida (`trial`, `active` ou política equivalente) -> permitir.
3. licença expirada -> negar.

## Painel do proprietário

O administrador terá ações simples:

- Ativar cliente
- Dar teste
- Definir dias
- Definir vencimento
- Prorrogar
- Bloquear
- Desbloquear
- Alterar plano
- Ver status
- Ver histórico de assinatura

## Pagamento automático

A integração de pagamento será feita somente quando houver backend e gateway definidos. O frontend nunca receberá credenciais secretas do gateway.

A confirmação deve ser idempotente: o mesmo evento recebido duas vezes não pode gerar duas renovações.

## Próxima implementação

1. Criar backend/banco multiempresa.
2. Criar autenticação.
3. Implementar isolamento por `tenant_id`.
4. Integrar licença ao login e às rotas protegidas.
5. Integrar gateway de assinatura/webhook.
6. Criar painel administrativo real.
7. Testar cenários: teste, ativação manual, pagamento, renovação, vencimento, bloqueio e desbloqueio.

## Critério de pronto

Nenhum cliente consegue acessar dados de outro cliente e nenhum cliente consegue transformar seu próprio acesso em `active` alterando dados no navegador. O administrador consegue liberar manualmente e o pagamento confirmado consegue renovar automaticamente.