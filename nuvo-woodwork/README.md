# NUVO Woodwork · site

Novo site da NUVO Woodwork (marcenaria de alto padrão em South Florida: cozinhas, closets, salas de TV, bares,
escritórios e millwork), para substituir o WordPress atual (<https://nuvowoodwork.com>). Pedido do Guilherme:
uma casa top, e conforme a pessoa rola a página passa pelos ambientes vendo cada um ser montado, terminando
nos produtos da Nuvo.

É HTML, CSS e JavaScript puros: sem build, sem dependências. Dá para abrir o `index.html` direto no navegador.
O site é em inglês (o público é americano).

## O que tem no site

- **O filme da casa** (topo, preso na tela durante o scroll), no formato do site de referência que o Guilherme mandou:
  um voo de drone contínuo, da porta fechada até a casa inteira acesa, passando pela sala, cozinha e closet, que se
  montam na frente da câmera. São 4 vídeos de 10 s encadeados (o último quadro de um é o primeiro do próximo).
  - No computador a rolagem da página inteira é suave (Lenis): cada giro da roda ou gesto do trackpad vira um
    deslizamento que freia aos poucos, e o filme, os títulos e as seções deslizam juntos. No celular fica a
    rolagem do próprio aparelho. Para deslizar mais ou menos, mude `LERP` no `assets/js/scroll.js`.
  - O vídeo anda com o scroll e com um pouco de inércia, para deslizar em vez de pular. O navegador decodifica os
    quadros um pouco adiante do scroll e o filme é desenhado num canvas, fundindo dois quadros vizinhos: o movimento
    é contínuo mesmo rolando bem devagar, e a imagem para nítida num quadro inteiro quando o scroll para.
  - As partes com mais movimento ganham mais scroll e as partes paradas passam depressa, então o vídeo nunca fica
    parado enquanto a pessoa rola.
  - O filme começa a ser usado enquanto o vídeo ainda baixa. Em navegador sem decodificador (WebCodecs), ou em
    aparelho que não aguenta o canvas, o site usa sozinho o `<video>` normal.
  - Títulos grandes à esquerda (no celular, embaixo) que sobem e somem presos ao scroll, e no fim o convite para a
    consultoria 3D grátis, com botões de agendar e ligar.
  - Enquanto um vídeo carrega (ou se não carregar), o trecho mostra o primeiro e o último quadro dele, que se
    fundem com o scroll.
- **Índice de ambientes** com fotos de projetos reais. No computador, a foto acompanha o cursor; no celular, aparece
  ao lado. Cada linha volta o filme até aquele ambiente (escritório e lavanderia, que ficaram fora do voo, levam ao
  formulário).
- **O estúdio**: a história do Eduardo (italiano, nascido no Brasil, marceneiro há mais de 30 anos, na Flórida desde
  2015), três fotos de residências e os números.
- **Processo** em 6 passos (como cotas de desenho técnico) e as marcas de ferragem/máquinas.
- **Depoimentos** do Google (copiados do widget do site atual).
- **Contato** com formulário (cidade e ambientes), telefone, e-mail, endereço da oficina e horário.
- Prévia bonita do link no WhatsApp (`og-image.jpg`), favicon e ícone do iPhone com o monograma, dados estruturados
  para o Google, e respeito ao "reduzir movimento" (aí o filme não baixa os vídeos: mostra cada ambiente em foto).

Identidade: o logo é o oficial, vetorizado a partir do PNG do site atual. Bronze **#976421** e cinza **#8A8582** do
logo, ébano **#14110F** e linho **#F2ECE3**. Fontes: Jost (títulos; geométrica como o "NUVO" do logo), Instrument Sans
(textos) e DM Mono (detalhes), todas dentro de `assets/fonts/`.

## Os vídeos

**Situação:** os 4 vídeos e as 5 imagens já estão no site (14/10). O vídeo 4 (`04-finale`) veio com drones voando
sobre a piscina entre 2 s e 7 s; no site ele está cortado (closet → fusão → casa acesa, 4,25 s). Para ter o trecho
completo do quarto e da piscina, gere de novo o vídeo 4 com o prompt atual do PROMPTS.md e rode o script.
O vídeo 3 (`03-closet`) tinha um corte seco da cozinha para a escada em 1,46 s; no site esse corte virou uma fusão
rápida de 0,25 s (o vídeo ficou com 9,75 s). As imagens ficam em `assets/img/keys/`.

Os prompts das 5 imagens e dos 4 vídeos estão em **[PROMPTS.md](PROMPTS.md)**, com o passo a passo
(Seedance 2.0, 10 s, 16:9, como no site de referência). Resumo do caminho de um vídeo até o site:

1. Gerar o MP4 com o nome da tabela do PROMPTS.md, ex.: `02-kitchen.mp4`. Para emendar sem salto, o primeiro quadro
   de cada vídeo é o último quadro do anterior. Para tirar esse quadro:
   `ffmpeg -sseof -0.05 -i videos/01-living.mp4 -frames:v 1 -update 1 ultimo-quadro-01.png`.
2. Colocar em `nuvo-woodwork/videos/` (essa pasta não vai para o git nem para o ar).
3. Rodar `tools/make-videos.sh` dentro de `nuvo-woodwork/`. Precisa do ffmpeg.
4. O script cria `assets/video/<trecho>.mp4` (telas largas) e `assets/video/<trecho>.tall.mp4` (celular em pé) e
   reescreve `assets/video/manifest.js`. Pronto: o trecho passa a usar o vídeo.

Detalhes:

- Os vídeos saem em H.264, 24 quadros por segundo, com um quadro-chave a cada 2 quadros e um pouco mais de
  nitidez. Dá uns 6 MB por trecho de 10 s no computador e 3,5 MB no celular. A versão do celular vai mais
  caprichada (`CRF_TALL=20`) porque na tela em pé ela é ampliada umas 3,5 vezes.
- **Qualidade:** os vídeos atuais são 720p. No celular em pé aparece só o meio do quadro (uns 330 pixels de
  largura), então a nitidez depende muito da resolução de origem. No Flow, baixe a versão **1080p (Upscaled)** de
  cada vídeo e rode o script de novo: o celular passa a ter 810 × 1080 de imagem em vez de 540 × 720.
- O `manifest.js` guarda, de cada vídeo, quanto a imagem muda de um quadro para o outro (é assim que o site dá mais
  scroll às partes com movimento) e onde cada quadro está dentro do arquivo (é assim que o navegador decodifica os
  quadros direto). Se trocar um vídeo, rode o script de novo.
- O site baixa um vídeo por vez, primeiro o do trecho em que a pessoa está. O Cloudflare não entrega pedaços de
  vídeo, então no modo `<video>` o arquivo vem inteiro antes de entrar (o iPhone precisa disso).
- Com um vídeo vertical `02-kitchen-mobile.mp4`, o celular usa ele; sem, o script recorta o centro do 16:9 em 3:4.
- Para tirar um vídeo do ar: apague os dois arquivos do trecho em `assets/video/` e rode
  `tools/make-videos.sh --manifest`.

## Como editar

| O quê | Onde |
| --- | --- |
| Títulos do filme (e em que segundo do vídeo entram), ordem dos trechos, velocidade do filme | `assets/js/content.js` → `scenes` e `tour` |
| Telefone, e-mail e endereço do formulário | `assets/js/content.js` → `contact` (e no `index.html`) |
| Ambientes, estúdio, processo, depoimentos, contato e rodapé | `index.html` |
| Fotos dos projetos | `assets/img/work/` (índice e estúdio); imagens do filme em `assets/img/keys/` |
| Cores e fontes | topo do `assets/css/styles.css` |

Nos títulos do filme, `\n` quebra a linha e `*palavra*` fica em itálico dourado.

### Formulário

Hoje o botão abre o e-mail de quem preenche com a mensagem pronta para `info@nuvowoodwork.com`.
Para a mensagem chegar direto, sem depender do e-mail da pessoa:

1. Crie um formulário grátis em <https://formspree.io> com o e-mail da Nuvo.
2. Cole o endereço dele (algo como `https://formspree.io/f/abcdwxyz`) em `contact.formEndpoint`, no `content.js`.

## Antes de mostrar para o cliente

Tudo veio do site atual da Nuvo (textos, fotos, depoimentos, telefone, e-mail e endereço). Vale confirmar:

- [ ] Nomes dos projetos nas legendas: Camino Real Signature House, Las Olas Waterfront Residence, Aventura
      Contemporary Residence, Parkland Club Residence, Lotus Palm (tirados dos nomes dos arquivos de foto deles)
- [ ] História do Eduardo e da Renata, "30+ anos", "desde 2015" e "garantia de 36 meses"
- [ ] Marcas: Blum, Häfele, Richelieu, DixiePly e Biesse (no site atual aparecem "BIESSA" e também "SEAL")
- [ ] Cidades atendidas: Boca Raton, Delray Beach, Parkland e Miami
- [ ] Se o telefone (561) 770-2595 tem WhatsApp (dá para pôr um botão)
- [ ] Endereço da oficina: 4801 Johnson Rd, Suite 4, Coconut Creek
- [ ] As 5 imagens e os 4 vídeos (PROMPTS.md)

## Ver no computador

Abra o `index.html` no navegador, ou rode um servidor local nesta pasta:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

O site está no ar em **<https://nuvo-woodwork.lucassouzalima10.workers.dev>** (Worker do Cloudflare; veja abaixo por que
não ficou no `.pages.dev`).

O workflow `.github/workflows/deploy-nuvo-woodwork.yml` publica o site no Cloudflare Pages a cada push que mexe em
`nuvo-woodwork/`, sempre como produção, em **<https://nuvo-woodwork.pages.dev>** (se o nome já existir no Cloudflare,
o endereço certo aparece no resumo da execução, em Actions). Deixa de fora `README.md`, `PROMPTS.md`, `tools/` e `videos/`.

Ele usa o secret `CLOUDFLARE_API_TOKEN` dos outros sites. O `CLOUDFLARE_ACCOUNT_ID` pode estar em Secrets ou em
Variables; se não existir em nenhum dos dois, o workflow tenta descobrir a conta pelo próprio token. Se o resumo da
execução disser "Falta o ID da conta do Cloudflare", salve o ID em **Settings → Secrets and variables → Actions →
New repository secret**, com o nome `CLOUDFLARE_ACCOUNT_ID` (no Cloudflare, ele aparece em Workers & Pages, na
lateral direita), e rode de novo em **Actions → Deploy NUVO Woodwork → Run workflow**.

A conta do Cloudflare permite no máximo 10 projetos do Pages, e esse limite já foi atingido. Nesse caso o workflow
publica o site como Worker, no endereço `https://nuvo-woodwork.<sua-conta>.workers.dev` (o endereço exato aparece no
resumo da execução, em Actions). Para usar o `nuvo-woodwork.pages.dev`, apague um projeto antigo do Pages
(Workers & Pages → projeto → Settings → Delete project) e rode o workflow de novo.

A prévia está fora do Google (`<meta name="robots" content="noindex">` no `index.html`), para não competir com o site
atual. Quando o site for para o domínio da Nuvo: apague essa linha, aponte o domínio em Cloudflare → Workers & Pages →
nuvo-woodwork → Custom domains, e o `og:image` já sai com o endereço certo.

## Estrutura

```
nuvo-woodwork/
├── index.html               página (logo vetorizado embutido)
├── PROMPTS.md               prompts das 5 imagens e dos 4 vídeos
├── assets/css/styles.css    visual
├── assets/js/content.js     trechos do filme (títulos, tempos, fotos) e contato
├── assets/js/film.js        o filme: scroll, títulos, canvas, carregamento (e o <video> de reserva)
├── assets/js/film-decoder.js decodifica os quadros dos vídeos direto no navegador (WebCodecs)
├── assets/js/scroll.js      rolagem suave no computador e links internos
├── assets/js/vendor/        Lenis 1.3.26 (rolagem suave, licença MIT)
├── assets/js/app.js         menu, índice de ambientes, formulário
├── assets/video/            vídeos do filme + manifest.js (gerados pelo script)
├── assets/img/              fotos, favicon, ícone do iPhone e prévia do link
├── assets/fonts/            fontes
└── tools/make-videos.sh     videos/ → assets/video/
```
