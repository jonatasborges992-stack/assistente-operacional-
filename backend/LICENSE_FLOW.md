# Fluxo de licença e assinatura

## Regra de acesso
1. O usuário autentica.
2. O servidor identifica a empresa vinculada ao usuário.
3. O servidor consulta a licença da empresa.
4. `trial` ou `active` dentro da validade libera o aplicativo.
5. `expired`, `blocked` ou `canceled` bloqueia o acesso.

## Ativação manual
O proprietário pode criar/alterar uma licença e definir uma data de expiração. Essa exceção fica marcada em `manual_override`.

## Assinatura
1. Cliente inicia a assinatura.
2. Gateway confirma pagamento no servidor por webhook.
3. O webhook valida a assinatura do evento.
4. A assinatura é atualizada.
5. A licença passa para `active` e recebe o período pago.
6. Renovação confirmada estende o período automaticamente.
7. Falha/cancelamento não deve ser decidido pelo navegador; o servidor atualiza o estado conforme eventos confirmados do provedor.

## Segurança
- Nenhuma chave secreta no `index.html`.
- Nenhum status de licença confiado ao cliente.
- Webhooks idempotentes por identificador do evento.
- Dados separados por `company_id`.
- Futuro RLS deve impedir uma empresa de consultar dados de outra.
