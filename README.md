# Projects

Central dos sites. **Cada site novo ganha um repositório próprio**: numa sessão do Claude aberta neste repositório,
peça um site novo (ou use `/novo-site`). O Claude cria o repositório, monta o site e deixa a publicação no Cloudflare pronta.

## Sites

| Site | Repositório | Endereço |
| --- | --- | --- |
| Bossa Nail Studio: manicure brasileira na Austrália, bilíngue (PT/EN), pedido pelo WhatsApp e "monte sua unha" | [`nail-studio/`](nail-studio/) (neste repositório) | <https://bossa-nail-studio.pages.dev> |

## Como funciona

- `.claude/skills/novo-site/`: o passo a passo que o Claude segue para cada site novo.
- `templates/site-repo/`: o modelo de cada repositório novo (workflow do Cloudflare, README e CLAUDE.md).
- Em cada repositório novo, cadastre uma vez os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`
  em **Settings → Secrets and variables → Actions** (os mesmos valores para todos os sites).
- Para o Claude conseguir enviar código para os repositórios novos, o app do Claude no GitHub precisa ter acesso a eles.
  Se ele estiver liberado só para repositórios escolhidos, inclua cada repositório novo em
  <https://github.com/settings/installations> → Claude → Configure → Repository access, ou marque **All repositories**.
