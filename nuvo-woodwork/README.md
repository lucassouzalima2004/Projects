# NUVO Woodwork · site

Novo site da NUVO Woodwork (marcenaria de alto padrão em South Florida: cozinhas, closets, salas de TV, bares,
escritórios e millwork), para substituir o WordPress atual (<https://nuvowoodwork.com>). Pedido do Guilherme:
uma casa top, e conforme a pessoa rola a página passa pelos ambientes vendo cada um ser montado, terminando
nos produtos da Nuvo.

É HTML, CSS e JavaScript puros: sem build, sem dependências. Dá para abrir o `index.html` direto no navegador.
O site é em inglês (o público é americano).

## O que tem no site

- **O filme da casa** (topo, preso na tela durante o scroll): 8 cenas, da chegada à fachada até a casa acesa à noite.
  Cada ambiente passa por **Design → Build → Installed** (aparece no canto), com dois textos por cena: a ideia do
  ambiente e o que a Nuvo faz nele, com link "Plan your kitchen" que já marca o ambiente no formulário.
  - Embaixo, uma **régua de trena** mostra onde a pessoa está, deixa pular para qualquer ambiente e, numa linha
    clara, quanto do vídeo de cada cena já carregou.
  - **Skip the tour** pula direto para o resto do site.
  - Enquanto uma cena não tem vídeo, ela aparece como **desenho técnico que vira a foto real** de um projeto da Nuvo
    (as cenas externas aparecem como a fachada desenhada a traço, com luzes acendendo e a porta abrindo).
- **Índice de ambientes** com fotos de projetos reais. No computador, a foto acompanha o cursor; no celular, aparece
  ao lado. Cada linha volta o filme até aquele ambiente.
- **O estúdio**: a história do Eduardo (italiano, nascido no Brasil, marceneiro há mais de 30 anos, na Flórida desde
  2015), três fotos de residências e os números.
- **Processo** em 6 passos (como cotas de desenho técnico) e as marcas de ferragem/máquinas.
- **Depoimentos** do Google (copiados do widget do site atual).
- **Contato** com formulário (cidade e ambientes), telefone, e-mail, endereço da oficina e horário.
- Prévia bonita do link no WhatsApp (`og-image.jpg`), favicon e ícone do iPhone com o monograma, dados estruturados
  para o Google, e respeito ao "reduzir movimento" (aí o filme mostra cada ambiente pronto, sem animação).

Identidade: o logo é o oficial, vetorizado a partir do PNG do site atual. Bronze **#976421** e cinza **#8A8582** do
logo, ébano **#14110F** e linho **#F2ECE3**. Fontes: Bodoni Moda (títulos; Bodoni é italiano, como a origem do
Eduardo), Instrument Sans (textos) e DM Mono (detalhes de desenho técnico), todas dentro de `assets/fonts/`.

## Os vídeos

Os prompts de imagem e de vídeo de cada cena estão em **[PROMPTS.md](PROMPTS.md)**, com o passo a passo.
Resumo do caminho de um vídeo até o site:

1. Gerar o MP4 (16:9, 1080p, 5 a 8 s, sem áudio) com o nome da tabela do PROMPTS.md, ex.: `02-kitchen.mp4`.
2. Colocar em `nuvo-woodwork/videos/` (essa pasta não vai para o git nem para o ar).
3. Rodar `tools/make-frames.sh` dentro de `nuvo-woodwork/`. Precisa do ffmpeg.
4. O script cria `assets/frames/<cena>/lg/` (16:9) e `assets/frames/<cena>/mobile/` (vertical) e reescreve
   `assets/frames/manifest.js`. Pronto: a cena passa a usar o vídeo.

Detalhes:

- Cada 5 s de vídeo vira 60 imagens (12 por segundo). Para mais suavidade: `FPS=16 tools/make-frames.sh`;
  para arquivos menores: `QUALITY=60 tools/make-frames.sh`.
- Com um vídeo vertical `02-kitchen-mobile.mp4`, o celular usa ele; sem, o script recorta o centro do 16:9.
- O site baixa primeiro um quadro a cada 16, depois os intermediários, e prioriza a cena em que a pessoa está e as
  próximas. Cenas distantes só baixam os quadros espaçados até a pessoa chegar perto.
- Para tirar um vídeo do ar: apague a pasta da cena em `assets/frames/` e rode `tools/make-frames.sh --manifest`.

## Como editar

| O quê | Onde |
| --- | --- |
| Textos do filme, ordem das cenas, duração de cada uma no scroll | `assets/js/content.js` → `scenes` |
| Telefone, e-mail e endereço do formulário | `assets/js/content.js` → `contact` (e no `index.html`) |
| Ambientes, estúdio, processo, depoimentos, contato e rodapé | `index.html` |
| Fotos dos projetos | `assets/img/work/` (índice e estúdio) e `assets/img/rooms/` (placeholders do filme) |
| Cores e fontes | topo do `assets/css/styles.css` |

Nos textos do filme, `*palavra*` fica em itálico bronze.

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
- [ ] Os 8 vídeos (PROMPTS.md)

## Ver no computador

Abra o `index.html` no navegador, ou rode um servidor local nesta pasta:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

O workflow `.github/workflows/deploy-nuvo-woodwork.yml` publica o site no Cloudflare Pages a cada push que mexe em
`nuvo-woodwork/`, sempre como produção, em **<https://nuvo-woodwork.pages.dev>** (se o nome já existir no Cloudflare,
o endereço certo aparece no resumo da execução, em Actions). Ele usa os mesmos secrets dos outros sites
(`CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`) e deixa de fora `README.md`, `PROMPTS.md`, `tools/` e `videos/`.

A conta do Cloudflare permite no máximo 10 projetos do Pages. Se a criação do projeto falhar por isso, apague um
projeto antigo (Workers & Pages → projeto → Settings → Delete project) e rode o workflow de novo.

A prévia está fora do Google (`<meta name="robots" content="noindex">` no `index.html`), para não competir com o site
atual. Quando o site for para o domínio da Nuvo: apague essa linha, aponte o domínio em Cloudflare → Workers & Pages →
nuvo-woodwork → Custom domains, e o `og:image` já sai com o endereço certo.

## Estrutura

```
nuvo-woodwork/
├── index.html               página (logo vetorizado embutido)
├── PROMPTS.md               prompts das imagens e vídeos das 8 cenas
├── assets/css/styles.css    visual
├── assets/js/content.js     cenas do filme (textos e tempos) e contato
├── assets/js/film.js        o filme: canvas, scroll, carregamento dos quadros, placeholders
├── assets/js/app.js         menu, índice de ambientes, formulário
├── assets/frames/           quadros dos vídeos + manifest.js (gerados pelo script)
├── assets/img/              fotos, favicon, ícone do iPhone e prévia do link
├── assets/fonts/            fontes
└── tools/make-frames.sh     vídeos → quadros
```
