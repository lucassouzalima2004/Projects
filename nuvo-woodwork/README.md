# NUVO Woodwork · site

Novo site da NUVO Woodwork (marcenaria de alto padrão em South Florida: cozinhas, closets, salas de TV, bares,
escritórios e millwork), para substituir o WordPress atual (<https://nuvowoodwork.com>). Pedido do Guilherme:
uma casa top, e conforme a pessoa rola a página passa pelos ambientes vendo cada um ser montado, terminando
nos produtos da Nuvo.

É HTML, CSS e JavaScript puros: sem build, sem dependências. Dá para abrir o `index.html` direto no navegador.
O site é em inglês (o público é americano).

## O que tem no site

- **As cenas da casa** (topo): cada ambiente ocupa a tela inteira (entrada, sala, cozinha, closet e a casa acesa) e
  uma pequena rolada já leva à próxima cena, numa passagem com parallax (`assets/js/chapters.js`):
  - a cena nova sobe por cima da anterior e a foto dela anda mais devagar que ela, com um leve zoom, como a câmera
    entrando no ambiente; a anterior fica para trás e escurece; os títulos e o card do projeto real andam mais rápido.
    Voltando, o mesmo movimento ao contrário. A passagem roda no tempo dela (1,1 s), não presa ao scroll, então é
    sempre lisa, e começa no mesmo instante da rolada.
  - Funciona com a roda do mouse, o trackpad (um gesto muda uma cena só, mesmo com a inércia do Mac), o dedo, as
    setas e o espaço do teclado e os tracinhos na lateral direita (cada um com o nome do ambiente).
  - Na última cena a rolagem segue para o resto do site; voltando ao topo, rolar para cima volta pelas cenas.
  - Parada, a foto continua viva: zoom bem lento no computador; no celular em pé, onde a foto larga não cabe, a câmera
    passeia devagar de um lado para o outro da sala. No computador as camadas também acompanham o mouse.
  - Em cada ambiente flutua uma foto de um projeto real da Nuvo ("Real project"), no computador.
  - Com "reduzir movimento" ligado, as cenas só trocam com uma fusão rápida.
  - O filme antigo em vídeo (o voo de drone pela casa) continua no ar em `?video` no fim do endereço; veja
    "O filme em vídeo" mais abaixo.
- **A visita** (em teste, com `?tour` no fim do endereço): a câmera para em cada cômodo e uma rolada toca um mini
  vídeo rápido até o próximo, com vídeos separados para o computador e o celular. Também tem as etiquetas em cima das
  passagens, como no reel do @michonmotion que o Lucas mandou. Veja "A visita" mais abaixo.
- **Índice de ambientes** com fotos de projetos reais. No computador, a foto acompanha o cursor; no celular, aparece
  ao lado. Cada linha volta para aquele ambiente nas cenas do topo (escritório e lavanderia, que não têm cena, levam
  ao formulário).
- **O estúdio**: a história do Eduardo (italiano, nascido no Brasil, marceneiro há mais de 30 anos, na Flórida desde
  2015), três fotos de residências e os números.
- **Processo** em 6 passos (como cotas de desenho técnico) e as marcas de ferragem/máquinas.
- **Depoimentos** do Google (copiados do widget do site atual).
- **Contato** com formulário (cidade e ambientes), telefone, e-mail, endereço da oficina e horário.
- Prévia bonita do link no WhatsApp (`og-image.jpg`), favicon e ícone do iPhone com o monograma, dados estruturados
  para o Google, e respeito ao "reduzir movimento".

Identidade: o logo é o oficial, vetorizado a partir do PNG do site atual. Bronze **#976421** e cinza **#8A8582** do
logo, ébano **#14110F** e linho **#F2ECE3**. Fontes: Jost (títulos; geométrica como o "NUVO" do logo), Instrument Sans
(textos) e DM Mono (detalhes), todas dentro de `assets/fonts/`.

## As fotos das cenas

Ficam em `assets/img/scenes/`: cada cena tem a foto larga com 2752 px (`kitchen.webp`) e uma cópia com 1376 px para
telas pequenas (`kitchen-1376.webp`). As 5 de hoje são as imagens do Flow que abriam e fechavam os vídeos (1376 px),
ampliadas 2× com um upscaler de IA (Swin2SR), que tira os artefatos do JPEG e deixa as bordas nítidas.

Para trocar uma foto ou pôr uma cena nova:

1. Gere a imagem no Flow (os prompts, em 16:9 e na versão em pé para o celular, estão no
   [PROMPTS.md](PROMPTS.md), em "Fotos para as cenas do topo"). Baixe na maior resolução que ele der.
2. Rode `tools/make-scenes.sh kitchen=~/Downloads/cozinha.png` dentro de `nuvo-woodwork/` (precisa do ffmpeg). Foto
   deitada vira as duas larguras; foto em pé vira uma de 1440 px. Se a imagem for pequena, o script avisa.
3. Em `assets/js/content.js` → `chapters`, a cena aponta para a foto (`image`), para a versão em pé (`tall`, que o
   celular em pé usa no lugar da larga, sem cortar), para o ponto de interesse (`focus`) e para o card do projeto
   real (`card`). Para uma cena nova, copie um bloco e mude o `id`, o `label` (o nome nos tracinhos) e os textos.

## A visita (`?tour`)

<https://nuvo-woodwork.lucassouzalima10.workers.dev/?tour> (`assets/js/tour.js`). A câmera para num cômodo, com o título
embaixo à esquerda. Uma rolada (roda, trackpad, dedo ou setas) toca o mini vídeo inteiro até o próximo cômodo, uns 2 s;
rolando para cima, o mesmo vídeo de trás para frente. No fim de cada vídeo, a foto do cômodo (nítida) entra por cima do
último quadro. Um gesto troca um cômodo só (a inércia do trackpad não pula dois). No último cômodo a rolagem segue para
o resto do site; de volta ao topo, rolar para cima volta pelos cômodos.

- Como no reel, também há etiquetas em cima das passagens (no celular em pé, botões embaixo do título), que levam
  direto a um cômodo, e o link de voltar no canto de cima.
- **Computador e celular são separados:** o computador usa os vídeos e as fotos deitados (16:9) e o celular em pé usa
  as versões em pé (9:16): `assets/video/<caminho>-tall.mp4` e `assets/img/scenes/<cômodo>-tall.webp`.
- O vídeo toca normal, não preso ao scroll, então é sempre liso. Enquanto a pessoa está num cômodo, os vídeos da
  próxima rolada (para baixo e para cima) já vão baixando; cada um baixa inteiro e toca da memória, porque o
  Cloudflare não entrega pedaços de vídeo e o iPhone precisa disso para tocar direto do endereço.
- Sem decodificador de H.264, com "reduzir movimento" ou com economia de dados, os cômodos trocam com fusão.
- **Provisório:** os mini vídeos de hoje são os do filme, cortados e acelerados (`SPEED=3.5` a `4`), e os do celular
  são o meio recortado em 9:16; as fotos em pé são o mesmo recorte das fotos largas. Os definitivos e os prompts estão
  no [PROMPTS.md](PROMPTS.md), em "Vídeos para a visita".

Para pôr um vídeo novo (precisa do ffmpeg):

```bash
SPEED=3 tools/make-tour-videos.sh living-kitchen=sala-cozinha-16x9.mp4 living-kitchen=sala-cozinha-9x16.mp4
```

Cria a ida e a volta de cada um em `assets/video/` (`living-kitchen.mp4`, `-rev`, `-tall`, `-tall-rev`). `SPEED`
acelera, `END=7.5` corta o fim parado e `CROP_TALL=1` faz a versão do celular recortando o vídeo largo (provisório).
A foto em pé de cada cômodo tem que ser o último quadro do vídeo em pé que chega nele: tire com
`ffmpeg -sseof -0.05 -i assets/video/living-kitchen-tall.mp4 -frames:v 1 -update 1 cozinha-em-pe.png` (ou use a imagem
9:16 que serviu de último quadro) e rode `tools/make-scenes.sh kitchen-tall=cozinha-em-pe.png`.
Em `assets/js/content.js` → `visit`: `order` é a ordem da rolada, `moves` diz qual vídeo liga dois cômodos (com
`reverse: true` quando existe a volta) e `stops` tem as fotos, os textos e as etiquetas (posição em fração da foto).

## O filme em vídeo (`?video`)

O topo antigo, o voo de drone pela casa preso ao scroll, continua no ar com `?video` no fim do endereço
(<https://nuvo-woodwork.lucassouzalima10.workers.dev/?video>). Tudo abaixo vale para ele.

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

## Laboratório 3D

`lab/3d.html` é um teste do filme em 3D de verdade (Gaussian Splatting, com a biblioteca Spark). Ele ainda não faz
parte do site e nada aponta para ele. Abra
<https://nuvo-woodwork.lucassouzalima10.workers.dev/lab/3d.html>, escolha um arquivo 3D (.spz, .ply, .splat) e role:

- no começo o ambiente se monta em volta da câmera;
- depois a câmera percorre o ambiente;
- no celular em pé a câmera abre na vertical em vez de cortar.

Como gerar o arquivo (Marble ou escaneamento com o iPhone) está no fim do [PROMPTS.md](PROMPTS.md). Um arquivo
salvo em `lab/` abre direto pelo endereço: `lab/3d.html?splat=cozinha.spz`. Ajustes pelo endereço:

- `dist=1.8`: quantos metros a câmera anda;
- `turn=12`: quantos graus ela vira;
- `flip=0`: para escaneamentos que já vêm em pé;
- `debug`: mostra os quadros por segundo.

## Diagnóstico do filme em vídeo

Abra o site com `?video&debug` no fim do endereço (ex.: `https://nuvo-woodwork.lucassouzalima10.workers.dev/?video&debug`)
e role pelo filme: um painel no canto mostra, a cada segundo, como o filme está rodando naquele aparelho:

- **Modo:** canvas (decodificador) ou `<video>`, e por quê.
- **Tela:** a frequência dela (60 Hz, 120 Hz...).
- **Rolando:** quadros por segundo enquanto a página anda.
- **Pinturas:** quantas mostraram o quadro exato.
- **Decodificador:** quadros por segundo e atraso.
- **Baixado:** quanto de cada vídeo já chegou.

Para comparar os dois modos no mesmo aparelho: `?video&film=video` força o `<video>` e `?video&film=canvas` força o
canvas (dá para juntar: `?video&debug&film=video`).

## Como editar

| O quê | Onde |
| --- | --- |
| Cenas do topo: ordem, títulos, fotos, ponto de interesse e card do projeto real | `assets/js/content.js` → `chapters` |
| Duração e curva da passagem entre as cenas | `assets/js/chapters.js` → `DUR` e `EASE` |
| Visita (`?tour`): ordem, cômodos, etiquetas e mini vídeos | `assets/js/content.js` → `visit` |
| Títulos do filme em vídeo (`?video`) e em que segundo entram | `assets/js/content.js` → `scenes` e `tour` |
| Telefone, e-mail e endereço do formulário | `assets/js/content.js` → `contact` (e no `index.html`) |
| Ambientes, estúdio, processo, depoimentos, contato e rodapé | `index.html` |
| Fotos dos projetos | `assets/img/work/` (índice, estúdio e cards das cenas); fotos das cenas em `assets/img/scenes/` |
| Cores e fontes | topo do `assets/css/styles.css` |

Nos títulos, `\n` quebra a linha e `*palavra*` fica em itálico dourado.

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
├── PROMPTS.md               prompts das fotos das cenas (Flow) e dos vídeos
├── assets/css/styles.css    visual
├── assets/js/content.js     cenas do topo, trechos do filme em vídeo e contato
├── assets/js/chapters.js    as cenas do topo: passagem com parallax, roda, trackpad, dedo e teclado
├── assets/js/tour.js        a visita (?tour): uma rolada, um mini vídeo até o próximo cômodo
├── assets/js/film.js        o filme em vídeo (?video): scroll, títulos, canvas, carregamento
├── assets/js/film-decoder.js decodifica os quadros dos vídeos direto no navegador (WebCodecs)
├── assets/js/scroll.js      rolagem suave no computador e links internos
├── assets/js/vendor/        Lenis 1.3.26 (rolagem suave, licença MIT)
├── assets/js/app.js         menu, índice de ambientes, formulário
├── assets/video/            vídeos do filme + manifest.js (gerados pelo script)
├── assets/img/scenes/       fotos das cenas do topo (geradas pelo make-scenes.sh)
├── assets/img/              fotos, favicon, ícone do iPhone e prévia do link
├── assets/fonts/            fontes
├── tools/make-scenes.sh     imagens do Flow → assets/img/scenes/
├── tools/make-tour-videos.sh vídeos gerados → mini vídeos da visita (ida e volta, computador e celular)
└── tools/make-videos.sh     videos/ → assets/video/
```
