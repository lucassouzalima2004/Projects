# Bora Decor · site

Site de uma página da Bora Decor (Roni & Dan), envelopamento de cozinhas (kitchen wrapping) em Adelaide, Austrália.
Feito para receber o tráfego dos anúncios do Facebook/Instagram e transformar em pedidos de orçamento pelo WhatsApp.
Em inglês, porque os clientes são australianos.

No ar (prévia): <https://boradecor.lucassouzalima10.workers.dev>

É HTML, CSS e JavaScript puros: sem build. As bibliotecas de animação (GSAP + ScrollTrigger e Lenis) ficam
dentro de `assets/vendor/`, sem depender de CDN.

## O que tem no site

- **Topo com vídeo** (cozinha moderna, madeira, leque de cores, mármore), título no centro igual ao anúncio
  ("Give your kitchen a new look"), botão de orçamento e destaques (garantia, preço, sem demolição).
  Ao rolar, o vídeo encolhe com cantos arredondados e a próxima seção sobe por cima.
- **Garantia e preço**, o destaque que o Roni pediu: "10 YEAR WARRANTY" bem grande (letra miúda: 10 anos no filme
  + 2 anos na instalação) e "Most kitchens $3,000 – $6,000", que já filtra quem acha que vai pagar $1.000.
  Comparação com uma cozinha nova ($15,000+).
- **Why wrap, not replace**: frase grande que acende palavra por palavra e tabela "Replace × Wrap with Bora".
- **Antes e depois** com alça para arrastar (as fotos são do panfleto da Bora Decor, marcadas como ilustrativas).
- **Colour studio** (o simulador que o Roni pediu, como o do vellwraps): a pessoa escolhe a cor dos armários
  (em cima e embaixo, ou cada um de uma cor) e da bancada, e o filme é "aplicado" na cozinha com um reflexo
  de luz passando. 21 acabamentos (cores sólidas, madeiras, mármores, concreto), 6 combinações prontas,
  "Surprise me", "Show original" e "Quote this look", que leva a combinação para o formulário.
  Tem um camaleão em cima dos armários que muda de cor junto com eles.
- **Texture. Tone. Character.**: cartões das famílias de acabamento (abrem o simulador já filtrado).
- **O material**: BODAQ® da Hyundai L&C e os 4 benefícios da página antiga (durável, higiênico e não poroso,
  resistente a manchas e riscos, fácil de limpar), com uma faixa de nomes de acabamentos correndo.
- **O que dá para envelopar**, **como funciona** em 4 passos, **depoimento**, **perguntas** e **pedido de orçamento**.
- **Pedido de orçamento**: nome, bairro, o que envelopar, o visual escolhido, orçamento e prazo. O botão abre o
  WhatsApp com a mensagem pronta (a pessoa só anexa as fotos). Também dá para mandar por e-mail.
- O camaleão do logo olha para o cursor e pisca. Barra fixa de "Call / Get my free quote" no celular.
- Quem ativou "reduzir movimento" no celular ou no computador vê tudo sem animação.

## Como editar

| O quê | Onde |
| --- | --- |
| WhatsApp, telefone, e-mail | `assets/js/config.js` (e os mesmos valores no `index.html`, para o Google: procure e troque) |
| Faixa de preço e garantia | `assets/js/config.js` e os textos no `index.html` (procure `3,000` e `10-year`) |
| Meta Pixel (anúncios) | `metaPixelId` em `assets/js/config.js`: com ele, cada pedido de orçamento vira um evento "Lead" |
| Instagram / Facebook | `instagram` e `facebook` em `assets/js/config.js` (vazio esconde) |
| Acabamentos do simulador | `FINISHES` em `assets/js/textures.js` (nome, cor e tipo: solid, wood, marble, concrete, travertine) |
| Combinações prontas | `LOOKS` no começo de `assets/js/studio.js` |
| Fotos de antes e depois | troque `assets/img/before.jpg` e `assets/img/after.jpg` (mesma foto, mesmo enquadramento) |
| Todos os textos | `index.html` |
| Cores e fontes | topo de `assets/css/styles.css` |

As texturas do simulador (madeira, mármore, concreto) são desenhadas pelo navegador; não há fotos de amostras.

## Antes de mostrar para o cliente

Confirme com o Roni:

- [ ] Garantia: 10 anos no filme + 2 anos na instalação (foi o que ele disse no áudio)
- [ ] Faixa de preço $3,000 – $6,000 e a comparação "New kitchen $15,000+"
- [ ] "Days, not weeks" (prazo de instalação)
- [ ] Filme BODAQ® da Hyundai L&C como material principal
- [ ] E-mail: hoje é `sales@borasigns.com.au` (trocar se criarem um da Bora Decor)
- [ ] Endereço da oficina (U10A/113 Welland Ave, Welland SA 5007, tirado da página da Bora Signs)
- [ ] Depoimento do Tom W. (tirado da página antiga) e se tem avaliações do Google para incluir
- [ ] ID do Meta Pixel da conta de anúncios
- [ ] Fotos e vídeos de serviços reais, assim que tiverem (antes/depois e vídeo do topo)

## Vídeo do topo e imagens

O vídeo é montado por `tools/make-hero-video.sh` a partir de 5 clipes gratuitos (Mixkit e Coverr, uso comercial
liberado, sem crédito obrigatório). Para usar vídeos de cozinhas da Bora Decor, coloque os arquivos em
`tools/clips/`, troque a lista `CLIPS` do script e rode `bash tools/make-hero-video.sh` (precisa de ffmpeg).
Ele gera `assets/video/hero-1080.mp4`, `hero-720.mp4`, `hero-tall.mp4` (celular), as versões `.webm` e as
imagens `assets/img/hero-poster*.jpg`.

- `assets/img/logo.svg`, `mark.svg` e `favicon.svg`: vetorizados do logo que o Roni mandou.
- `assets/img/og-image.jpg` (prévia do link no WhatsApp/Facebook): feita a partir de `tools/og.html`
  (abra num navegador com a janela em 1200×630 e tire um print).

## Ver no computador

```bash
cd bora-decor
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

O workflow `.github/workflows/deploy-bora-decor.yml` publica o site no Cloudflare (como Worker, igual aos outros
sites do repositório) a cada push que mexe em `bora-decor/`, sempre no mesmo link:
`https://boradecor.<subdomínio da conta>.workers.dev` (o endereço exato aparece no resumo da execução em Actions).
Usa os secrets que já existem no repositório (`CLOUDFLARE_API_TOKEN` e, opcional, `CLOUDFLARE_ACCOUNT_ID`).

Enquanto estiver no endereço `.workers.dev`, o Google não indexa (`_headers`). Para ligar o domínio
`boradecor.com.au`: Cloudflare → Workers & Pages → boradecor → Settings → Domains & Routes → Add → Custom domain,
e cadastre a variável `BORADECOR_SITE_URL` (`https://www.boradecor.com.au`) em Settings → Secrets and variables →
Actions → Variables, para o canonical, o sitemap e a prévia do link usarem o domínio.

## Estrutura

```
bora-decor/
├── index.html                 a página
├── 404.html                   página de "não encontrado"
├── _headers                   cabeçalhos do Cloudflare (cache, noindex na prévia)
├── assets/css/styles.css      visual (cores e fontes no topo)
├── assets/js/config.js        contatos, preço, garantia, Meta Pixel
├── assets/js/textures.js      acabamentos e texturas do simulador
├── assets/js/studio.js        simulador (cozinha desenhada e animação do filme)
├── assets/js/app.js           rolagem, animações, antes/depois, perguntas, formulário, camaleão
├── assets/vendor/             GSAP + ScrollTrigger (licença padrão gratuita da GSAP) e Lenis (MIT)
├── assets/img/                logo, ícones, antes/depois, imagem de prévia
├── assets/video/              vídeo do topo
└── tools/                     script do vídeo e a página da imagem de prévia (não vão para o ar)
```

Fontes: Archivo expandida (parecida com o "BORA" do logo) e Instrument Serif itálica, do Google Fonts.
