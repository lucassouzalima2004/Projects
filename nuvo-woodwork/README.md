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
  - Títulos grandes à esquerda (no celular, embaixo) que sobem e somem presos ao scroll, e no fim o convite para a
    consultoria 3D grátis, com botões de agendar e ligar.
  - Embaixo, uma **régua de trena** mostra onde a pessoa está, deixa pular para qualquer trecho e, numa linha clara,
    quanto do vídeo de cada trecho já carregou.
  - **Skip the tour** pula direto para o resto do site.
  - Enquanto um trecho não tem vídeo, ele mostra **fotos reais de projetos da Nuvo** com um zoom lento.
- **Índice de ambientes** com fotos de projetos reais. No computador, a foto acompanha o cursor; no celular, aparece
  ao lado. Cada linha volta o filme até aquele ambiente (escritório e lavanderia, que ficaram fora do voo, levam ao
  formulário).
- **O estúdio**: a história do Eduardo (italiano, nascido no Brasil, marceneiro há mais de 30 anos, na Flórida desde
  2015), três fotos de residências e os números.
- **Processo** em 6 passos (como cotas de desenho técnico) e as marcas de ferragem/máquinas.
- **Depoimentos** do Google (copiados do widget do site atual).
- **Contato** com formulário (cidade e ambientes), telefone, e-mail, endereço da oficina e horário.
- Prévia bonita do link no WhatsApp (`og-image.jpg`), favicon e ícone do iPhone com o monograma, dados estruturados
  para o Google, e respeito ao "reduzir movimento" (aí o filme mostra cada ambiente pronto, sem animação).

Identidade: o logo é o oficial, vetorizado a partir do PNG do site atual. Bronze **#976421** e cinza **#8A8582** do
logo, ébano **#14110F** e linho **#F2ECE3**. Fontes: Jost (títulos; geométrica como o "NUVO" do logo), Instrument Sans
(textos) e DM Mono (detalhes), todas dentro de `assets/fonts/`.

## Os vídeos

**Situação:** os 4 vídeos e as 5 imagens já estão no site (14/10). O vídeo 4 (`04-finale`) veio com drones voando
sobre a piscina entre 2 s e 7 s; no site ele está cortado (closet → fusão → casa acesa, 4,25 s). Para ter o trecho
completo do quarto e da piscina, gere de novo o vídeo 4 com o prompt atual do PROMPTS.md e rode o script.
As imagens ficam em `assets/img/keys/` e aparecem no lugar de um vídeo que não carregar.

Os prompts das 5 imagens e dos 4 vídeos estão em **[PROMPTS.md](PROMPTS.md)**, com o passo a passo
(Seedance 2.0, 10 s, 16:9, como no site de referência). Resumo do caminho de um vídeo até o site:

1. Gerar o MP4 com o nome da tabela do PROMPTS.md, ex.: `02-kitchen.mp4`. Para emendar sem salto, o primeiro quadro
   de cada vídeo é o último quadro do anterior. Para tirar esse quadro:
   `ffmpeg -sseof -0.05 -i videos/01-living.mp4 -frames:v 1 -update 1 ultimo-quadro-01.png`.
2. Colocar em `nuvo-woodwork/videos/` (essa pasta não vai para o git nem para o ar).
3. Rodar `tools/make-frames.sh` dentro de `nuvo-woodwork/`. Precisa do ffmpeg.
4. O script cria `assets/frames/<cena>/lg/` (16:9) e `assets/frames/<cena>/mobile/` (vertical) e reescreve
   `assets/frames/manifest.js`. Pronto: a cena passa a usar o vídeo.

Detalhes:

- Cada 10 s de vídeo vira 120 imagens (12 por segundo), uns 4 MB no computador e 2 MB no celular por trecho
  (os vídeos atuais são 720p; em 1080p o peso sobe um pouco e a imagem fica mais nítida).
  Para mais suavidade: `FPS=15 tools/make-frames.sh`; para arquivos menores: `QUALITY=50 tools/make-frames.sh`.
- Com um vídeo vertical `02-kitchen-mobile.mp4`, o celular usa ele; sem, o script recorta o centro do 16:9.
- O site baixa primeiro um quadro a cada 16, depois os intermediários, e prioriza o trecho em que a pessoa está e
  os próximos. Trechos distantes só baixam os quadros espaçados até a pessoa chegar perto.
- Para tirar um vídeo do ar: apague a pasta do trecho em `assets/frames/` e rode `tools/make-frames.sh --manifest`.

## Como editar

| O quê | Onde |
| --- | --- |
| Títulos do filme, ordem dos trechos, duração de cada um no scroll, fotos de placeholder | `assets/js/content.js` → `scenes` |
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
├── assets/js/film.js        o filme: canvas, scroll, carregamento dos quadros, placeholders
├── assets/js/app.js         menu, índice de ambientes, formulário
├── assets/frames/           quadros dos vídeos + manifest.js (gerados pelo script)
├── assets/img/              fotos, favicon, ícone do iPhone e prévia do link
├── assets/fonts/            fontes
└── tools/make-frames.sh     vídeos → quadros
```
