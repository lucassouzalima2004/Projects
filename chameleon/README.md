# Chameleon · site

Site novo da **Chameleon** ([@chameleonn.ie](https://www.instagram.com/chameleonn.ie/)), empresa de comunicação visual do
**Jean Schorn** na Irlanda: letreiros iluminados, neon de LED, fachadas, envelopamento de veículos e impressão em grande formato.
O site é em inglês, porque o público é irlandês. É HTML, CSS e JavaScript puros: sem build. A única biblioteca é o
[Lenis](https://github.com/darkroomengineering/lenis) (rolagem suave, licença MIT), guardado dentro do projeto em `assets/js/vendor/`.
Dá para abrir o `index.html` direto no navegador.

## O pedido

Pela conversa no WhatsApp (08 a 16/10):

- O Jean quer um site há tempos e pediu uma referência da Irlanda. O pagamento é feito depois que ele
  aprovar a primeira prévia.
- O Lucas pediu Instagram, logo, fotos do trabalho e serviços. Ele mandou **71 fotos** (15/10) e o link do site de um
  parceiro como referência: a **Genesis Signs & Print** (<https://genesissignsandprint.co.uk>, Londres), "mais ou menos isso".
  Depois veio o Instagram **@chameleonn.ie**.
- Pedido do Lucas para este site: **hero centralizada com vídeo, animações bem feitas, algo bom e fluido**.

A estrutura segue a da Genesis (chamada com dois botões, serviços, trabalhos em destaque, como trabalhamos, contato), com uma
identidade própria.

## A ideia

**Camaleão = muda de cor.** Cada letreiro tem a cor da marca do cliente, e o site faz o mesmo: o brilho do neon (`--glow`)
muda de cor sozinho, acompanhando a foto que está passando no vídeo do topo (azul no "good vibes only", verde no MASQ, vermelho no
Piece of Velvet…), a seção em que a pessoa está, o serviço ou o cartão sob o mouse e o filtro da galeria. O título do topo é
um neon de verdade: *MAKE YOUR BRAND* e, embaixo, *impossible to miss* escrito como tubo de neon, que acende piscando.

## O que tem no site

1. **Topo com vídeo**: um showreel de 16 s montado com as fotos dos letreiros iluminados do Jean (zoom lento e fusão), uma versão
   deitada para o computador e outra em pé para o celular. Título centralizado, botões *Get a free quote* e *See our work*, a
   legenda **Now showing** (nome e tipo de cada letreiro que aparece no vídeo) e o botão de pausar.
2. **Marcas passando**: Tooleys, MASQ, Erlis Group, Evri, Ryde, FedEx… A velocidade acompanha a rolagem e inverte quando a pessoa sobe.
3. **Manifesto** ("Why Chameleon"): as palavras acendem conforme a rolagem, com fotos pequenas no meio do texto; embaixo, 3 diferenciais.
4. **Serviços** (6): iluminados, neon de LED, fachadas, envelopamento, paredes e interiores, grande formato. No computador, a foto
   segue o mouse e a linha acende na cor do serviço; no celular, a foto aparece em cada serviço.
5. **Trabalhos em destaque** (8 projetos): no computador, a página "anda de lado" enquanto a pessoa rola, com a cor mudando a cada
   cartão; no celular, os cartões passam com o dedo. No fim, o cartão *your sign could be next*.
6. **Flip the switch**: um interruptor que liga e desliga o neon "good vibes only" (ele acende sozinho quando a seção aparece).
7. **Folha clara** com os **veículos** (duas faixas de fotos andando em sentidos opostos com a rolagem) e **como funciona** (4 passos,
   com a barra de progresso).
8. **Galeria** com as **48 melhores fotos** e filtros (Illuminated, LED neon, Shopfronts, Vehicles, Interiors, Large format, Workshop).
   Clicar abre a foto grande, com setas, teclado e arrastar no celular.
9. **Orçamento**: o formulário (nome, empresa, o que precisa, onde, mensagem) abre o **WhatsApp** do Jean com a mensagem pronta.
10. **Rodapé** com o nome gigante que acende onde o mouse passa. No logo, o "o" é um **olho de camaleão** que segue o mouse
    (no celular, cada olho olha para um lado de vez em quando).

**Também:** botão flutuante do WhatsApp, página 404 ("This sign is switched off"), prévia bonita do link no WhatsApp
(`assets/img/og-image.jpg`), dados estruturados para o Google, `sitemap.xml` e `robots.txt` gerados na publicação.
Quem ativou "reduzir movimento" no aparelho vê a página parada (sem vídeo, sem rolagem suave); com o modo economia de dados, o
vídeo não carrega e fica a imagem de capa.

**Testes (16/10):** Lighthouse no computador 95 em desempenho e no celular 88, acessibilidade 96, boas práticas 100 e SEO 100
(o que tira os pontos de acessibilidade são as palavras ainda apagadas do manifesto antes de rolar, de propósito). Zero problemas
no teste de acessibilidade (axe), no computador e no celular. Formulário, filtros, foto grande, menu do celular e interruptor
testados no Chromium.

Identidade: preto **#09090B**, osso **#F2EEE6**, papel **#EBE6DC** e a cor do neon, que muda. Fontes, dentro de `assets/fonts/`:
**Big Shoulders Display** nos títulos (nasceu da sinalização de Chicago), **Sacramento** no neon (traço contínuo, como o tubo),
**Instrument Sans** nos textos e **Geist Mono** nas etiquetas. Todas com licença livre (OFL).

## Antes de mostrar ao Jean: o que precisa confirmar

- [ ] **Nome e logo**: o site usa **Chameleon** (do Instagram @chameleonn.ie) com um logo provisório desenhado por nós. Não deu
  para abrir o perfil (o Instagram pede login). Confirmar a grafia (Chameleon ou Chameleonn) e **pedir o logo** em boa resolução.
- [ ] **Cidade**: hoje o site diz "Based in Ireland, installing nationwide". Perguntar a cidade/região onde ele atende.
- [ ] **E-mail** e **telefone fixo**: o site só tem o WhatsApp **+353 89 240 7428** (o número da conversa). Se ele tiver e-mail, dá para pôr no contato.
- [ ] **Marcas citadas** na faixa "Signed, lit & wrapped for" e nos projetos (Tooleys, MASQ, Erlis Group, Evri, Ryde, FedEx, Shift,
  Partido, Peckham Levels, Get Fixed, Salt & Batter, China White, Grab & Go, Delivery Mates, Ecoglow): todas aparecem nas fotos
  que ele mandou. Confirmar que ele pode mostrar esses trabalhos (alguns parecem ter sido feitos em Londres, talvez junto com o parceiro).
- [ ] **Textos**: os diferenciais ("Tested before it leaves"), o passo a passo (visita, prova antes de produzir, alterações grátis
  até aprovar, instalação em altura) e "free, no-obligation quote" foram escritos por nós. Pedir para ele ler e corrigir.
- [ ] **Legendas das fotos**: escritas a partir do que aparece em cada foto. Conferir os nomes dos clientes.
- [ ] **Horário de atendimento**, **Facebook/TikTok/Google**: se ele tiver, dá para pôr no rodapé.
- [ ] **Domínio**: quando ele tiver (ex.: `chameleonn.ie`), ligar ao site e cadastrar a variável `CHAMELEON_SITE_URL` (veja Publicar).

## Como editar

O conteúdo fica direto no `index.html` (é o que o Google lê). Cada seção tem um comentário em português com o número dela.

| O quê | Onde |
| --- | --- |
| Título, botões e texto do topo | `index.html`, seção 1 |
| Legendas do vídeo ("Now showing") e cor de cada foto | `index.html`, seção 1: `data-reel-wide` (computador) e `data-reel-tall` (celular), na mesma ordem das listas do `tools/make-hero-video.sh` |
| Marcas que passam | `index.html`, seção 2 |
| Serviços (texto, etiquetas, foto, cor) | `index.html`, seção 4: cada `<li class="svc">` (`data-color` e `data-img`) |
| Trabalhos em destaque | `index.html`, seção 5: cada `<li class="card">` (`data-color` é a cor do neon naquele cartão) |
| Fotos da galeria e legendas | `index.html`, seção 8: cada `<li class="g-item">` (`data-cat` é o filtro). Ao mudar a quantidade, atualize os números nos botões de filtro |
| WhatsApp | Busque e troque `353892407428` no `index.html` e no topo do `assets/js/app.js` (`WHATSAPP`) |
| Instagram | Busque `chameleonn.ie` no `index.html` |
| Cores das seções | atributo `data-glow` de cada seção; as cores do orçamento ficam em `CYCLE`, no topo do `assets/js/app.js` |
| Cores e fontes gerais | Topo do `assets/css/styles.css` |

**Trocou uma foto, o vídeo, o CSS ou o JS mantendo o mesmo nome?** Aumente o número do `?v=1` no endereço dele no `index.html`:
o navegador guarda esses arquivos por uma semana e, sem isso, quem já visitou continua vendo a versão antiga.

## Fotos e vídeo

As fotos ficam em `assets/img/work/`, em WebP, em dois tamanhos (800 e 1600 px no lado maior), sem os dados de localização das
fotos originais. Para gerar de novo (ou trocar/acrescentar fotos), edite a lista no script e rode, apontando para a pasta da
conversa exportada do WhatsApp:

```bash
bash tools/make-images.sh ~/Downloads/WhatsApp-Jean     # precisa de ImageMagick e ffmpeg
```

O vídeo do topo é montado a partir dessas fotos, com zoom lento e fusão entre elas (8 fotos em cada versão, 2,6 s cada):

```bash
bash tools/make-hero-video.sh                           # precisa de ffmpeg
```

Saem `assets/video/hero-wide.mp4/.webm` (1920x1080, computador), `hero-tall.mp4/.webm` (720x1280, celular) e as imagens de
capa `hero-wide.jpg` e `hero-tall.jpg`. O MP4 toca em tudo (inclusive iPhone); o WebM é menor e serve o Chrome e o Firefox.
Se o Jean mandar vídeos de verdade dos letreiros acendendo, dá para trocar o showreel: é só pedir.

## Ver no computador

```bash
cd chameleon
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

O workflow `.github/workflows/deploy-chameleon.yml` publica o site no Cloudflare (Worker com arquivos estáticos, como os outros
sites do repositório) a cada push que mexe em `chameleon/`, no `main` ou no branch `claude/cool-hamilton-59m36x`. O endereço fica
`https://chameleonn.<subdomínio>.workers.dev` e aparece no resumo da execução, em **Actions**.

Usa os mesmos secrets dos outros sites (`CLOUDFLARE_API_TOKEN` e, opcional, `CLOUDFLARE_ACCOUNT_ID`). Enquanto o site estiver só
no `.workers.dev`, ele não aparece no Google (`_headers` manda `noindex`). Quando o domínio do Jean estiver ligado
(Cloudflare → Workers & Pages → chameleonn → Domains), cadastre a variável `CHAMELEON_SITE_URL` (Settings → Secrets and variables
→ Actions → Variables) com o endereço final, para o canonical, o sitemap e a prévia do link usarem o domínio.

## Estrutura

```
chameleon/
├── index.html                 a página (conteúdo e textos)
├── 404.html                   página de "não encontrado"
├── _headers                   cache e noindex no Cloudflare (não vai para o ar como página)
├── assets/css/styles.css      visual e animações (cores e fontes no topo)
├── assets/js/app.js           comportamento (vídeo, cor camaleão, rolagem, galeria, orçamento)
├── assets/js/vendor/lenis.min.js  rolagem suave (MIT)
├── assets/fonts/              as 4 fontes
├── assets/img/                fotos (work/), favicon, ícone do iPhone e prévia do link
├── assets/video/              vídeo do topo e capas
└── tools/                     scripts das fotos e do vídeo (não vão para o ar)
```
