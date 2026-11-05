# Black Rock Remodeling · site

Site da **Black Rock Remodeling** (antes Black Rock Floors), empresa de reformas e pisos do **Gabriel Olimpio** em
King & Snohomish County, Washington (EUA). O endereço continua sendo `blackrockfloors.com`.
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

### Nona rodada (02 a 05/11): de Floors para Remodeling

Combinado em 02 e 04/11: 500 pelo pacote, sem cobrança extra pela mudança, e prazo de uma semana para o site e o SEO
(05/11, então por volta de 12/11). O Gabriel mandou texto, um vídeo de 4 min passando pelo site, um desenho do topo e
prints de palavras-chave. Mais de 30 áudios de 31/10 e 02/11 eram de visualização única e não vieram no zip.

O que ele pediu e o que foi feito:

- **Marca:** a licença dele é da Black Rock Remodeling, então o nome mudou em todo o site. O logo é uma adaptação
  provisória (`tools/make-logo.py`): falta o arquivo original, se ele tiver.
- **Foco:** "60 a 70% em piso. O site tem que falar mais de piso, o SEO também" (áudio de 05/11). Por isso o nome é
  Remodeling, mas o título, o primeiro serviço, a faixa de tipos de piso e as páginas de cidade falam de piso.
- **Topo da home:** como o desenho dele: texto à esquerda, cozinha à direita, Licensed, Bonded, Insured e a nota do
  Google. O título é o da última mensagem dele ("Remodeling Services & Flooring Specialists in Seattle, WA"). O vermelho
  no "Seattle, WA" era só ilustrativo (05/11). Ele riscou de verde as duas linhas abaixo do texto, então elas saíram.
- **Foto do topo:** é um recorte do desenho dele (`assets/img/hero-kitchen*.webp`), no lugar do vídeo de piso. Falta
  escolher o **vídeo de cozinha**: se ele não tiver um, usar um clipe de banco de imagens.
- **Home = Other services:** a lista de serviços agora tem Flooring, cozinha, banheiro, pintura externa e interna, decks e
  cercas, e construção nova, e cada um abre uma página que explica o serviço. O endereço `/other-services/` redireciona
  para a lista (arquivo `_redirects`). "Before you choose flooring" traz os tipos de piso, como ele pediu.
- **Avaliações:** saiu a quantidade (137) e a nota em número em todo o site; ficaram as 5 estrelas com o Google, como ele
  escreveu em 02/11. **As faixas de avaliações continuam com os exemplos** até ele mandar os prints: veja a lista abaixo.
- **Cidades:** ele mandou 22 cidades num mapa (02/11) e 8 numa tabela (05/11). Foram feitas as 8 da tabela, mais as 4 de
  cozinha e banheiro da mesma mensagem. As outras entram depois, se ele confirmar; Lucas já tinha dito que entram no preço.
  Palavra-chave: "Flooring Contractor [cidade] WA" (a tabela), com "flooring installation" e "flooring company" no texto (o áudio de 02/11).
- **Páginas de piso:** ficaram, ligadas à nova `/flooring/`, porque a lista de SEO dele (05/11) pede LVP, hardwood, laminate e tile.
- **Formulário:** agora manda direto para o e-mail: veja [O formulário](#o-formulário). SMS de verdade ficou de fora por
  enquanto: custa por mês e exige registro de operadora nos EUA, que pode estourar o prazo.
- **Horário:** segunda a sábado, das 8h às 18h. Falta o **link do perfil do Google** (hoje o botão abre uma busca).

## O que tem no site

**Página inicial** (`index.html`):

- **Faixa do topo** com "aberto agora / fechado agora" calculado pelo horário de Seattle, telefone, "Text us" e horário.
- **Cabeçalho** com menu: Home, Services (lista), Our Work, Reviews, About, Service Area (lista de cidades) e Contact.
- **Topo** como o desenho do Gabriel: texto à esquerda e cozinha à direita.
- **O fundador**: foto do Gabriel, a frase da missão, a bio do site antigo e os números (6 serviços de piso, 24h, 100%, 5 estrelas no Google).
- **Avaliações do Google passando** em duas faixas, em sentidos opostos. Param com o mouse em cima, dá para arrastar e tem botão de pausar.
- **Serviços** ("Every project. One accountable crew."): 7 serviços com foto, cada um com link para a sua página.
- **Flooring specialists**: os 6 tipos de piso, cada um com link para a sua página.
- **Projetos recentes passando**: fotos reais dos trabalhos do Gabriel (pisos e reformas), com o nome da cidade. Clicar abre a foto grande.
- **Why homeowners choose us** (os 4 itens do site antigo) e **How it works** (4 passos).
- **More we do**: o resto da lista dele (drywall, carpintaria, portas e janelas, rodapés).
- **Área atendida**: as cidades e o **mapa**; as 8 cidades com página própria viram link.
- **FAQ** e **pedido de orçamento**, que chega direto no e-mail.
- **Rodapé** com a faixa "Trust the local experts.", os serviços e as cidades.
- Barra fixa no celular (ligar, mandar texto, orçamento).

**Páginas de serviço:** `flooring/` (geral, com os tipos de piso), os 6 tipos (`hardwood-floor-installation/`,
`luxury-vinyl-plank/`, `laminate-flooring/`, `tile-installation/`, `hardwood-floor-refinishing/`, `stair-treads/`) e as
reformas (`kitchen-remodeling/`, `bathroom-remodeling/`, `exterior-painting/`, `interior-painting/`, `decks-and-fences/`,
`new-construction/`). Cada uma tem o que está incluído, "Good to know", o passo a passo, os projetos, perguntas próprias e o
formulário com o serviço já marcado.

**Páginas de cidade:** `flooring-contractor-<cidade>-wa/` para Seattle, Bellevue, Kirkland, Lynnwood, Bothell, Everett,
Kenmore e Snohomish. Cada uma tem texto próprio (o Google trata páginas de cidade quase iguais como spam), os trabalhos
reais daquela cidade quando existem (Everett e Kenmore ainda não têm foto), perguntas próprias, links para as cidades vizinhas e
o formulário com a cidade preenchida. Mais `kitchen-remodeling-seattle/`, `bathroom-remodeling-seattle/`,
`kitchen-remodeling-bellevue/` e `bathroom-remodeling-kirkland/`.

Os textos ficam em `tools/service-pages.py` e `tools/pages_content.py`, e o HTML sai de `python3 tools/service-pages.py`.

**Também:** página 404, prévia bonita do link no WhatsApp (`assets/img/og-image.jpg`), dados estruturados para o Google
(empresa, horários, área atendida, serviços, FAQ e trilha de navegação), `sitemap.xml` e `robots.txt` gerados na publicação.
Para quem ativou "reduzir movimento", as animações de entrada desligam; o vídeo e as faixas continuam (pedido do cliente),
com os botões de pausa.

**Testes de 16/10, antes da nona rodada (ainda não refeitos com as páginas novas):** Lighthouse no computador 100 em desempenho, acessibilidade, boas práticas
e SEO; no celular, 95 em desempenho na home e 92 na página Other services, 100 nos outros três. Zero problemas no teste de
acessibilidade (axe) em todas as páginas. Layout conferido também no motor do Safari (WebKit), do celular ao computador.

Identidade: logo vetorizado a partir do PNG que o Gabriel mandou e adaptado para Remodeling na nona rodada. Preto **#0E0E0D**, osso **#EBE7E0** e o vermelho do "R"
da camisa dele, **#C8102E**. Fontes, dentro de `assets/fonts/`: **Cormorant Garamond** nos títulos (a serifada elegante
que o Gabriel pediu, só nos pesos usados, 500 e 450 itálico) e **Archivo** no resto (larguras variáveis; a versão larga, em
maiúsculas espaçadas, ecoa o "F L O O R S" do logo).

## Antes de mostrar ao Gabriel: o que é exemplo e precisa confirmar

- [ ] **Avaliações do Google**: as 8 que aparecem são **exemplos escritos por nós**. Precisam ser trocadas pelas reais antes de esta versão ir para o domínio (`index.html`, seção 3). Texto inventado apresentado como avaliação real é proibido pela FTC nos EUA. O Gabriel disse em 05/11 que manda os prints; **não apagar as faixas sem falar com ele** (em 17/10 ele reclamou quando elas saíram).
- [ ] **Link do perfil do Google**: trocar nos dois lugares em que aparece a busca `google.com/search?q=Black+Rock+Remodeling` (Google Maps → Compartilhar).
- [ ] **Nota**: o site mostra 5 estrelas e a palavra Google, sem número. Conferir no perfil dele se é isso mesmo. O site antigo dizia 4.9, ele escreveu "5 estrelas" e o desenho dele diz "5.0, 30+ Reviews".
- [ ] **Logo**: adaptação provisória, feita por nós. Trocar pelo arquivo dele, se tiver.
- [ ] **Vídeo de cozinha** no topo: falta escolher (veja a nona rodada).
- [ ] **Lista final de cidades**: 8 feitas; as outras do mapa dele dependem de ele confirmar.
- [ ] **Textos novos** (`tools/pages_content.py`): escritos por nós, com os bairros e os tipos de casa de cada cidade. O Gabriel precisa ler e dizer se atende mesmo cada lugar e se faz tudo o que está na lista de cada serviço. A página de Everett e a de Kenmore precisam de fotos.
- [ ] **Licensed, Bonded, Insured**: vieram do desenho dele. Confirmar no nome da Remodeling.
- [x] **Fotos dos projetos**: fotos reais dele, com a cidade de cada trabalho (16/10).
- [x] **Fotos dos serviços**: fotos reais dele (16/10).
- [ ] **Fotos dos 6 serviços de reforma**: parecem imagens geradas por IA (todas em 1536 × 1024, o tamanho padrão do ChatGPT; as fotos Refinish e Tile dos pisos também). Servem de ilustração do serviço, e por isso os trabalhos reais ficam separados, em *Our work*, com a cidade. Se ele tiver fotos reais desses serviços, é só trocar (mesmo nome de arquivo em `assets/img/other/services/` e um `?v=` no endereço).
- [ ] **Número de registro na L&I**: em Washington, a lei (RCW 18.27.100) pede o número de registro de empreiteiro na propaganda que mostra o nome da empresa, e o site conta como propaganda (vale confirmar com a L&I). Pedir o número e colocar no rodapé; também passa confiança.
- [ ] **E-mail** `br.remodelingwa@gmail.com`: confirmar que continua sendo o dele.
- [ ] **Respostas do FAQ** e **textos das páginas de serviço** (o que está incluído, prazos, mover móveis, tipos de acabamento): escritos por nós com base nas práticas comuns do mercado. Pedir para ele ler.
- [ ] **Números**: "6 services in-house", "24h quote turnaround", "100% free estimates" (do site antigo).
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

O botão *Send my request* manda o pedido para `/api/estimate`, no `worker.js`, que repassa por e-mail pela **Resend**, sem o
visitante precisar abrir o e-mail dele. O *reply to* já vem com o e-mail do cliente, e o assunto traz o serviço, a cidade e o nome.
O Worker tem um campo escondido e um tempo mínimo contra robôs e não guarda os pedidos. *or text it to us* continua abrindo o SMS.

**Para ligar (só falta isto):**

1. Criar a conta na [Resend](https://resend.com) e adicionar o domínio `send.blackrockfloors.com` (subdomínio, para não mexer no resto do e-mail do domínio).
2. Colocar no Cloudflare os registros de DNS que a Resend mostrar. Depois de publicar o DNS, clicar em verificar **uma vez só**: repetir reinicia a verificação.
3. Gerar a API key e guardar no Worker, na conta do Lucas: `npx wrangler@4 secret put RESEND_API_KEY --name blackrockfloors`.
4. Mandar um pedido de teste e conferir no e-mail do Gabriel.

Quem recebe (`MAIL_TO`) e o remetente (`MAIL_FROM`) ficam no workflow, em `vars`, e também no `tools/preview.sh`.

**Enquanto a chave não existir**, o `/api/estimate` responde 503 e a página abre o e-mail do visitante com o pedido já escrito,
como antes. Nada quebra, mas o pedido só chega se ele apertar enviar.

**Aviso no celular:** a notificação do Gmail resolve no começo. SMS de verdade (Twilio ou parecido) dá para somar no mesmo
`/api/estimate`, mas custa por mês e exige registro de operadora nos EUA.

## O vídeo do topo

**Desde a nona rodada, o topo da home não usa estes vídeos:** a foto da cozinha está no lugar, à espera do vídeo de cozinha. Para
voltar a ter vídeo, troque os clipes do script e devolva o `<video>` e o botão de pausa ao topo do `index.html` (estão no histórico do git).

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

**Cuidado:** push neste branch que mexa em `black-rock-floors/` publica direto em `blackrockfloors.com`. Para mostrar ao
Gabriel antes, use a prévia separada, que não mexe no domínio: `bash tools/preview.sh` publica em
<https://blackrock-remodeling-preview.lucassouzalima10.workers.dev> (com `noindex`), na conta do Lucas.

O workflow `.github/workflows/deploy-black-rock-floors.yml` publica o site no Cloudflare a cada push que mexe em
`black-rock-floors/` (no `main` ou no branch `claude/practical-goldberg-vyf1zm`). Vai como **Worker** chamado
`blackrockfloors`, no mesmo esquema da The Berry Coffee, porque a conta já chegou ao limite de projetos do Cloudflare Pages.
No ar em <https://blackrockfloors.com> (o domínio do Gabriel) e, como prévia, em <https://blackrockfloors.lucassouzalima10.workers.dev> (o endereço também aparece no resumo de cada execução, em **Actions**).

- Usa o mesmo secret dos outros sites: `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, opcional).
- Na publicação, o workflow coloca o endereço completo no `og:image` (o WhatsApp exige), o `canonical` e o `og:url` em cada página, e gera o `sitemap.xml` e o `robots.txt`.
- O README, a pasta `tools/` e o `worker.js` não vão para o ar como arquivos.
- O `worker.js` também recebe o formulário em `/api/estimate`. Fora isso, é o script do Worker e só roda em dois casos (`run_worker_first` e `not_found_handling: "none"` no
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

Para ver do jeito que fica no Cloudflare, com o `worker.js` (precisa para o vídeo tocar no Safari e no iPhone e para o formulário):

```bash
bash black-rock-floors/tools/preview.sh --dev
# abra http://localhost:8787
```

## Estrutura

```
black-rock-floors/
├── index.html                       página inicial
├── flooring/ e <tipo de piso>/      página geral de piso e os 6 tipos
├── <reforma>/                       cozinha, banheiro, pintura, decks e cercas, construção nova
├── flooring-contractor-<cidade>-wa/ 8 páginas de cidade
├── <reforma>-<cidade>/              4 páginas de cozinha e banheiro por cidade
├── 404.html                         página "não encontrada"
├── _headers                         cabeçalhos do Cloudflare (noindex na prévia, cache)
├── _redirects                       /other-services/ vai para a lista de serviços da home
├── worker.js                        Worker: formulário, vídeos por pedaço (para o iPhone tocar) e a 404 sem cache
├── assets/css/styles.css            visual (cores e fonte no topo)
├── assets/js/app.js                 comportamento (faixas, menu, mapa, formulário)
├── assets/fonts/                    fontes (Archivo e Cormorant Garamond)
├── assets/img/                      logo (SVG), favicon, og-image, foto do topo, fotos de serviços e projetos, tábuas
├── assets/video/                    vídeos de piso, fora de uso desde a nona rodada
├── tools/service-pages.py           gera as páginas a partir do index.html e dos textos
├── tools/pages_content.py           textos da página de piso, das reformas e das cidades
├── tools/make-logo.py               adapta o logo antigo para Remodeling
├── tools/og-image.html              imagem de compartilhamento do link
├── tools/preview.sh                 publica a prévia separada, ou testa no computador com --dev
├── tools/make-hero-video.sh         monta o vídeo do topo a partir dos clipes
└── tools/PROMPTS.md                 prompts para gerar clipes de piso por IA
```

Créditos: fontes Archivo e Cormorant Garamond (SIL Open Font License); fotos dos serviços e dos projetos, logo e foto do
Gabriel enviados por ele; clipes do vídeo do [Coverr](https://coverr.co/license) (Coverr License) e do [Mixkit](https://mixkit.co/license/)
(Mixkit Stock Video Free License).
