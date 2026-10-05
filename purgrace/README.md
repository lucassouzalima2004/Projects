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

1. No admin do Shopify: **Online Store › Themes › Add theme › Upload zip file** e escolha `dist/purgrace-theme.zip`.
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

Pela linha de comando, com o [Shopify CLI](https://shopify.dev/docs/api/shopify-cli): `shopify theme push --path purgrace/theme --store <loja>.myshopify.com --unpublished`. A integração do Shopify com o GitHub não serve aqui, porque ela exige o tema na raiz do repositório.

## SEO dos produtos

`seo/` tem tudo o que o guia manda importar:

| Arquivo | Para quê |
| --- | --- |
| `PurGrace-SEO.xlsx` | Revisão: título novo, tipo, categoria, tags, textos para o Google, coleções que faltam, problemas e anéis |
| `shopify-import-0-teste-2-produtos.csv` | Teste com 2 produtos antes da importação completa |
| `shopify-import-1-titulos-tipos-seo.csv` | Títulos, tipos, categoria, tags, SKU e textos para o Google dos 162 produtos |
| `shopify-import-2-descricoes.csv` | Só as 25 descrições com "waterproof", "Medical grade", "24k, 18k & 22k" ou "Romanel" |
| `build_seo.py` | Gera os quatro arquivos a partir do catálogo em `dev/fixtures/` |

As importações usam **Products › Import** com *Overwrite products with matching handles*. Os arquivos mantêm as colunas `Option1 name`/`Option1 value` iguais às de hoje, para o Shopify não recriar as variantes (tamanhos dos anéis). Faça antes o backup em **Products › Export**.

Para gerar de novo depois de mudar algo (precisa de `pip install openpyxl`):

```sh
python3 purgrace/seo/build_seo.py
```

O catálogo em `dev/fixtures/purgrace-store.json` foi baixado da loja pública em 5/10/2026. Se os produtos mudarem, baixe de novo antes de gerar os arquivos.

## Prévia local e testes

```sh
cd purgrace/dev
npm install
npm run preview   # http://localhost:9292, com os produtos e coleções reais
npm run check     # Theme Check: hoje 0 problemas
npm run smoke     # 19 interações (carrinho, tamanhos, busca, filtros, menu, idioma); precisa do Chromium
npm run shots     # capturas de tela de computador e celular em dev/shots/
npm run zip       # gera dist/purgrace-theme.zip
```

A prévia imita o Shopify só o bastante para ver o tema: carrinho, filtros e busca funcionam em memória, e o checkout não existe. O teste e as capturas procuram o Chromium em `/opt/pw-browsers`; em outro computador, aponte a variável `CHROMIUM` para o executável do Chrome.
