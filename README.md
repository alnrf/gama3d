# Tabela de Filamentos 3D

Landing page em Next.js que exibe filamentos em abas por tipo (PLA, PETG, ABS…), com cor, amostra visual e preço. Os dados vêm de uma planilha.

## Rodando local

```bash
npm install
npm run dev
```

## Formato da planilha

| tipo | cor | hex | preco | peso | disponivel |
|------|-----|-----|-------|------|------------|
| PLA | Preto | #1a1a1a | 89,90 | 1kg | sim |

- **tipo** vira uma aba (na ordem em que aparece).
- **hex** é opcional (cor da bolinha). Sem ele, fica cinza.
- **preco** aceita `89,90`, `89.90` ou `R$ 89,90`.
- **disponivel**: `sim`/`não`. Vazio = disponível. `não` mostra a cor como "Esgotado".
- Separador `;` ou `,` — detectado automaticamente.

## Opção 1 — CSV no repositório

Edite `data/filamentos.csv` (abre no Excel/LibreOffice), faça commit e a Vercel faz o redeploy.

## Opção 2 — Google Sheets (sem redeploy)

1. Crie a planilha com as colunas acima.
2. **Arquivo → Compartilhar → Publicar na Web** → escolha a aba → formato **CSV** → Publicar.
3. Copie a URL e, na Vercel, adicione a variável de ambiente `SHEET_CSV_URL` com ela.
4. Redeploy uma vez. Depois disso, as alterações na planilha aparecem no site em até ~5 minutos.

## Pedido pelo WhatsApp

O cliente marca os filamentos (pode misturar abas), ajusta a quantidade com − / + e clica em **Enviar pedido**. Abre o WhatsApp com a mensagem pronta:

```
Olá! Gostaria de fazer um pedido:

• 2x PLA Preto (1kg): R$ 179,80
• 1x PETG Laranja (1kg): R$ 104,90

*Total: R$ 284,70*
```

Configure o número que recebe os pedidos na variável `WHATSAPP_NUMBER` (DDI + DDD + número, só dígitos, ex.: `5541999999999`). Localmente, copie `.env.example` para `.env.local`. Na Vercel, adicione em Settings → Environment Variables e faça um redeploy.

Itens marcados como esgotados não podem ser selecionados.

## Deploy na Vercel

Importe o repositório em vercel.com/new — nenhuma configuração extra necessária.

## Rodando em Docker (servidor próprio)

```bash
cp .env.example .env        # preencha WHATSAPP_NUMBER
docker compose up -d --build
```

O site fica em `http://<ip-do-servidor>:3010`.

- `data/` é montada como volume: edite `data/filamentos.csv` no servidor e o site atualiza em até ~5 min, sem rebuild.
- Mudou `WHATSAPP_NUMBER` ou o código? Rode `docker compose up -d --build` de novo.
- Logs: `docker compose logs -f`
