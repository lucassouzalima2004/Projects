# PurGrace · tema Shopify e SEO

Tema novo e passo a passo de SEO para a [PurGrace](https://www.purgrace.com.au), loja de joias Rommanel em Perth (Austrália). A loja já roda no Shopify; aqui fica o tema que substitui o Dawn e os arquivos para arrumar os 162 produtos.

| Pasta | O que é |
| --- | --- |
| [`theme/`](theme/) | Tema "Grace" (Online Store 2.0), em inglês e português do Brasil |
| [`dist/purgrace-theme.zip`](dist/purgrace-theme.zip) | O mesmo tema, pronto para subir no Shopify |
| [`seo/`](seo/) | Planilha de revisão, arquivos de importação dos produtos e o script que gera tudo |
| [`dev/`](dev/) | Prévia local com o catálogo real da loja, Theme Check e teste de interação |

O passo a passo de SEO para a Priscila está no doc **PurGrace · Passo a passo de SEO no Shopify** ([link](https://claude.ai/code/artifact/804abfd6-ebd8-4ab2-b75b-de207aea7a7b)). O link é privado até ser compartilhado pelo botão Share do doc.

## Instalar o tema

1. No admin do Shopify, em **Online Store**, na seção **Draft themes**: **Import theme › Upload zip file** e escolha `dist/purgrace-theme.zip`. O tema entra como rascunho, e a loja no ar não muda.
2. Clique em **Customize** e revise. O tema já vem montado com as fotos da loja (em Content › Files) e as coleções `earrings`, `necklace`, `pendant`, `ring`, `bracelet`, `set`, `best-sellers`, `faith` e `solid-925-silver`.
3. Crie as páginas que o tema prevê e escolha o template de cada uma em **Online Store › Pages**:

   | Página | Template |
   | --- | --- |
   | About (já existe: `discover-purgrace`) | `page.about` |
   | Contact (já existe: `contact`) | `page.contact` |
   | Size guide | `page.size-guide` |
   | Jewellery care | `page.care` |
   | FAQ | `page.faq` |

4. Coloque Size guide, Jewellery care e FAQ no menu do rodapé em **Content › Menus**.
5. Em **Settings › Customer accounts**, use as contas de cliente novas: o tema não traz os templates das contas antigas (legacy), que o Shopify descontinuou.
6. Em **Customize › Theme settings**, confira Contact (número do WhatsApp), Cart (frete grátis acima de $149) e Returns (Google), que precisa bater com a política de reembolso.
7. **Publish**. Mantenha o tema antigo na biblioteca como cópia.

Para mostrar o tema antes de publicar, abra a pré-visualização dele (**Preview**) e clique no ícone de link. Há dois tipos de link ([Shopify Help](https://help.shopify.com/en/manual/online-store/themes/adding-themes)):

- **Visitante**: abre sem login, em `https://<código>.shopifypreview.com`, e vale 2 dias.
- **Lojista**: exige login no admin da loja, permite testar o checkout e vale 30 dias.

Pela linha de comando, com o [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) e uma senha do app **Theme Access** da loja nas variáveis `SHOPIFY_CLI_THEME_TOKEN` e `SHOPIFY_FLAG_STORE=ehzhmc-zv.myshopify.com`:

```sh
npx @shopify/cli@latest theme push --path purgrace/theme --unpublished --theme "Grace"
```

O comando sobe o tema como rascunho e mostra o link de pré-visualização. A integração do Shopify com o GitHub não serve aqui, porque ela exige o tema na raiz do repositório.

## Prévia online (Cloudflare Pages)

Para mostrar o tema sem mexer na loja, o workflow [`deploy-purgrace-preview.yml`](../.github/workflows/deploy-purgrace-preview.yml) publica uma cópia em **https://purgrace-preview.pages.dev** a cada push em `purgrace/`. A cópia tem os produtos e coleções reais. Carrinho, filtros, busca, tamanhos e o botão EN/PT funcionam no navegador de quem visita, por um *service worker* que roda o mesmo `dev/core.mjs` da prévia local. O checkout não existe, nada é enviado a lugar nenhum, e todas as páginas têm `noindex`, para não concorrer com purgrace.com.au no Google.

O workflow precisa de dois secrets do Cloudflare no GitHub (**Settings › Secrets and variables › Actions › New repository secret**):

| Secret | Onde pegar |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare › My Profile › API Tokens › Create Token › Custom token, permissão **Account · Cloudflare Pages · Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare › Workers & Pages: o *Account ID* fica na coluna da direita |

Depois de salvar os dois, rode **Actions › Deploy PurGrace preview › Run workflow**. O endereço aparece no resumo da execução.

Sem os secrets, dá para publicar à mão: `cd purgrace/dev && npm run export` gera `purgrace/dist/site/`, que pode ser arrastada em **Cloudflare › Workers & Pages › Create › Pages › Upload assets**.

## SEO dos produtos

`seo/` tem tudo o que o guia manda importar:

| Arquivo | Para quê |
| --- | --- |
| `PurGrace-SEO.xlsx` | Revisão: título novo, tipo, categoria, tags, os textos para o Google de hoje ao lado da sugestão, coleções, problemas e anéis |
| `shopify-import-0-teste-2-produtos.csv` | A importação 1 só para 2 produtos, para testar antes |
| `shopify-import-1-titulos-tipos-tags.csv` | Título, tipo, categoria, tags, SKU e MPN (código Rommanel) dos 162 produtos. Não tem as colunas de SEO, então os 115 títulos e 111 descrições para o Google que a loja já tem não mudam |
| `shopify-import-2-descricoes.csv` | Só as 25 descrições com "waterproof", "Medical grade", "24k, 18k & 22k" ou "Romanel" |
| `shopify-import-3-seo-onde-falta.csv` | Título e descrição para o Google só dos 46 produtos que não têm nenhum dos dois hoje |
| `shopify-import-desfazer.csv` | Volta título, tipo, tags, descrição, SKU e MPN dos 162 para como estavam em 5/10/2026 |
| `live-seo.json` | Os títulos e descrições para o Google que a loja mostrava em 5/10/2026 (lidos por `dev/fetch-live-seo.mjs`) |
| `build_seo.py` | Gera a planilha e os CSV a partir do catálogo em `dev/fixtures/` e de `live-seo.json` |

As importações usam **Produtos › Importar** com *Sobrescrever produtos com identificadores correspondentes* (Overwrite products with matching handles), na ordem 0, 1, 2 e 3, e antes de qualquer mudança feita à mão nos produtos. Os arquivos mantêm as colunas `Option1 name`/`Option1 value` iguais às de hoje, para o Shopify não recriar as variantes (tamanhos dos anéis). Faça antes o backup em **Produtos › Exportar** (chega por e-mail); para voltar atrás, use `shopify-import-desfazer.csv`, não o backup inteiro.

Para gerar de novo depois de mudar algo (precisa de `pip install openpyxl`):

```sh
python3 purgrace/seo/build_seo.py
```

O catálogo em `dev/fixtures/purgrace-store.json` foi baixado da loja pública em 5/10/2026. Se os produtos mudarem, baixe de novo e rode `node dev/fetch-live-seo.mjs` antes de gerar os arquivos, senão a importação pode apagar um texto escrito depois disso.

## Prévia local e testes

```sh
cd purgrace/dev
npm install
npm run preview   # http://localhost:9292, com os produtos e coleções reais
npm run check     # Theme Check: hoje 0 problemas
npm run smoke     # 19 interações (carrinho, tamanhos, busca, filtros, menu, idioma); precisa do Chromium
npm run shots     # capturas de tela de computador e celular em dev/shots/
npm run zip       # gera dist/purgrace-theme.zip
npm run export    # gera a prévia online em dist/site/
npm run serve:site                      # serve dist/site como o Cloudflare, em http://localhost:9393
PREVIEW=http://localhost:9393 SW=1 node smoke.mjs shots   # o mesmo teste, na cópia online
```

A prévia imita o Shopify só o bastante para ver o tema: carrinho, filtros e busca funcionam em memória, e o checkout não existe. A loja simulada fica em `dev/core.mjs`, que não usa nada do Node: `server.mjs` a serve localmente e `sw-entry.mjs` a roda no navegador na prévia online. O teste e as capturas procuram o Chromium em `/opt/pw-browsers`; em outro computador, aponte a variável `CHROMIUM` para o executável do Chrome.
