# Bora Decor · site

Site da Bora Decor (Roni & Dan): transformação de superfícies com acabamentos arquitetônicos em Adelaide,
Austrália. Em inglês, porque os clientes são australianos.

No ar: <https://boradecor.com.au> (também em <https://boradecor.lucassouzalima10.workers.dev>).

É HTML, CSS e JavaScript puros, sem build. As bibliotecas de animação (GSAP + ScrollTrigger e Lenis) ficam em
`assets/vendor/`. Um Worker do Cloudflare serve o site e recebe os pedidos de orçamento (`worker/`).

## A estratégia (pedido do Roni)

- **Agora:** Kitchen Wrapping forte (é a porta de entrada dos anúncios) + transformação de superfícies
  ("More than kitchens") + Commercial discreto.
- **Depois:** com projetos próprios, fotos e fornecedores consolidados, a parte comercial cresce. A estrutura já
  está pronta para isso (veja "Quando o comercial crescer").

A marca não fala em "adesivo": a mensagem é **Transform your space without replacing it**. O site não cita marcas de
fornecedores ("premium architectural films from leading Korean manufacturers"), para não virar catálogo nem
parecer concorrente dos fornecedores.

## Página inicial (`index.html`)

1. **Topo com vídeo**: "Give your kitchen *a new look*", igual ao anúncio. Botão "Get a free quote" e destaques
   (garantia de 10 anos, $3k–$6k, sem demolição).
2. **Garantia e preço**: "10 YEAR WARRANTY" (10 anos no filme + 2 na instalação) e "Most kitchens · AUD $3,000–$6,000",
   aproximado e dependendo da cozinha.
3. **Why wrap instead of replacing your kitchen?**: a frase que acende, os 5 argumentos do Roni (cara de cozinha nova,
   muito menos demolição e transtorno, mais rápido, escolher acabamentos e cores, custo muito menor, com a faixa de
   preço) e a tabela "Replace × Wrap with Bora".
4. **Projects · Before & after**: antes/depois de arrastar. Os projetos ficam em `assets/js/projects.js`
   (veja "Projetos"). Hoje há só o ilustrativo do panfleto.
5. **Colour studio**: o simulador da cozinha, agora com Metallic e Textured.
6. **Finishes**: Solid colours, Wood, Stone, Marble, Metallic e Textured finishes (abrem o simulador já filtrado).
7. **The material**: "Premium architectural finishes, *not stickers.*" e os 4 benefícios.
8. **More than kitchens**: "Transform existing surfaces *without replacing them*". Seis blocos (Cabinetry, Walls,
   Counters, Joinery, Furniture, Interior surfaces) mostram o filme sendo aplicado; passando o mouse (ou tocando)
   aparece o "antes". Embaixo, uma linha discreta para a página Commercial.
9. **How it works**, **depoimento**, **perguntas** e **Get a free quote** (formulário).

## Página Commercial (`commercial/index.html`), discreta

Só o que o Roni pediu para mostrar agora: Cabinetry, Walls, Counters, Joinery, Furniture e Interior surfaces, para
lojas, escritórios, estúdios e cafés. Sem hotéis, elevadores, prédios, classificação de fogo ou cara de grande
empreiteira. Tem vídeo próprio (escritório, madeira, restaurante, mármore), "Don't replace it. *Transform it.*",
mostruário de acabamentos, passo a passo, perguntas e o mesmo formulário (com campo "Business").
O link para ela fica discreto: no fim do menu ("Commercial"), em "More than kitchens" e no rodapé.

## Pedidos de orçamento por e-mail

Os formulários das duas páginas pedem **nome, telefone, e-mail, bairro, fotos (até 6) e o que a pessoa quer mudar**.
Ao enviar:

1. o navegador diminui as fotos (1600 px, JPEG) para o envio ser rápido no celular;
2. o Worker (`worker/index.js`) recebe em `/api/quote` e manda um e-mail para **info@boradecor.com.au** com tudo
   organizado e as fotos anexadas. O "Responder" do e-mail vai direto para o cliente.
   Para mandar para outra caixa (ex.: install@boradecor.com.au, ou as duas separadas por vírgula), crie a variável
   `BORADECOR_QUOTE_TO` no GitHub (Settings → Secrets and variables → Actions → aba Variables) e rode o workflow;
3. a pessoa vê "Thanks! Your request is on its way" e o Meta Pixel (se configurado) registra um "Lead".

O e-mail sai pela caixa **info@boradecor.com.au** da Hostinger (SMTP `smtp.hostinger.com`, porta 465).
**Para funcionar, falta só a senha dessa caixa.** Cadastre uma vez, de um destes jeitos:

- **GitHub** (recomendado): Settings → Secrets and variables → Actions → New repository secret →
  nome `BORADECOR_SMTP_PASS`, valor = senha do info@. Depois rode o workflow de novo (Actions →
  Deploy Bora Decor → Run workflow) ou faça qualquer push em `bora-decor/`.
- **Cloudflare**: Workers & Pages → boradecor → Settings → Variables and Secrets → Add → tipo *Secret*,
  nome `SMTP_PASS`, valor = senha do info@.

O resumo da execução no GitHub (Actions) mostra "Formulário de orçamento: pronto" quando está tudo certo.
Se alguém trocar a senha do info@, troque o secret também.

Enquanto a senha não estiver lá (ou se o e-mail falhar), o site não perde o cliente: mostra um aviso e um botão
"Open my email app" com o e-mail já escrito para a pessoa mandar (e anexar as fotos) do próprio celular.

Trocar quem recebe ou a caixa que envia: variáveis `BORADECOR_QUOTE_TO` (pode ter vários e-mails separados por
vírgula) e `BORADECOR_SMTP_USER`, em Settings → Secrets and variables → Actions → Variables.

Proteções: campo escondido contra robôs, validação dos campos, limite de 6 fotos e ~9 MB, e as fotos só passam se
forem base64 puro (ninguém consegue injetar comandos no e-mail pelo formulário).

O WhatsApp saiu do site: na Austrália quase ninguém usa, e o Roni quer todos os pedidos centralizados no e-mail.

## Projetos (antes e depois)

Em `assets/js/projects.js`. Para cada trabalho novo:

1. salve as duas fotos em `assets/img/projects/` (mesmo enquadramento, de 1000 a 1600 px de largura);
2. copie um bloco da lista e troque título, categoria (`Kitchens`, `Laundries`, `Cabinetry`, `Commercial`), bairro,
   acabamento, texto e os nomes das fotos. Tire o `illustrative: true` (só o exemplo do panfleto é ilustrativo).

Com dois ou mais projetos aparece a lista de miniaturas; com mais de uma categoria aparecem os filtros.
Use só fotos de trabalhos da Bora Decor (ou com autorização por escrito do dono das fotos).

## Como editar

| O quê | Onde |
| --- | --- |
| Telefone e e-mail mostrados | `assets/js/config.js` e o texto nas duas páginas (procure e troque) |
| Quem recebe os pedidos | variável `BORADECOR_QUOTE_TO` no GitHub (padrão info@boradecor.com.au) |
| Faixa de preço e garantia | textos no `index.html` (procure `3,000` e `10-year`) |
| Meta Pixel (anúncios) | `metaPixelId` em `assets/js/config.js`: cada pedido enviado vira um evento "Lead" |
| Instagram / Facebook | `instagram` e `facebook` em `assets/js/config.js` (vazio esconde) |
| Projetos | `assets/js/projects.js` |
| Acabamentos do simulador e do mostruário | `FINISHES` em `assets/js/textures.js` (tipos: solid, wood, marble, concrete, travertine, metal, linen, ribbed) |
| Combinações prontas do simulador | `LOOKS` no começo de `assets/js/studio.js` |
| Blocos de More than kitchens | `data-old` (antes) e `data-new` (depois) de cada bloco no `index.html` |
| Campos do formulário | no `<form>` de cada página: cada campo com `data-label` entra no e-mail, na ordem da página |
| Cores e fontes | topo de `assets/css/styles.css` |

As duas páginas repetem o cabeçalho, o rodapé e o bloco de ícones/logo do topo do `<body>`: ao mudar algo ali,
mude nas duas.

## Quando o comercial crescer (fase 2)

- Acrescente seções na `commercial/index.html` (setores, projetos comerciais etc.) e projetos com
  `category: 'Commercial'`.
- O seletor **Residential | Commercial** com a pílula dourada que desliza já está pronto no CSS e no JS (`.seg`).
  Para ligar, coloque no cabeçalho das duas páginas, logo depois do logo:

  ```html
  <nav class="seg" aria-label="Residential or commercial">
    <a class="seg__item is-active" href="./" aria-current="page"><span>Residential</span></a>
    <a class="seg__item" href="commercial/"><span>Commercial</span></a>
    <span class="seg__pill" aria-hidden="true"></span>
  </nav>
  ```

  (na página Commercial, troque os `href` para `../` e `./` e mova o `is-active` e o `aria-current`).

## Antes de mostrar para o cliente

- [ ] Cadastrar a senha do info@boradecor.com.au (`BORADECOR_SMTP_PASS`) e mandar um pedido de teste com fotos
- [x] ID do Meta Pixel da conta de anúncios (1070067669184384)
- [ ] Fotos de trabalhos reais para `assets/js/projects.js` (cozinhas, laundries, cabinetry)
- [ ] Garantia: 10 anos no filme + 2 anos na instalação
- [ ] Faixa de preço AUD $3,000–$6,000 e a comparação "$15,000+" de uma cozinha nova
- [ ] "Days, not weeks" (prazo de instalação)
- [ ] Endereço da oficina (U10A/113 Welland Ave, Welland SA 5007) e o depoimento do Tom W. (da página antiga)

## Vídeos do topo e imagens

Os vídeos são montados por `tools/make-hero-video.sh` a partir de clipes gratuitos (Mixkit e Coverr, uso comercial
liberado, sem crédito obrigatório; os links estão no começo do script). Precisa de ffmpeg.

- `bash tools/make-hero-video.sh` → página inicial: `assets/video/hero-*` e `assets/img/hero-poster*.jpg`.
- `bash tools/make-hero-video.sh commercial` → Commercial: `assets/video/commercial-*` e `assets/img/commercial-poster*.jpg`.

Para usar vídeos da Bora Decor, coloque os arquivos em `tools/clips/` e troque a lista `CLIPS_HOME` ou
`CLIPS_COMMERCIAL` do script.

- `assets/img/logo.svg`, `mark.svg` e `favicon.svg`: vetorizados do logo que o Roni mandou.
- `assets/img/og-image.jpg` e `og-commercial.jpg` (prévia do link no Facebook/Instagram/WhatsApp): feitas a partir
  de `tools/og.html` e `tools/og.html?commercial` (abra num navegador com a janela em 1200×630 e tire um print).

## Ver no computador

Só as páginas (o formulário cai no plano B, porque não há o Worker):

```bash
cd bora-decor
python3 -m http.server 8000
# abra http://localhost:8000
```

Com o Worker (formulário de verdade): `npx wrangler dev` com um `wrangler.jsonc` igual ao que o workflow gera e um
arquivo `.dev.vars` com `SMTP_PASS=...`.

## Publicar

O workflow `.github/workflows/deploy-bora-decor.yml` publica a cada push que mexe em `bora-decor/` (no `main` ou no
branch `claude/amazing-goodall-z4s27u`). Ele gera o `wrangler.jsonc` com o Worker, os arquivos do site e as variáveis
do e-mail, cadastra a senha (`BORADECOR_SMTP_PASS`) e confere o site e o formulário no ar.

O domínio boradecor.com.au foi ligado no painel do Cloudflare (Workers & Pages → boradecor → Domains & Routes) e
**não** aparece no `wrangler.jsonc` de propósito: assim o deploy não mexe nos domínios. O canonical, o sitemap e a
prévia do link usam `https://boradecor.com.au` (variável `BORADECOR_SITE_URL` para trocar).

## Estrutura

```
bora-decor/
├── index.html                 página inicial (cozinhas + More than kitchens)
├── commercial/index.html      página Commercial (discreta)
├── 404.html                   página de "não encontrado"
├── _headers                   cabeçalhos do Cloudflare (cache, noindex no .workers.dev)
├── worker/index.js            Worker: serve o site e manda os pedidos de orçamento por e-mail
├── worker/smtp.js             envio de e-mail (SMTP) a partir do Worker
├── assets/css/styles.css      visual (cores e fontes no topo)
├── assets/js/config.js        telefone, e-mail, Meta Pixel, redes
├── assets/js/projects.js      projetos (antes e depois)
├── assets/js/textures.js      acabamentos e texturas (simulador, mostruário, More than kitchens)
├── assets/js/studio.js        simulador (cozinha desenhada e animação do filme)
├── assets/js/app.js           rolagem, animações, projetos, perguntas, formulário com fotos, camaleão
├── assets/vendor/             GSAP + ScrollTrigger (licença padrão gratuita da GSAP) e Lenis (MIT)
├── assets/img/                logo, ícones, projetos, imagens de prévia
├── assets/video/              vídeos do topo (hero-* e commercial-*)
└── tools/                     script dos vídeos e a página das imagens de prévia (não vão para o ar)
```

Fontes: Archivo expandida (parecida com o "BORA" do logo) e Instrument Serif itálica, do Google Fonts.
