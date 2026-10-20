# Giselle Paganeli Swim — tema Shopify "Eden"

E-commerce da coleção **The Garden of Eden 2027**, feito a partir do briefing da cliente (rebranding + site).
É um tema Shopify Online Store 2.0 completo, mais uma prévia navegável que renderiza **o mesmo tema** com produtos de exemplo, para mostrar à cliente antes de a loja existir.

| Pasta | O que é |
| --- | --- |
| [`theme/`](theme/) | O tema Shopify (Liquid, seções, templates JSON, 3 idiomas). É isto que vai para a loja. |
| [`preview/`](preview/) | Gera a prévia estática do tema com 12 produtos de exemplo (carrinho, filtros e busca funcionam). |
| [`shopify/products-import.csv`](shopify/products-import.csv) | Os 12 produtos iniciais para importar na Shopify (como rascunho, estoque 0). |

## O conceito

- **Enter the Garden**: na home, a imagem de campanha fica dentro de um **arco** (arquitetura italiana, Lago di Como) que se abre até a tela cheia conforme a pessoa rola, revelando o claim *embrace your oasis*. O arco volta como assinatura visual em todo o site (imagens editoriais, menu, sacola vazia, página de pré-lançamento).
- **Centralizado**: logo e menu centralizados, títulos e cards de produto centralizados, menu mobile em tela cheia com links grandes.
- **Fluido**: tipografia e espaçamentos que escalam com a tela, transições entre páginas, seções que aparecem ao rolar, carrinho lateral sem recarregar a página. Quem prefere menos movimento (configuração do sistema) vê tudo estático.
- **Paleta do briefing**: pérola, off-white, areia, café (texto), preto, terracota (destaque) e dourado envelhecido nos detalhes. Verde e azul da água só na ambientação. Tudo editável em *Configurações do tema → Cores*.
- **Tipografia**: Cormorant Garamond (títulos) + Jost (texto), ambas com licença SIL Open Font, servidas pelo próprio tema.
- **Imagens provisórias**: enquanto não há fotos, o tema usa recortes de *The Garden of Eden* (Thomas Cole, 1828 — domínio público, a referência da coleção). Na prévia, os produtos aparecem como desenhos técnicos em cada cor.

## Páginas (as 6 abas do briefing + apoio)

| Aba | Modelo | Conteúdo |
| --- | --- | --- |
| Home | `index` | Campanha com arco, frase da marca, introdução da coleção, seleção de produtos com abas (Bikinis / Swimsuits / Resortwear), história resumida (Milão ↔ Brasil), lookbook arrastável, newsletter |
| Shop | `collection` | Categorias, filtros (tamanho, cor, categoria, disponibilidade, preço), ordenação, grade 2/4 colunas, bloco editorial no meio da grade, compra rápida por tamanho |
| The Garden of Eden | `page.garden` | Conceito, quadro de Thomas Cole, "shop the look" com pontos clicáveis na imagem, galeria, coleção completa |
| The Story | `page.story` | Fundadora, citação, Born in Milan · Made in Brazil, valores |
| Atendimento | `page.help` | Atalhos (tamanhos, cuidados, entregas e trocas, contato) + perguntas frequentes com busca |
| Contato | `page.contact` | Formulário com assunto; para boutiques, resorts e spas aparecem os campos de empresa |
| Apoio | `page.support` / `page` | Guia de tamanhos, cuidados, entregas e trocas, privacidade, termos, cookies |

Também: página de produto (galeria, cor e tamanho, guia de medidas em painel lateral, zoom, botão fixo no celular, "complete the look"), sacola lateral e página de carrinho, busca com resultados enquanto digita, 404, **pré-lançamento** (página com senha + contagem regressiva + captação de e-mails), contas de cliente, vale-presente e Journal (blog, pronto mas fora do menu, como pede o briefing).

## Ver a prévia

```bash
cd giselle-paganeli-swim/preview
npm install
npm run dev        # gera em preview/dist e abre em http://localhost:4173
npm run check      # Theme Check, o linter oficial da Shopify (hoje: 0 problemas)
npm run csv        # regenera shopify/products-import.csv a partir de preview/data/catalog.mjs
```

No GitHub, o workflow **Giselle Paganeli Swim (tema + prévia)** roda o Theme Check, anexa o tema em `.zip` (aba *Artifacts* da execução) e, se os secrets do Cloudflare já estiverem configurados (os mesmos da manicure), publica a prévia em `https://giselle-paganeli-swim.pages.dev`. A prévia tem `noindex` e um aviso discreto de que produtos e preços são de exemplo.

## Colocar na Shopify

1. **Subir o tema**: baixe o `.zip` do artifact `tema-shopify-eden` e use *Loja virtual → Temas → Adicionar tema → Fazer upload do arquivo zip*. Ou, com a Shopify CLI: `shopify theme push --path giselle-paganeli-swim/theme --unpublished`.
2. **Produtos**: *Produtos → Importar* com `shopify/products-import.csv`. Entram como rascunho, sem estoque. Trocar preços, textos e fotos (até 5 por produto: frente, costas, detalhe, look, complementar) e definir estoque antes de publicar. Para a foto mudar ao trocar de cor, associe cada imagem à variante da cor.
3. **Coleções** (automáticas, por tipo de produto): `bikinis` (tipo = Bikini), `swimsuits` (tipo = Swimsuit), `resortwear` (tipo = Resortwear). As abas da home e as categorias da loja já procuram esses identificadores; também dá para escolher a coleção no editor.
4. **Páginas** (*Loja virtual → Páginas*), com o modelo indicado:
   `the-garden-of-eden` → page.garden · `the-story` → page.story · `help` → page.help · `contact` → page.contact · `size-guide`, `care`, `shipping-returns` → page.support · `privacy`, `terms`, `cookies` → page.
   A tabela de medidas vai no conteúdo da página `size-guide` (ela aparece no painel lateral do produto). Um modelo de tabela está em `preview/data/catalog.mjs`.
5. **Menus** (*Loja virtual → Navegação*): `main-menu` (Shop com Bikinis/Swimsuits/Resortwear, The Garden of Eden, The Story, Client care, Contact), `footer`, `customer-care`, `legal` e `search-suggestions`.
6. **Metacampos de produto** (*Configurações → Dados personalizados → Produtos*), todos texto: `custom.fit` (modelagem), `custom.model_info` (altura e tamanho da modelo), `custom.composition`, `custom.lining` (forro e bojo), `custom.care`, `custom.origin` (padrão: Made in Brazil). Linhas vazias simplesmente não aparecem — nada de composição inventada.
7. **Filtros**: no app *Search & Discovery* (gratuito, da Shopify) ative Disponibilidade, Tipo de produto, Cor, Tamanho e Preço.
8. **Idiomas e moedas**: o tema já traz os textos da interface em inglês, italiano e português. Ative os idiomas e mercados em *Configurações → Mercados* e traduza o conteúdo com o app *Translate & Adapt*. O seletor de país/idioma aparece sozinho quando há mais de um.
9. **Configurações do tema**: logo (ou o texto GISELLE PAGANELI / SWIM), e-mail de atendimento, WhatsApp, Instagram, frete grátis a partir de (opcional), botões de pagamento expresso.
10. **Pré-lançamento**: para mostrar a campanha sem vender, ative *Configurações do tema → Pre-launch* (o produto mostra lista de espera no lugar de "Add to bag") ou a página com senha em *Preferências* (data da contagem regressiva na seção "Pre-launch" do modelo password). Os e-mails entram como clientes com as tags `prelaunch` / `newsletter`.
11. **Antes de publicar** (checklist do briefing): compra de teste, e-mails de confirmação, banner de cookies da Shopify (*Configurações → Privacidade do cliente*), textos legais e revisão no celular e no desktop.

## O que ainda é provisório

- Nomes, preços, descrições e grade dos 12 produtos (10 de praia + camisa e short de resortwear), seguindo as quantidades do briefing.
- Desenhos dos produtos e recortes do quadro no lugar das fotos.
- Tabela de medidas (indicativa) e textos de entregas/trocas/legais.
- Logo: o tema usa o nome em texto até chegar o arquivo final.

## Para alinhar com a Giselle

- O link "Fonte: AUGUST": é o site da August como referência ou a tipografia? A fonte do tema troca em um arquivo (`assets/base.css` + `snippets/theme-styles.liquid`), desde que a licença permita uso na web.
- Mix final, venda de biquíni em conjunto (é como está) ou top e calcinha separados.
- Mercado inicial, país de expedição, idiomas e moedas contratados, meios de pagamento e frete.
- Fotos, logo e símbolo definitivos (trevo/monograma GP).
- Data de lançamento e se começa com página de pré-lançamento.

Opcionais citados no briefing que **não** estão incluídos: lista de desejos, aviso de reposição, recuperação de carrinho (é nativa da Shopify, só ativar), "Create Your Eden" (mix & match) e área de lojistas.
