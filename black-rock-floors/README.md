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

### Ajustes depois da primeira versão (áudios de 15/10)

O Gabriel viu o link e gostou ("bem profissional, bem bonitão"). Pediu só estes ajustes, todos feitos:

1. **O fundador logo abaixo do vídeo**, na segunda posição: "o americano gosta de saber quem vai estar na casa dele".
   A seção *Meet the founder* agora vem logo depois do topo, com os números do site antigo embaixo.
2. **Vídeo de piso mesmo**: o vídeo anterior parecia carpintaria ("eu vi até um 2x4"). Agora só tem piso passando:
   sol sobre um piso de carvalho, a câmera passando por uma sala vazia com piso de madeira e os veios da madeira de perto.
3. **Letra mais elegante, no meio**, como no anúncio da *Russet Construction* que ele mandou: título centralizado numa
   serifada clássica (*FLOORS DONE RIGHT* em maiúsculas e *the first time.* em itálico), linha fina dos lados do local,
   quatro itens com ✓, botão branco retangular e o link *View our work ↓*. A mesma serifada foi para os títulos do site todo.
4. Sobre as fotos, ele mesmo entendeu que são de exemplo ("tu tá me mandando mais pra ver o layout"). Mesmo assim, as fotos
   dos projetos agora mostram o piso em primeiro plano, sem cozinha ou escada ocupando a foto.

### Segunda rodada (15/10, à tarde)

Com o site novo no ar, ele mandou: "que site que tá ficando absurdo de bom… vale cada centavo". Pediu mais duas coisas, feitas:

1. **Tirar as explicações** (ele circulou o corte técnico com as camadas numeradas de cada piso). Os cortes saíram da home e
   das páginas de serviço. No computador, o painel ao lado da lista de serviços agora mostra só a foto do piso, maior,
   com o número e o nome do serviço. Nas páginas de serviço, no lugar do corte entrou um cartão de orçamento grátis.
2. **Fotos dos serviços mostrando mais piso do que a casa** ("no hardwood aparece mais uma cozinha", "no laminado mais um
   quarto", "no tile aparece mais o gabinete"). As 6 fotos foram trocadas por fotos em que o piso ocupa a maior parte:
   salas vazias com piso de madeira, vinílico cinza e laminado escuro, porcelanato polido, carvalho brilhando depois da
   restauração e degraus combinando com o piso do corredor.

### Terceira rodada (16/10): as fotos dele

"Tá perfeito." Ele pediu para trocar as fotos de banco de imagens pelas dos trabalhos dele ("fica muito fake aqueles móveis,
o cliente pode até pensar que é uma empresa falsa") e mandou as fotos com o nome de cada uma. Feito:

1. **Serviços com as fotos reais**: hardwood, LVP, laminado, porcelanato, restauração (com a lixadeira no meio do serviço)
   e escada. Valem para a home e para o topo de cada página de serviço.
2. **Projetos recentes**: só as seis cidades que ele mandou, cada uma com a foto e o nome da cidade, como ele pediu:
   Seattle, Bellevue, Kirkland, Bothell, Redmond e Snohomish.
3. **Snohomish na área atendida**: um dos trabalhos foi lá, e a cidade não estava na lista. Entrou na lista, no mapa
   (nas coordenadas reais), no FAQ e nos dados para o Google.

Ele também perguntou se o formulário vai para o e-mail dele. Hoje o formulário abre o app de e-mail **do visitante** com o
pedido pronto para `br.remodelingwa@gmail.com`; o pedido só chega se o visitante apertar "enviar" lá. Para chegar direto, o
site precisa de um serviço de envio de formulários (veja [O formulário](#o-formulário)).

### Vídeo no celular (16/10)

O Lucas viu que o vídeo do topo não rodava direito no celular. O motivo principal: o iPhone (Safari e qualquer navegador
no iOS) e o Safari do Mac só tocam vídeo se o servidor entregar **o pedaço do arquivo que eles pedem** (cabeçalho `Range`,
resposta 206), e os arquivos estáticos do Cloudflare sempre vêm inteiros. Agora um Worker pequeno (`worker.js`) responde a
esses pedidos, só para os vídeos. Também foi corrigido:

1. **Girar o celular** troca para o vídeo em pé ou deitado **do mesmo ponto**, em vez de voltar ao começo.
2. **Voltar de outro app ou aba**: o vídeo continua (antes ficava congelado).
3. **Economia de dados ligada**: o vídeo toca mesmo assim, na versão mais leve (antes nem carregava).
4. **Celular deitado**: o topo inteiro cabe na tela (título e botões, sem a lista de itens), com o vídeo atrás.
5. **Projetos recentes**: a faixa continua andando depois que a pessoa abre e fecha uma foto (antes parava).

Depois ele pediu: **"tem que abrir já com o vídeo rodando"**. Feito:

1. O vídeo começa a carregar junto com a página (um script pequeno logo depois do `<video>` no `index.html`), em vez de
   esperar o resto do site. Os vídeos foram gerados de novo para **começar no quadro da imagem de abertura**, com o
   escurecimento do loop perto do fim; com o mesmo zoom e uma entrada de 0,4 s, a troca não aparece: a página já abre
   com o piso se mexendo.
2. Toca mesmo com **Reduzir movimento** (iPhone) ou **Remover animações** (Android) ligado no aparelho, e as faixas de
   avaliações e projetos também andam. Antes, nesses casos, tudo ficava parado esperando o play. Os botões de pausa
   continuam lá para quem quiser parar.
3. **iPhone no modo de pouca bateria**, que bloqueia vídeo: o site troca o vídeo por uma imagem animada com o mesmo
   arquivo (o Safari toca MP4 dentro de `<img>`, como um GIF), e o topo abre rodando do mesmo jeito.
4. Se mesmo assim o aparelho bloquear (navegador de alguns apps no Android), o vídeo começa no primeiro toque na tela.
5. Os endereços dos vídeos e dos pôsteres foram para `?v=4`, para nenhum celular usar uma cópia velha guardada.

### Quinta rodada (16/10, à tarde): vídeo mais claro e outros serviços

Com o vídeo rodando no celular dele, o Gabriel pediu:

1. **"Os vídeos estão muito escuros, consegue deixar mais claro?"** A cor do vídeo ficou clara e natural, mais perto das
   fotos dele, e a camada escura por cima ficou bem mais leve; ela só escurece um pouco atrás do texto, e o texto ganhou
   uma sombra curta para continuar lendo bem. O topo ficou cerca de 65% mais claro. Nas páginas de serviço, que usam
   as fotos dele (claras, de paredes brancas), a camada continua como era, para o texto não sumir. Vídeos em `?v=5`.
   Ele disse "como nessa foto aqui", mas a foto não veio na conversa exportada.
2. **Uma aba "outros serviços"** (áudios 173 a 175): a empresa dele é a Black Rock Remodeling, e em vez de um segundo
   site ele quer, neste, uma aba com pintura, cozinha, banheiro etc. Feito: o item **Other services** no menu de cima, no
   menu do celular e no rodapé, um link no fim da seção de serviços da home e a página `other-services/`, com os três
   serviços (Kitchen remodeling, Bathroom remodeling, Painting), um cartão "Something else?", o passo a passo e os
   serviços de piso. O formulário ganhou as três opções. Fotos: as dele (o banheiro de Snohomish no topo e a cozinha
   da foto do Tile), sem banco de imagens. Os textos foram escritos por nós: ver a lista abaixo.

Ele também propôs pagar $300 pelo site com essa aba (antes, "2 sites por $300"); o Lucas respondeu "Pode ser claro!".

### Sexta rodada (16/10, fim da tarde): o texto dele para outros serviços

1. **O texto da página Other services veio dele** ("essa aí seria a introdução dessa página à parte"). A página agora
   abre com *More than flooring.* e a apresentação *Complete home remodeling services.* traz os parágrafos dele sem mudar
   nada, com a frase final em destaque. Os cartões passaram a ser a lista dele: pintura interna e externa, cozinha,
   banheiro, drywall, finish carpentry, portas e janelas, rodapés e guarnições, piso (leva aos 6 serviços de piso) e
   "And more.". As frases curtas de cada cartão são nossas. O bloco da home, o formulário, o rodapé e os dados para o
   Google seguem a mesma lista.
2. **Vídeo "pra mostrar bem o piso"** (áudio de 15:07, mandado antes de ele ver a rodada anterior, que já clareou o
   vídeo): a camada escura ficou mais leve também na parte de baixo, onde fica o piso, que ganhou de 10% a 12% de
   claridade. A nota do Google embaixo ganhou um fundo de vidro escuro, como o botão de pausa, para continuar legível.
   A foto de referência que ele cita ("a foto que eu te mandei ali em cima") deve ser uma das fotos dele de piso; ela
   não veio separada na conversa.

### Sétima rodada (16/10, 15:31): as fotos para outros serviços

O Gabriel mandou 6 fotos de serviços (*Exterior paint, Interior paint, Kitchen, Bathroom, Deck and fence, New
construction*) e 9 fotos de trabalhos com a cidade, e pediu (áudio de 15:36): "você coloca como se fosse lá na outra
parte, de LVP, laminada" e "bota lá, tipo, nossos trabalhos… com a cidade".

1. **Serviços com foto, no mesmo formato da home.** A página Other services ganhou a mesma lista da seção de serviços
   da home: no computador, a foto grande ao lado muda ao passar o mouse; no celular, cada serviço aparece com a foto.
   São seis: Exterior painting, Interior painting, Kitchen remodeling, Bathroom remodeling, Decks & fences (serviço
   novo, veio com a foto) e New construction (o "new construction finishing" do texto dele). O link de cada um leva ao
   formulário com o serviço já marcado; o formulário ganhou *Decks and fences* e *New construction finishing*.
2. **Our work: os trabalhos reais com a cidade**, na mesma faixa passando da home, com a foto ampliada ao clicar:
   Kirkland, Seattle, Lynnwood, Bothell, Seattle e Bellevue. Três fotos vieram repetidas em dois tamanhos (Seattle,
   Kirkland e Lynwood): entrou uma de cada, a maior. "Lynwood" ficou Lynnwood, como se escreve o nome da cidade.
3. O resto da lista dele (drywall, finish carpentry, portas e janelas, rodapés e guarnições) continua em cartões,
   numerados de 07 a 10 depois dos seis com foto, com Flooring (11) e "And more." (12).
4. A apresentação ficou só com o texto dele (título à esquerda, parágrafos à direita), sem a foto da cozinha, porque
   as fotos agora estão na lista logo abaixo. O link no fim dos serviços da home e os dados para o Google seguem a
   lista nova.

### Correção no iPhone (16/10, 16:52)

O Lucas mandou um print do iPhone com a lista de serviços quebrada: a descrição, as etiquetas (Solid, Engineered…) e
o link ficavam esticados, cada um com o triplo da altura, com vãos enormes entre eles. Era um defeito do motor do
Safari (WebKit) com o alinhamento pela linha de base (`align-items: baseline` no `.svc-body`) numa grade dentro de
outra grade: acontecia em todas as larguras comuns de iPhone (375 a 440 px), na home e na Other services, que são as
páginas com essa lista. No Chrome e no Android não aparecia.

- Correção: o bloco da descrição (`.svc-more`) passou a alinhar pelo topo, e a grade de abrir e fechar só existe
  no computador, onde há a animação.
- Como foi conferido: com o WebKitGTK 2.52 (o mesmo motor do Safari) e o Chrome, medindo cada elemento de todas as
  páginas em 375, 390, 402, 430 e 440 px (celular), 768 (tablet), 1024 e 1440 (computador). Antes, a lista de
  serviços saía até 6 vezes mais alta no WebKit; depois, as diferenças são só de uma linha de texto a mais ou a menos,
  normais entre navegadores. Menu do celular, FAQ aberto, foto ampliada, páginas de serviço e formulário também foram
  conferidos no WebKit.

### Oitava rodada (28 a 30/10): Google Search Console

O site foi para o `blackrockfloors.com` em 17/10 (o Lucas ligou o domínio pelo Cloudflare; o Gabriel pagou). Em 28/10
o Gabriel pediu ajuda para colocar o site no **Google Search Console** ("quero que o Google possa achar o meu site"):
pelo Wix não dá, porque o domínio aparece como gerenciado externamente. Ele também quer ter acesso ao domínio e ao
site, para não depender de ninguém no futuro.

- Ao conferir o domínio, apareceu um problema sério: o canonical, a prévia do link, o `sitemap.xml` e o `robots.txt`
  ainda apontavam para o endereço `.workers.dev`, que tem `noindex`. A última publicação tinha sido minutos antes de
  o domínio ser ligado, e o workflow procurava o endereço com www. Agora o endereço oficial é o sem www
  (`https://blackrockfloors.com`) e a publicação de 30/10 já saiu com ele.
- O passo a passo do Search Console e do acesso do Gabriel está em
  [Google Search Console e acesso do Gabriel](#google-search-console-e-acesso-do-gabriel).
- O Gabriel mandou a senha do Wix e códigos de acesso pelo WhatsApp (16/10). Vale ele trocar a senha do Wix.

## O que tem no site

**Página inicial** (`index.html`):

- **Faixa do topo** com "aberto agora / fechado agora" calculado pelo horário de Seattle, telefone, "Text us" e horário.
- **Painel com o vídeo de piso** (cantos arredondados, como o da Mastery Floors) e o texto no centro, como no anúncio que o Gabriel mandou: local entre linhas finas, *Floors done right the first time.* em serifada, 4 itens com ✓, botão branco *Get a free estimate* e o link *View our work ↓*. Embaixo, a nota do Google (4.9 · 137 reviews) e o botão de pausar. No celular, o vídeo é outro, em pé.
- **O fundador**, logo abaixo do topo: foto do Gabriel, a frase da missão, a bio do site antigo e, embaixo, os números do site antigo (6 serviços, 24h, 100%, 4.9).
- **Avaliações do Google passando** em duas faixas, em sentidos opostos. Param com o mouse em cima, dá para arrastar e tem botão de pausar.
- **Serviços** ("Every floor. One accountable crew."): lista dos 6 serviços, cada um com uma foto em que o piso ocupa a maior parte. No computador, ao passar o mouse, a foto grande ao lado muda. Cada serviço leva à sua página.
- **Projetos recentes passando**: fotos reais dos trabalhos do Gabriel, com o nome da cidade. Clicar abre a foto grande.
- **Why homeowners choose us** (os 4 itens do site antigo) e **How it works** (4 passos).
- **Área atendida**: as 18 cidades do site antigo, mais Snohomish, e um **mapa** com as cidades nas coordenadas reais, a divisa entre os condados e a montanha do logo a leste.
- **FAQ**: as 8 perguntas do site antigo, com respostas.
- **Contato** e **pedido de orçamento**: o formulário abre o e-mail (ou o SMS) já preenchido.
- **Rodapé** com a faixa "Trust the local experts." (do site antigo) e um desenho de tábuas com as emendas desencontradas.
- Barra fixa no celular (ligar, mandar texto, orçamento).

**Páginas de serviço** (uma por serviço, boas para o Google): `hardwood-floor-installation/`, `luxury-vinyl-plank/`,
`laminate-flooring/`, `tile-installation/`, `hardwood-floor-refinishing/` e `stair-treads/`. Cada uma tem o que está incluído
(com um cartão de orçamento grátis ao lado), "Good to know", o passo a passo, os projetos, perguntas próprias e o formulário
com o serviço já marcado.

**Other services** (`other-services/`): a "aba" de reformas da Black Rock Remodeling que o Gabriel pediu. Topo *More than
flooring.* com a foto do banheiro de Snohomish, a apresentação com o texto dele, os 6 serviços com as fotos dele (como
a lista de pisos da home; o link de cada um já marca o serviço no formulário), **Our work** com os trabalhos reais e a
cidade (clicar abre a foto grande), o resto da lista dele em cartões, o passo a passo, os 6 serviços de piso e o
formulário.

**Também:** página 404, prévia bonita do link no WhatsApp (`assets/img/og-image.jpg`), dados estruturados para o Google
(empresa, horários, área atendida, serviços, FAQ e trilha de navegação), `sitemap.xml` e `robots.txt` gerados na publicação.
Para quem ativou "reduzir movimento", as animações de entrada desligam; o vídeo e as faixas continuam (pedido do cliente),
com os botões de pausa.

**Testes (16/10, depois da sétima rodada):** Lighthouse no computador 100 em desempenho, acessibilidade, boas práticas
e SEO; no celular, 95 em desempenho na home e 92 na página Other services, 100 nos outros três. Zero problemas no teste de
acessibilidade (axe) em todas as páginas. Layout conferido também no motor do Safari (WebKit), do celular ao computador.

Identidade: logo vetorizado a partir do PNG que o Gabriel mandou. Preto **#0E0E0D**, osso **#EBE7E0** e o vermelho do "R"
da camisa dele, **#C8102E**. Fontes, dentro de `assets/fonts/`: **Cormorant Garamond** nos títulos (a serifada elegante
que o Gabriel pediu, só nos pesos usados, 500 e 450 itálico) e **Archivo** no resto (larguras variáveis; a versão larga, em
maiúsculas espaçadas, ecoa o "F L O O R S" do logo).

## Antes de mostrar ao Gabriel: o que é exemplo e precisa confirmar

- [ ] **Avaliações do Google**: as 8 que aparecem são **exemplos escritos por nós**. Troque pelas avaliações reais do perfil do Google dele antes de ligar o domínio (`index.html`, seção 3). Enquanto isso, a prévia `.workers.dev` não aparece no Google (`noindex`).
- [ ] **Link "Read them on Google"**: trocar pelo link do perfil do Google da empresa (Google Maps → Compartilhar).
- [ ] **Nota e quantidade**: 4.9 e 137 avaliações vieram do site antigo. Confirmar os números de hoje (aparecem na linha do Google no topo, nos números do fundador, na seção de avaliações, nas páginas de serviço e na `og-image.jpg`).
- [x] **Fotos dos projetos**: fotos reais dele, com a cidade de cada trabalho (16/10).
- [x] **Fotos dos serviços**: fotos reais dele (16/10).
- [ ] **Formulário direto no e-mail**: ele quer receber os pedidos no e-mail. Falta escolher o serviço de envio (veja [O formulário](#o-formulário)).
- [ ] **Vídeo do topo**: montado com 3 clipes gratuitos de piso, do Coverr e do Mixkit (veja [O vídeo do topo](#o-vídeo-do-topo)). Dá para trocar por filmagens dos pisos que ele instalou ou por um vídeo gerado por IA (prompts prontos em `tools/PROMPTS.md`).
- [ ] **Nome da empresa**: o logo e a camisa dizem *Black Rock Floors*; o site antigo e o e-mail dizem *Black Rock Remodeling LLC*. Ele contou (16/10) que a empresa é a Black Rock Remodeling e que a de pisos veio depois; a página Other services diz que a Black Rock Floors é a parte de pisos da Black Rock Remodeling LLC. Confirmar se quer o nome da LLC também no rodapé.
- [ ] **Página Other services**: a introdução, a lista de serviços e as fotos são dele (16/10); as frases de cada serviço, as etiquetas (Siding, Trim…) e o passo a passo foram escritos por nós: pedir para ele ler, principalmente se faz tudo o que está nas etiquetas.
- [ ] **Fotos dos 6 serviços de reforma**: parecem imagens geradas por IA (todas em 1536 × 1024, o tamanho padrão do ChatGPT; as fotos Refinish e Tile dos pisos também). Servem de ilustração do serviço, e por isso os trabalhos reais ficam separados, em *Our work*, com a cidade. Se ele tiver fotos reais desses serviços, é só trocar (mesmo nome de arquivo em `assets/img/other/services/` e um `?v=` no endereço).
- [ ] **Número de registro na L&I**: em Washington, a lei (RCW 18.27.100) pede o número de registro de empreiteiro na propaganda que mostra o nome da empresa, e o site conta como propaganda (vale confirmar com a L&I). Pedir o número e colocar no rodapé; também passa confiança.
- [ ] **E-mail** `br.remodelingwa@gmail.com`: confirmar que continua sendo o dele.
- [ ] **Respostas do FAQ** e **textos das páginas de serviço** (o que está incluído, prazos, mover móveis, tipos de acabamento): escritos por nós com base nas práticas comuns do mercado. Pedir para ele ler.
- [ ] **Números**: "6 services in-house", "24h quote turnaround", "100% free estimates" (do site antigo).
- [ ] **Cidades**: as 18 do site antigo e Snohomish. No print, as duas últimas ficaram cortadas: perguntar se falta alguma.
- [ ] **Horário**: seg a sex 8h–17h, sáb 9h–14h, domingo fechado (do site antigo).
- [ ] **Instagram, Facebook, Yelp…**: o site antigo não mostrava. Se ele tiver, dá para pôr no rodapé.

## Como editar

O conteúdo fica direto no HTML (é o que o Google lê). Cada seção do `index.html` tem um comentário em português com o número dela.

| O quê | Onde |
| --- | --- |
| Avaliações do Google | `index.html`, seção 3: cada `<article class="review">` é uma avaliação |
| Fundador e números | `index.html`, seção 2 |
| Projetos (foto e cidade) | `index.html`, seção 5: cada `<button class="project">`. Fotos em `assets/img/projects/` (720 × 900, WebP). Para mostrar também o tipo de serviço, ponha `<span class="project-service">Hardwood</span>` antes do nome da cidade |
| Textos dos serviços | `index.html`, seção 4, e o `tools/service-pages.py` (lista `SERVICES`), que gera a página de cada serviço |
| Página Other services | `tools/service-pages.py`: `OTHER_INTRO` (texto dele), `OTHER_SERVICES` (os 6 com foto), `OTHER_MORE` (os cartões), `OTHER_WORK` (trabalhos e cidades) e a função `other_page`. Fotos em `assets/img/other/` (`services/`: 4:5, em 640 e 819 px; `work/`: 720 × 900) |
| Menu, formulário, rodapé | No `index.html`; depois rode `python3 tools/service-pages.py` para as 7 outras páginas acompanharem (a `404.html` é à parte) |
| FAQ | `index.html`, seção 8, e também o bloco `FAQPage` no `<head>` (o Google lê esse) |
| Telefone, e-mail | Estão em todas as páginas: use "buscar e substituir" na pasta inteira (`4255434667`, `543-4667`, `br.remodelingwa@gmail.com`) e em `assets/js/app.js` (`PHONE`, `EMAIL`) |
| Horário | Texto nas páginas e `HOURS` no topo do `assets/js/app.js` (é ele que calcula o "Open now") |
| Cores e fontes | Topo do `assets/css/styles.css` |
| Vídeo do topo | `tools/make-hero-video.sh` (veja abaixo) |

Todas as fotos estão em WebP, já no tamanho certo. Ao trocar uma foto, mantenha o mesmo formato (4:5 para projetos e serviços).
**Trocou uma foto ou o vídeo mantendo o mesmo nome de arquivo?** Aumente o número do `?v=` no endereço dela (no `index.html`
e no `tools/service-pages.py`; hoje as fotos de serviço estão em `?v=4`, os vídeos e os pôsteres em `?v=5`): o
navegador guarda fotos e vídeos por uma semana, e sem isso quem já visitou o site continua vendo a versão antiga.

## O formulário

Hoje o botão *Send my request* abre o app de e-mail **do visitante** com o pedido já escrito para `br.remodelingwa@gmail.com`
(a constante `EMAIL` no topo do `assets/js/app.js`), e *or text it to us* abre o SMS para o telefone da empresa. O pedido só
chega se o visitante apertar "enviar" no app dele; quem não tem e-mail configurado no celular fica sem jeito de mandar.

Para o pedido cair direto no e-mail do Gabriel, o site precisa de um serviço que receba o formulário e repasse por e-mail.
Os dados de quem pede orçamento (nome, telefone, e-mail) passam por esse serviço, então a escolha é do Lucas e do Gabriel:

- **FormSubmit** (formsubmit.co): grátis e sem conta. No primeiro envio, chega um e-mail para o Gabriel com um botão
  "Activate Form"; depois disso, todo pedido chega na caixa dele.
- **Web3Forms** (web3forms.com): grátis até 250 pedidos por mês. O Gabriel gera uma chave com o e-mail dele no site deles.
- **Formspree** (formspree.io): grátis até 50 pedidos por mês, com painel para ver os pedidos. Precisa criar conta.

Com o serviço escolhido, é trocar o envio no `assets/js/app.js` (o trecho do formulário) e manter o e-mail/SMS como plano B.

## O vídeo do topo

Os arquivos em `assets/video/` saem do script `tools/make-hero-video.sh` (precisa de `ffmpeg`):

- 3 clipes só de piso, emendados com fusão e com um escurecimento rápido perto do fim, onde o loop volta para a primeira
  cena (14,6 s no total). O arquivo começa já com o piso na tela, no mesmo quadro do pôster;
- a mesma cor nos três: clara e natural, como as fotos do Gabriel (ele achou a primeira versão escura), com um tom quente
  e os brancos só um pouco mais baixos para a janela não estourar. A leitura do texto fica por conta da camada leve por
  cima (mais escura só atrás do texto) e da sombra do texto, no `assets/css/styles.css`;
- três versões: `hero-1080` (computador), `hero-720` (telas médias) e `hero-tall` (celular em pé), cada uma em **MP4**
  (toca em tudo, inclusive iPhone) e em **WebM** (para navegadores sem H.264). O site escolhe sozinho.

Clipes de hoje (uso comercial liberado, sem crédito obrigatório):

| Cena | Fonte | Licença |
| --- | --- | --- |
| Sol sobre piso de carvalho | [Coverr: A shadow on a wooden floor](https://coverr.co/videos/a-shadow-on-a-wooden-floor-04otusifny) (recortado para o sapato não aparecer) | Coverr License |
| Câmera passando pela sala vazia com piso de madeira | [Coverr: Empty room with a window](https://coverr.co/videos/empty-room-with-a-window-peegts0hp9) (recortado para o ventilador de teto não aparecer) | Coverr License |
| Veios da madeira de perto | [Mixkit: Detailed tour of the surface of a wooden board](https://mixkit.co/free-stock-video/detailed-tour-of-the-surface-of-a-wooden-board-34496/) | Mixkit Stock Video Free License |

Como o vídeo se comporta (o começo no script logo depois do `<video>` no `index.html`, o resto no `assets/js/app.js`):

- começa junto com a página; o primeiro quadro de cada vídeo é a imagem de abertura (`hero-poster`), então a troca não aparece;
- toca mudo, dentro da página, e só com o topo na tela; pausa quando a pessoa rola para baixo ou troca de app, e continua
  de onde parou na volta;
- escolhe a versão pelo formato da tela (em pé, celular deitado ou computador) e, ao girar o celular, troca do mesmo ponto;
- com economia de dados ligada, nunca baixa a versão de 1080;
- toca mesmo com "Reduzir movimento" ligado no aparelho (pedido do cliente); o botão no canto pausa;
- se o aparelho bloquear o vídeo (modo de pouca bateria do iPhone), mostra o mesmo MP4 dentro de uma `<img>`, que o Safari
  anima como um GIF; se nem isso der, começa no primeiro toque na tela.

O iPhone só toca vídeo se o servidor responder aos pedidos por pedaço (`Range`). No Cloudflare, quem faz isso é o
`worker.js` (veja [Publicar](#publicar)). Para testar no iPhone ou no Safari pelo computador, use o `npx wrangler dev`
(veja [Ver no computador](#ver-no-computador)): o `python3 -m http.server` não aceita esses pedidos.

**Para usar as filmagens do Gabriel** (ou um vídeo gerado por IA, com os prompts de `tools/PROMPTS.md`): grave clipes
deitados (de preferência 4K ou 1080p, câmera andando devagar rente ao piso), coloque em `tools/clips/`, troque a lista
`CLIPS` no começo do script (cada linha diz o arquivo, onde o trecho começa, quanto dura e onde recortar a versão em pé)
e rode `bash tools/make-hero-video.sh`.

## Publicar

O workflow `.github/workflows/deploy-black-rock-floors.yml` publica o site no Cloudflare a cada push que mexe em
`black-rock-floors/` (no `main` ou no branch `claude/practical-goldberg-vyf1zm`). Vai como **Worker** chamado
`blackrockfloors`, no mesmo esquema da The Berry Coffee, porque a conta já chegou ao limite de projetos do Cloudflare Pages.
No ar em <https://blackrockfloors.com> (o domínio do Gabriel) e, como prévia, em <https://blackrockfloors.lucassouzalima10.workers.dev> (o endereço também aparece no resumo de cada execução, em **Actions**).

- Usa o mesmo secret dos outros sites: `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, opcional).
- Na publicação, o workflow coloca o endereço completo no `og:image` (o WhatsApp exige), o `canonical` e o `og:url` em cada página, e gera o `sitemap.xml` e o `robots.txt`.
- O README, a pasta `tools/` e o `worker.js` não vão para o ar como arquivos.
- O `worker.js` é o script do Worker e só roda em dois casos (`run_worker_first` e `not_found_handling: "none"` no
  `wrangler.jsonc` que o workflow monta): nos vídeos, para entregar o pedaço que o navegador pede (`Range`), sem o qual
  o iPhone não toca o vídeo; e em endereços que não existem, para responder a página 404 **sem cache**. Isso importa
  logo depois de publicar: uma foto nova leva menos de um minuto para chegar a todos os servidores do Cloudflare, e
  antes disso responde "não encontrada"; com o cache de uma semana das fotos, quem abrisse o site nesse minuto ficaria
  com a foto quebrada por uma semana (aconteceu num teste em 16/10, só no navegador de teste). O resto do site sai
  direto dos arquivos, sem passar pelo script e sem contar no limite de pedidos do plano grátis. No fim, o workflow
  confere o vídeo (206) e a 404 (sem cache).
- No endereço `.workers.dev`, o site vai com `noindex` (arquivo `_headers`): o Google não indexa a prévia.

### O domínio do Gabriel: `blackrockfloors.com`

- **Registro:** no Wix, na conta do Gabriel (desde 12/10; renova em 11/10/2027). No Wix ele aparece como
  "Gerenciado externamente / Não atribuído a um site", e isso é o normal: o DNS está no Cloudflare.
- **DNS e hospedagem:** na conta do Cloudflare do Lucas (a mesma do genialup.com). Os *nameservers* foram trocados no
  Wix em 17/10, e o Lucas ligou `blackrockfloors.com` e `www.blackrockfloors.com` ao Worker `blackrockfloors` pelo
  painel (Workers & Pages → blackrockfloors → Settings → Domains & Routes). O deploy não mexe nesses domínios: o
  Wrangler só publica domínios que estejam no `wrangler.jsonc`, e o workflow não põe nenhum lá.
- **Endereço oficial:** `https://blackrockfloors.com`, sem www, que é o que o Gabriel e o Lucas usam. É o `FINAL_URL`
  do workflow: o canonical, o `og:url`, a prévia do link, o `sitemap.xml` e o `robots.txt` usam esse endereço. O www
  abre o mesmo site, com o canonical apontando para o sem www. O `.workers.dev` continua como prévia, com `noindex`.
- **E-mail:** o domínio não tem (nenhum registro MX). Se o Gabriel quiser um e-mail @blackrockfloors.com, o Cloudflare
  Email Routing encaminha de graça para o Gmail dele.

Recomendado no Cloudflare (precisa do login):

1. **SSL/TLS → Edge Certificates → Always Use HTTPS**: ligar. Hoje o endereço com `http://` também abre o site, sem
   levar para o `https://`.
2. **Rules → Redirect Rules**: levar o www para o endereço sem www (301). O canonical já resolve isso para o Google;
   o redirecionamento deixa o endereço da barra igual para todo mundo.

Para publicar de novo sem mudar nada: GitHub → **Actions → Deploy Black Rock Floors** → abra a última execução →
**Re-run all jobs**. O botão "Run workflow" não aparece porque o workflow não está no branch padrão do repositório.

### Google Search Console e acesso do Gabriel

O Gabriel tentou verificar o site no Search Console pelo Wix e não conseguiu, porque o DNS não está mais no Wix.
O jeito certo é uma **propriedade de domínio**, que cobre o domínio inteiro (com e sem www, http e https):

1. Gabriel, no Search Console: **Adicionar propriedade → Domínio** → `blackrockfloors.com` → copiar o registro TXT
   que o Google mostra (`google-site-verification=…`).
2. Lucas, no Cloudflare → `blackrockfloors.com` → **DNS → Records → Add record**: tipo **TXT**, nome **@**, conteúdo
   = o valor que o Google deu, TTL **Auto** → **Save**. Não apague esse registro depois: ele mantém a verificação.
3. Gabriel clica em **Verificar** (pode levar alguns minutos). Depois: **Sitemaps** →
   `https://blackrockfloors.com/sitemap.xml` → **Enviar**.

Outro jeito, sem mexer no DNS: propriedade **Prefixo do URL** (`https://blackrockfloors.com/`) com o método **Tag
HTML**. O Gabriel manda a tag `<meta name="google-site-verification" content="…">`, ela entra no `<head>` do
`index.html` e o site é publicado de novo.

**Acesso do Gabriel ao domínio:** no Cloudflare, **Members → Invite members** → e-mail do Gabriel → na permissão,
escolher só o domínio `blackrockfloors.com` e a função **Domain Administrator** → **Invite members**. Ele passa a
ver e mudar o DNS (e verificar o Search Console sozinho) sem acesso aos outros sites da conta. O registro do domínio
já é dele, no Wix.

## Ver no computador

```bash
cd black-rock-floors
python3 -m http.server 8000
# abra http://localhost:8000
```

Para ver do jeito que fica no Cloudflare, com o `worker.js` (precisa para o vídeo tocar no Safari e no iPhone), monte a pasta
como o workflow faz e rode o `wrangler dev`, a partir da raiz do repositório:

```bash
mkdir -p /tmp/brf && cp -R black-rock-floors/. /tmp/brf/_site && cp black-rock-floors/worker.js /tmp/brf/
rm -rf /tmp/brf/_site/README.md /tmp/brf/_site/tools /tmp/brf/_site/worker.js
cat > /tmp/brf/wrangler.jsonc <<'EOF'
{ "name": "blackrockfloors", "main": "./worker.js", "compatibility_date": "2025-10-01",
  "assets": { "directory": "./_site", "binding": "ASSETS", "not_found_handling": "none",
              "html_handling": "auto-trailing-slash", "run_worker_first": ["/assets/video/*"] } }
EOF
cd /tmp/brf && npx wrangler@4 dev --ip 0.0.0.0 --port 8787
# abra http://localhost:8787 (ou, no celular na mesma rede, http://<ip do computador>:8787)
```

## Estrutura

```
black-rock-floors/
├── index.html                       página inicial
├── <serviço>/index.html             6 páginas de serviço
├── other-services/index.html        reformas: pintura, cozinha, banheiro, deck e cerca, construção nova (a "aba" de outros serviços)
├── 404.html                         página "não encontrada"
├── _headers                         cabeçalhos do Cloudflare (noindex na prévia, cache)
├── worker.js                        Worker: vídeos por pedaço (para o iPhone tocar) e a 404 sem cache
├── assets/css/styles.css            visual (cores e fonte no topo)
├── assets/js/app.js                 comportamento (vídeo, faixas, menu, mapa, formulário)
├── assets/fonts/                    fontes (Archivo e Cormorant Garamond)
├── assets/img/                      logo (SVG), favicon, og-image, fotos de serviços, projetos e outros serviços, tábuas
├── assets/video/                    vídeo do topo (MP4 e WebM) e o primeiro quadro
├── tools/make-hero-video.sh         monta o vídeo do topo a partir dos clipes
├── tools/service-pages.py           gera as páginas de serviço e a Other services a partir do index.html
└── tools/PROMPTS.md                 prompts para gerar clipes de piso por IA
```

Créditos: fontes Archivo e Cormorant Garamond (SIL Open Font License); fotos dos serviços e dos projetos, logo e foto do
Gabriel enviados por ele; clipes do vídeo do [Coverr](https://coverr.co/license) (Coverr License) e do [Mixkit](https://mixkit.co/license/)
(Mixkit Stock Video Free License).
