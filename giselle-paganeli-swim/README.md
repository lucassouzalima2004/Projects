# Giselle Paganeli Swim — tema Shopify "Eden"

E-commerce da coleção **The Garden of Eden 2027**, feito a partir do briefing da cliente (rebranding + site).
É um tema Shopify Online Store 2.0 completo, mais uma prévia navegável que renderiza **o mesmo tema** com produtos de exemplo, para mostrar à cliente antes de a loja existir.

| Pasta | O que é |
| --- | --- |
| [`theme/`](theme/) | O tema Shopify (Liquid, seções, templates JSON, 3 idiomas). É isto que vai para a loja. |
| [`preview/`](preview/) | Gera a prévia estática do tema com 12 produtos de exemplo (carrinho, filtros e busca funcionam). |
| [`shopify/products-import.csv`](shopify/products-import.csv) | Os 12 produtos iniciais para importar na Shopify (como rascunho, estoque 0). |

## O conceito

**Terceira prévia**, com os dois vídeos da Giselle (26/10) comparando a prévia com o site da August. Ela pediu: a imagem grande desde a entrada, trocando sozinha; logo abaixo, as categorias para comprar na hora; uma foto conceitual com "born in Milan, made in Brasil"; janela de boas-vindas com desconto; faixa de frete grátis; menu e rodapé simples como os da August; e a página da história mais enxuta. A segunda prévia (21/10) já tinha trazido o preto e branco, a fonte da August, as formas quadradas, o logo dela e o slogan dividido sobre a foto.

- **Home, de cima para baixo**: slideshow em tela cheia (o cabeçalho fica por cima, com texto branco, como na August) → frase da marca (*Italian elegance, Brazilian sensuality* até ela mandar a dela) → **4 categorias** em imagens grandes (Bikinis, Swimsuits, Resortwear, New in — a quarta pode virar Sale) → **foto conceitual** em preto e branco com BORN IN MILAN à esquerda e MADE IN BRAZIL à direita → **faixa "Free shipping over €200"** → rodapé.
- **Slideshow**: cada imagem tem o texto dividido nas laterais (BORN IN MILAN · MADE IN BRAZIL), título e botão opcionais, e a imagem inteira leva para a coleção. Troca sozinha a cada 6 s com transição suave (a imagem não se mexe), pausa quando a pessoa aponta o mouse, tem pontos para escolher a imagem, botão de pausa e deslizar no celular. Quem pede menos movimento no sistema vê a primeira imagem parada.
- **Janela de boas-vindas**: abre 5 s depois da primeira página, uma vez por visitante (volta depois de 30 dias). A pessoa deixa o e-mail (entra como cliente com aceite de marketing, tags `newsletter, welcome`) e vê o código de desconto na hora, com botão para copiar. Nunca aparece na sacola nem nas páginas de conta.
- **Menu do topo** (como pediu: "e mais nada"): **Collections** (The Garden of Eden 2027, New in, All pieces) · **Swimwear** (Bikinis, Swimsuits) · **Resortwear** (Shirts, Shorts) · **Bestsellers** · **Sale**, com listas pequenas que abrem embaixo de cada item. No celular, o mesmo menu e, menores, The Story, Client care e Contact.
- **Sale**: página própria com imagem no topo e as peças com desconto embaixo (preço antigo riscado e selo "Sale").
- **Rodapé simples e claro**: newsletter numa linha, logo, Shop, Explore, Minha conta (minha conta, meus pedidos, rastrear pedido) e Contato (telefones, WhatsApp e e-mail das configurações, sem endereço).
- **The Story**: saiu "Between the lake and the sea"; ficam a abertura, a história da fundadora (onde vai o texto dela), a citação e "What we believe".
- **Logo**: a assinatura "Giselle Paganeli" foi vetorizada a partir do logo enviado (SVG em `snippets/brand-sprite.liquid`) e usa a cor do texto: preta no fundo branco, branca sobre foto ou no rodapé escuro. No cabeçalho vai assinatura + SWIM; no rodapé e na página de pré-lançamento, o logo completo (assinatura, traço, SWIM e slogan), mais a assinatura grande e clara no fim da página. Se um dia ela mandar o arquivo original, dá para subir em *Configurações do tema → Logo*.
- **Preto e branco**: fundo branco, texto preto, cinzas claros para painéis e fundos de imagem; botões pretos retangulares que invertem no hover. A cor fica nas fotos. Tudo editável em *Configurações do tema → Cores*.
- **Tipografia**: **Lato**, a mesma do menu do site da August (o corpo do site deles usa Montserrat), com licença SIL Open Font, servida pelo próprio tema. Títulos, menu e nomes de produto em caixa alta com espaçamento largo.
- **Geométrico**: cantos retos em tudo (botões, tamanhos P/M/G, cores, selos, pontos do "shop the look", sacola, cursor "Drag"), o trevo virou um **símbolo quadrado** e as imagens podem ser retrato, quadradas ou paisagem.
- **Centralizado**: logo e menu centralizados, títulos e cards de produto centralizados, menu mobile em tela cheia.
- **Fluido**: rolagem suave com inércia no computador (Lenis, licença MIT; no celular fica a rolagem nativa), títulos que sobem palavra por palavra, parallax leve nas imagens editoriais, fotos que surgem suavemente ao carregar, troca de página em que a foto do produto "voa" do card para a página do produto (e o cabeçalho fica parado), painéis laterais com curva de mola, sanfonas animadas também no Safari/iPhone e galeria com arraste com inércia e cursor "Drag". Cada efeito liga/desliga em *Configurações do tema → Layout & motion*, e quem pede menos movimento no sistema vê tudo estático.
- **Imagens provisórias**: a Giselle vai fotografar a campanha no fim do mês. Até lá, no tema, as seções editoriais usam recortes de *The Garden of Eden* (Thomas Cole, 1828 — domínio público, a referência da coleção). Na prévia, produtos, slideshow, categorias, foto conceitual, faixas e janela de boas-vindas aparecem com **fotos reais de exemplo do Pexels** (licença de uso livre; créditos em [`preview/media/photos/CREDITS.md`](preview/media/photos/CREDITS.md)). Elas mostram peças de outras marcas: servem só para a prévia e não vão para a loja.

## Páginas (as 6 abas do briefing + apoio)

| Aba | Modelo | Conteúdo |
| --- | --- | --- |
| Home | `index` | Slideshow em tela cheia com slogan dividido, frase da marca, 4 categorias, foto conceitual Born in Milan · Made in Brazil, faixa de frete grátis (+ janela de boas-vindas) |
| Shop | `collection` | Categorias, filtros (tamanho, cor, categoria, disponibilidade, preço), ordenação, grade 2/4 colunas, bloco editorial no meio da grade, compra rápida por tamanho |
| The Garden of Eden | `page.garden` | Conceito, quadro de Thomas Cole, "shop the look" com pontos clicáveis na imagem, galeria, coleção completa |
| The Story | `page.story` | Abertura, história da fundadora, citação, valores |
| Atendimento | `page.help` | Atalhos (tamanhos, cuidados, entregas e trocas, contato) + perguntas frequentes com busca |
| Contato | `page.contact` | Formulário com assunto; para boutiques, resorts e spas aparecem os campos de empresa |
| Sale | `collection.sale` | Imagem no topo e as peças com desconto embaixo |
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

No GitHub, o workflow **Giselle Paganeli Swim (tema + prévia)** roda o Theme Check, anexa o tema em `.zip` (aba *Artifacts* da execução) e publica a prévia no Cloudflare como Worker (como a Punto Pizza, por causa do limite de projetos do Pages), usando o mesmo `CLOUDFLARE_API_TOKEN`: `https://giselle-paganeli-swim.<subdomínio da conta>.workers.dev` — o link exato sai no resumo da execução. A prévia tem `noindex` e um aviso discreto de que produtos e preços são de exemplo.

## Colocar na Shopify

1. **Subir o tema**: baixe o `.zip` do artifact `tema-shopify-eden` e use *Loja virtual → Temas → Adicionar tema → Fazer upload do arquivo zip*. Ou, com a Shopify CLI: `shopify theme push --path giselle-paganeli-swim/theme --unpublished`.
2. **Produtos**: *Produtos → Importar* com `shopify/products-import.csv`. Entram como rascunho, sem estoque. Trocar preços, textos e fotos (até 5 por produto: frente, costas, detalhe, look, complementar) e definir estoque antes de publicar. Para a foto mudar ao trocar de cor, associe cada imagem à variante da cor.
3. **Coleções** (automáticas): `bikinis` (tipo = Bikini), `swimsuits` (tipo = Swimsuit), `resortwear` (tipo = Resortwear), `swimwear` (tipo = Bikini **ou** Swimsuit), `new-in` (tag = new), `sale` (preço comparativo maior que 0, com o modelo **collection.sale**), `bestsellers` (todas as peças, ordenadas por mais vendidas) e `shirts` / `shorts` (título contém Shirt / Shorts; `skirts` quando houver saias). As categorias da home e da loja já procuram esses identificadores; também dá para escolher outra coleção no editor. A ordem da Sale é a da coleção: em ordem manual dá para pôr os maiores descontos primeiro.
4. **Páginas** (*Loja virtual → Páginas*), com o modelo indicado:
   `the-garden-of-eden` → page.garden · `the-story` → page.story · `help` → page.help · `contact` → page.contact · `size-guide`, `care`, `shipping-returns` → page.support · `privacy`, `terms`, `cookies` → page.
   A tabela de medidas vai no conteúdo da página `size-guide` (ela aparece no painel lateral do produto). Um modelo de tabela está em `preview/data/catalog.mjs`.
5. **Menus** (*Loja virtual → Navegação*): `main-menu` (Collections › The Garden of Eden 2027, New in, All pieces · Swimwear › Bikinis, Swimsuits · Resortwear › Shirts, Shorts · Bestsellers · Sale), `more` (links menores do menu do celular: The Story, Client care, Contact), `footer` (Shop: Collections, New in, Swimwear, Resortwear, Sale), `explore` (The Story, The Garden of Eden, Client care, Privacy policy, Terms of sale), `customer-care`, `legal` e `search-suggestions`.
6. **Metacampos de produto** (*Configurações → Dados personalizados → Produtos*), todos texto: `custom.fit` (modelagem), `custom.model_info` (altura e tamanho da modelo), `custom.composition`, `custom.lining` (forro e bojo), `custom.care`, `custom.origin` (padrão: Made in Brazil). Linhas vazias simplesmente não aparecem — nada de composição inventada.
7. **Filtros**: no app *Search & Discovery* (gratuito, da Shopify) ative Disponibilidade, Tipo de produto, Cor, Tamanho e Preço.
8. **Idiomas e moedas**: o tema já traz os textos da interface em inglês, italiano e português. Ative os idiomas e mercados em *Configurações → Mercados* e traduza o conteúdo com o app *Translate & Adapt*. O seletor de país/idioma aparece sozinho quando há mais de um.
9. **Configurações do tema**: logo (já vem a assinatura vetorizada; dá para trocar por arquivo), slogan, telefones, e-mail de atendimento, WhatsApp, Instagram, frete grátis a partir de (200, para a sacola mostrar quanto falta), botões de pagamento expresso.
   - **Frete grátis acima de €200**: a faixa da home é só texto; o frete grátis de verdade é uma taxa de envio grátis com pedido mínimo de €200 em *Configurações → Frete e entrega*.
   - **Código da janela de boas-vindas** (padrão `WELCOME10`, editável no rodapé do editor): criar o mesmo código em *Descontos*, limitado a um uso por cliente. Como em quase todas as janelas desse tipo, o código fica no código da página.
10. **Pré-lançamento**: para mostrar a campanha sem vender, ative *Configurações do tema → Pre-launch* (o produto mostra lista de espera no lugar de "Add to bag") ou a página com senha em *Preferências* (data da contagem regressiva na seção "Pre-launch" do modelo password). Os e-mails entram como clientes com as tags `prelaunch` / `newsletter`.
11. **Antes de publicar** (checklist do briefing): compra de teste, e-mails de confirmação, banner de cookies da Shopify (*Configurações → Privacidade do cliente*), textos legais e revisão no celular e no desktop.

## O que ainda é provisório

- Nomes, preços, descrições e grade dos 12 produtos (10 de praia + camisa e short de resortwear), seguindo as quantidades do briefing.
- Fotos de produto e de campanha (Pexels, só na prévia) e recortes do quadro no tema, até chegarem as fotos da Giselle.
- Tabela de medidas (indicativa) e textos de entregas/trocas/legais.
- Logo: assinatura vetorizada a partir da imagem enviada no WhatsApp. Fica muito fiel, mas o arquivo original (SVG, AI ou PDF) é o ideal para a versão final.

## Para alinhar com a Giselle

- Slogan: no logo está **"Born in Italy, made in Brazil"**, mas na mensagem e no briefing é **"Born in Milan, made in Brasil"**. A prévia usa *Born in Milan / Made in Brazil* (em inglês, como o site); é só trocar o texto se ela preferir a outra versão.
- Arquivo original do logo (SVG, AI ou PDF), se existir.
- Mix final, venda de biquíni em conjunto (é como está) ou top e calcinha separados.
- Mercado inicial, país de expedição, idiomas e moedas contratados, meios de pagamento e frete.
- Fotos da campanha (ela fotografa no fim do mês) e se quer um símbolo/monograma GP no lugar do quadrado.
- Data de lançamento e se começa com página de pré-lançamento.
- A frase dela para o lugar de *Italian elegance, Brazilian sensuality* (ela disse que vai mandar) e o texto da história para a página The Story.
- A quarta categoria da home: **New in** (como está) ou **Sale**.
- O valor do desconto de boas-vindas (a prévia mostra 10% e o código WELCOME10 como exemplo) e os telefones do rodapé.
- Se o frete grátis fica mesmo acima de €200 e para quais países.

Opcionais citados no briefing que **não** estão incluídos: lista de desejos, aviso de reposição, recuperação de carrinho (é nativa da Shopify, só ativar), "Create Your Eden" (mix & match) e área de lojistas.
