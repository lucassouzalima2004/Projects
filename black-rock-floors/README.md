# Black Rock Floors · site

Site novo da **Black Rock Floors**, empresa de pisos do **Gabriel Olimpio** em King & Snohomish County, Washington (EUA).
O site é em inglês, porque o público é americano. É HTML, CSS e JavaScript puros: sem build e sem dependências.
Dá para abrir o `index.html` direto no navegador.

## O pedido

Pelo WhatsApp e pelos áudios de 13 e 14/10:

- O site antigo (`blackrockremodeling.us`) foi tomado pela agência de marketing com quem ele tinha contrato de 90 dias. O Gabriel está processando a agência. Ele mandou prints do site antigo e quer **manter todo o conteúdo**, melhorando o visual.
- No topo, **um vídeo de alguém instalando piso** (ou uma casa com piso bonito passando), minimalista, com as letras no cantinho para aparecer mais o vídeo. Ele gostou do título **"Floors done right the first time"** e quer manter.
- Gostou do **painel do topo** do <https://masteryfloors.com>, das **avaliações do Google passando na tela** ("passando, não parado") e dos **projetos recentes passando na tela**.
- Em projetos: "os serviços que já fiz, simples, **o nome da cidade e as fotos**".
- Referências de estilo: <https://nexgen-pro-paint.pages.dev> (vídeo de fundo e letras minimalistas) e <https://mainsailpainting.com> (vídeo da equipe, reviews do Google, mais clean).
- Perguntou sobre **SEO** (ranquear no Google).
- O domínio dele está no **Wix**. Pagamento: ele paga quando o site estiver no domínio dele.
- Ele mesmo comentou que sabe que "esses sites são feitos por IA": o site não pode ter cara de modelo pronto.

## O que tem no site

**Página inicial** (`index.html`):

- **Faixa do topo** com "aberto agora / fechado agora" calculado pelo horário de Seattle, telefone, "Text us" e horário.
- **Painel com o vídeo** (cantos arredondados, como o da Mastery Floors), título no canto inferior esquerdo, selo do Google (4.9 · 137 reviews) e os capítulos do vídeo sincronizados: *01 Measure · 02 Cut · 03 Fit · 04 Finish*. Botão de pausar. No celular, os capítulos viram barrinhas no topo, como nos stories, e o vídeo é outro, em pé.
- **Números** do site antigo (6 serviços, 24h, 100%, 4.9) e os 3 selos (subfloor prep, free measure, written proposals).
- **Avaliações do Google passando** em duas faixas, em sentidos opostos. Param com o mouse em cima, dá para arrastar e tem botão de pausar.
- **Serviços** ("Every floor. One accountable crew."): lista dos 6 serviços. No computador, ao passar o mouse, a foto e o **corte técnico** do piso mudam ao lado (camadas, encaixe macho e fêmea, prego escondido, junta de dilatação, membrana do porcelanato, medidas dos degraus). Cada serviço leva à sua página.
- **Projetos recentes passando**, com o nome da cidade e o tipo de serviço. Clicar abre a foto grande.
- **O fundador**: foto do Gabriel, a frase da missão e a bio do site antigo.
- **Why homeowners choose us** (os 4 itens do site antigo) e **How it works** (4 passos).
- **Área atendida**: as 18 cidades do site antigo e um **mapa** com as cidades nas coordenadas reais, a divisa entre os condados e a montanha do logo a leste.
- **FAQ**: as 8 perguntas do site antigo, com respostas.
- **Contato** e **pedido de orçamento**: o formulário abre o e-mail (ou o SMS) já preenchido.
- **Rodapé** com a faixa "Trust the local experts." (do site antigo) e um desenho de tábuas com as emendas desencontradas.
- Barra fixa no celular (ligar, mandar texto, orçamento).

**Páginas de serviço** (uma por serviço, boas para o Google): `hardwood-floor-installation/`, `luxury-vinyl-plank/`,
`laminate-flooring/`, `tile-installation/`, `hardwood-floor-refinishing/` e `stair-treads/`. Cada uma tem o que está incluído,
o corte técnico, "Good to know", o passo a passo, os projetos, perguntas próprias e o formulário com o serviço já marcado.

**Também:** página 404, prévia bonita do link no WhatsApp (`assets/img/og-image.jpg`), dados estruturados para o Google
(empresa, horários, área atendida, serviços, FAQ e trilha de navegação), `sitemap.xml` e `robots.txt` gerados na publicação.
As animações e o vídeo desligam sozinhos para quem ativou "reduzir movimento".

**Testes (15/10):** Lighthouse no computador 100 em desempenho, acessibilidade, boas práticas e SEO; no celular, 96–97 em
desempenho e 100 nos outros três. Zero problemas no teste de acessibilidade (axe) em todas as páginas.

Identidade: logo vetorizado a partir do PNG que o Gabriel mandou. Preto **#0E0E0D**, osso **#EBE7E0** e o vermelho do "R"
da camisa dele, **#C8102E**. Fonte: **Archivo** (larguras variáveis; a versão larga, em maiúsculas espaçadas, ecoa o
"F L O O R S" do logo), dentro de `assets/fonts/`.

## Antes de mostrar ao Gabriel: o que é exemplo e precisa confirmar

- [ ] **Avaliações do Google**: as 8 que aparecem são **exemplos escritos por nós**. Troque pelas avaliações reais do perfil do Google dele antes de ligar o domínio (`index.html`, seção 3). Enquanto isso, a prévia `.workers.dev` não aparece no Google (`noindex`).
- [ ] **Link "Read them on Google"**: trocar pelo link do perfil do Google da empresa (Google Maps → Compartilhar).
- [ ] **Nota e quantidade**: 4.9 e 137 avaliações vieram do site antigo. Confirmar os números de hoje (aparecem no selo do topo, nos números, na seção de avaliações, nas páginas de serviço e na `og-image.jpg`).
- [ ] **Fotos dos projetos**: hoje são fotos de banco de imagens (Unsplash), com cidades de exemplo. Pedir ao Gabriel as fotos dos trabalhos e a cidade de cada um.
- [ ] **Fotos dos serviços**: também são de banco de imagens. Trocar pelas dele quando tiver.
- [ ] **Vídeo do topo**: provisório, montado com 4 clipes gratuitos do Mixkit (veja [O vídeo do topo](#o-vídeo-do-topo)). O ideal é a equipe dele instalando piso, com o logo nas costas, como ele sugeriu, ou um vídeo gerado por IA.
- [ ] **Nome da empresa**: o logo e a camisa dizem *Black Rock Floors*; o site antigo e o e-mail dizem *Black Rock Remodeling LLC*. Hoje o site usa "Black Rock Floors" em tudo. Confirmar o nome e se quer o nome da LLC no rodapé.
- [ ] **Número de registro na L&I**: em Washington, a lei (RCW 18.27.100) pede o número de registro de empreiteiro na propaganda que mostra o nome da empresa, e o site conta como propaganda (vale confirmar com a L&I). Pedir o número e colocar no rodapé; também passa confiança.
- [ ] **E-mail** `br.remodelingwa@gmail.com`: confirmar que continua sendo o dele.
- [ ] **Respostas do FAQ** e **textos das páginas de serviço** (o que está incluído, prazos, mover móveis, tipos de acabamento): escritos por nós com base nas práticas comuns do mercado. Pedir para ele ler.
- [ ] **Números**: "6 services in-house", "24h quote turnaround", "100% free estimates" (do site antigo).
- [ ] **Cidades**: as 18 do site antigo. No print, as duas últimas ficaram cortadas: perguntar se falta alguma.
- [ ] **Horário**: seg a sex 8h–17h, sáb 9h–14h, domingo fechado (do site antigo).
- [ ] **Instagram, Facebook, Yelp…**: o site antigo não mostrava. Se ele tiver, dá para pôr no rodapé.

## Como editar

O conteúdo fica direto no HTML (é o que o Google lê). Cada seção do `index.html` tem um comentário em português com o número dela.

| O quê | Onde |
| --- | --- |
| Avaliações do Google | `index.html`, seção 3: cada `<article class="review">` é uma avaliação |
| Projetos (foto, cidade e serviço) | `index.html`, seção 5: cada `<button class="project">`. Fotos em `assets/img/projects/` (720 × 900, WebP) |
| Textos dos serviços | `index.html`, seção 4, e a página de cada serviço (`hardwood-floor-installation/index.html` etc.) |
| FAQ | `index.html`, seção 9, e também o bloco `FAQPage` no `<head>` (o Google lê esse) |
| Telefone, e-mail | Estão em todas as páginas: use "buscar e substituir" na pasta inteira (`4255434667`, `543-4667`, `br.remodelingwa@gmail.com`) e em `assets/js/app.js` (`PHONE`, `EMAIL`) |
| Horário | Texto nas páginas e `HOURS` no topo do `assets/js/app.js` (é ele que calcula o "Open now") |
| Cores e fonte | Topo do `assets/css/styles.css` |
| Vídeo do topo | `tools/make-hero-video.sh` (veja abaixo) |

Todas as fotos estão em WebP, já no tamanho certo. Ao trocar uma foto, mantenha o mesmo formato (4:5 para projetos e serviços).

## O vídeo do topo

Os arquivos em `assets/video/` saem do script `tools/make-hero-video.sh` (precisa de `ffmpeg`):

- 4 clipes de 4 s com a mesma cor, emendados com fusão, escurecendo no começo e no fim para o loop não dar pulo (14,2 s no total);
- três versões: `hero-1080` (computador), `hero-720` (telas médias) e `hero-tall` (celular em pé), cada uma em **MP4** (toca em tudo, inclusive iPhone) e em **WebM** (para navegadores sem H.264). O site escolhe sozinho;
- os capítulos (*Measure, Cut, Fit, Finish*) começam nos segundos que estão em `data-chapters` no `<video>` do `index.html`.

Clipes de hoje, todos na licença *Mixkit Stock Video Free License* (uso comercial liberado, sem crédito obrigatório):
[medindo a madeira](https://mixkit.co/free-stock-video/a-person-measures-a-block-of-wood-for-construction-1445/),
[serra de esquadria](https://mixkit.co/free-stock-video/man-in-a-carpentry-cutting-with-an-electric-saw-39699/) (recortada para o logo da serra não aparecer),
[ajustando a tábua](https://mixkit.co/free-stock-video/hand-of-a-carpenter-leveling-a-wooden-board-39684/) e
[superfície da madeira](https://mixkit.co/free-stock-video/detailed-tour-of-the-surface-of-a-wooden-board-34496/).

**Para usar as filmagens do Gabriel** (ou um vídeo gerado): grave clipes deitados (de preferência 4K ou 1080p, câmera parada
ou andando devagar), coloque em `tools/clips/`, troque a lista `CLIPS` no começo do script e rode
`bash tools/make-hero-video.sh`. O script mostra os segundos dos capítulos para colar no `data-chapters`.

## Publicar

O workflow `.github/workflows/deploy-black-rock-floors.yml` publica o site no Cloudflare a cada push que mexe em
`black-rock-floors/` (no `main` ou no branch `claude/practical-goldberg-vyf1zm`). Vai como **Worker** chamado
`blackrockfloors`, no mesmo esquema da The Berry Coffee, porque a conta já chegou ao limite de projetos do Cloudflare Pages.
O endereço fica `https://blackrockfloors.<subdomínio da conta>.workers.dev` e aparece no resumo da execução, em **Actions**.

- Usa o mesmo secret dos outros sites: `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, opcional).
- Na publicação, o workflow coloca o endereço completo no `og:image` (o WhatsApp exige), o `canonical` e o `og:url` em cada página, e gera o `sitemap.xml` e o `robots.txt`.
- O README e a pasta `tools/` não vão para o ar.
- No endereço `.workers.dev`, o site vai com `noindex` (arquivo `_headers`): o Google não indexa a prévia.

### Ligar o domínio do Gabriel (que está no Wix)

1. No Cloudflare: **Add a domain** com o domínio dele. O Cloudflare mostra dois *nameservers*.
2. No Wix: em **Domains**, abra o domínio e troque os *nameservers* pelos do Cloudflare (o domínio continua registrado no Wix).
3. Quando o Cloudflare confirmar o domínio: **Workers & Pages → blackrockfloors → Settings → Domains & Routes → Add → Custom domain**, com `www.dominio.com` e o domínio sem `www`.
4. No GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable** `BLACKROCK_SITE_URL` = `https://www.dominio.com`, e rode o workflow de novo (**Actions → Deploy Black Rock Floors → Run workflow**). Assim o canonical e o sitemap passam a usar o domínio.
5. No Google Search Console, adicione o domínio e envie `https://www.dominio.com/sitemap.xml`. No Perfil da Empresa no Google, coloque o link do site novo.

## Ver no computador

```bash
cd black-rock-floors
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

```
black-rock-floors/
├── index.html                       página inicial
├── <serviço>/index.html             6 páginas de serviço
├── 404.html                         página "não encontrada"
├── _headers                         cabeçalhos do Cloudflare (noindex na prévia, cache)
├── assets/css/styles.css            visual (cores e fonte no topo)
├── assets/js/app.js                 comportamento (vídeo, faixas, menu, mapa, formulário)
├── assets/fonts/archivo-latin.woff2 fonte
├── assets/img/                      logo (SVG), favicon, og-image, fotos de serviços e projetos, tábuas
├── assets/video/                    vídeo do topo (MP4 e WebM) e o primeiro quadro
└── tools/make-hero-video.sh         monta o vídeo do topo a partir dos clipes
```

Créditos: fonte Archivo (SIL Open Font License); fotos de exemplo do [Unsplash](https://unsplash.com/license) (licença Unsplash);
clipes do vídeo do [Mixkit](https://mixkit.co/license/) (Mixkit Stock Video Free License); logo e foto do Gabriel enviados por ele.
