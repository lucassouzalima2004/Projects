# Punto Pizza Verona · site

Site novo da **Punto Pizza**, pizzaria de entrega e retirada do **Carlos** em Verona (Itália), na Via Albere 117.
O site é em italiano, porque o público é de Verona. É HTML, CSS e JavaScript puros: sem build. A única biblioteca é a
[Lenis](https://github.com/darkroomengineering/lenis) (rolagem suave), que fica dentro do projeto em `assets/js/vendor/`.

## O pedido

Pela conversa no WhatsApp e pelos áudios de 14/10:

- O Carlos já tem um site que ele mesmo montou (<https://puntopizzaverona.it>), mas "é bem simples e não dá a imagem que eu gostaria".
- As agências de lá só querem fechar pacote completo (tráfego, propaganda, SEO). Ele quer **só o site, bonito e funcional**.
- É pizzaria **com delivery**. Instagram: <https://instagram.com/puntopizzaverona>.
- Perguntou se o site é de uma página só ou de várias: combinamos **várias páginas**.
- Combinado: a primeira prévia vai quase pronta, em até 2 dias. Ele paga os R$ 1.000 quando aprovar a prévia, antes dos ajustes finais.
  **Aprovado e pago em 17/10**, depois da v3 ("Se faz essas melhorias, fechou").

Depois da primeira prévia (15/10):

- **"Você tá pegando o menu do Just Eat? Não consegue fazer pela minha app?"** Ele mandou o menu completo do app:
  <https://wbpp.it/s/?vNtG>. O menu do site agora é o do app: os mesmos 60 itens, nomes, descrições, preços, selos e fotos.
- **"O logo tem como deixar o meu original? Só um em toda parte?"** Agora há um logo só (`assets/img/logo.svg`, vermelho e grafite,
  sem o "VERONA"), igual em todas as páginas, no rodapé e na prévia do WhatsApp. O cabeçalho e o rodapé são claros (agora areia clara) para ele aparecer como é.
- **"E usa essa pizza na parte inicial"**: a margherita da foto que ele mandou está no topo (na v2 abria o vídeo; agora gira à direita do texto) e ganhou uma seção logo abaixo
  (é a *La Margherita Come Si Deve* do app).

E o Lucas pediu (v2): topo novo com **vídeo**, informações **centralizadas**, **fotos reais** no lugar dos desenhos, mais **animações**,
o mais **fluido** possível e mais **profissional**.

Depois da v2 (áudio de 17/10), o Carlos **não gostou do topo com vídeo** e pediu algo diferente e melhor:

- A primeira versão "animava mais"; a segunda ficou "mais frouxa". O vídeo atrás do texto confunde: "não se entende nada".
- **Texto à esquerda, menor, e a pizza à direita, girando como antes**, mas **a margherita dele**. Feito: o vídeo saiu e a
  margherita da foto dele gira num prato inclinado, com folhas de manjericão flutuando (veja [A pizza que gira no topo](#a-pizza-que-gira-no-topo)).
- "Meio **branco demais**, parece hospitalar": quer **cor de areia, areia de mar, mais escurinha**. O fundo do site todo agora é areia,
  com faixas alternadas mais escuras; os cartões são areia clara. Só o logo da AIC e o QR code ficam em branco.
- Na parte do senza glutine, **o logo da AIC e o texto dele**, palavra por palavra (página Senza glutine, logo abaixo do topo,
  e um selo na faixa do senza glutine da home).

Ainda em 17/10, olhando a v3:

- "Aqui falta o **Carbone vegetale con cereali**": a massa entrou nos cartões de massas do topo do menu (agora são 4, em duas colunas)
  e nas outras frases que listam as massas (home e menu).
- A foto de perto da Margherita ("acho muito feio, não se entende nada") virou a **foto inteira** da pizza.
- O "−5 €" dos botões estava sendo entendido como desconto em todo pedido: agora todo "−5 €" diz **"sul primo ordine"**
  (botões do topo da home, do menu e da consegna, barra fixa do celular e o título "Scarica l'app: −5 € sul primo ordine").
- "Esse texto aqui é errado em italiano": o texto do topo da página Senza glutine agora é **o texto que ele mandou**, palavra por palavra
  (dois parágrafos: "Chi è celiaco o deve evitare il glutine..." e "Nasce in un laboratorio dedicato..."). O título "Un laboratorio
  tutto suo" da mesma página virou "Un laboratorio dedicato", como ele escreve.
- "Teu tradutor tá fazendo mal o trampo": os 4 cartões de "Come la prepariamo" e o aviso para celíacos da página Senza glutine
  agora têm **o texto que ele mandou** (com **forno dedicado**, confirmado por ele). Aproveitando, foram reescritas em italiano mais natural
  algumas frases que soavam traduzidas: a introdução dos cartões, o método da home ("Lasciamo lievitare...", "Ingredienti di qualità",
  "vieni a ritirarla"), o título "Tre passi e la pizza è da te", a primeira pergunta frequente do senza glutine e duas frases do "Chi siamo".
- Por último (17/10, 18:14–18:51), ele mandou **o texto em italiano de quase todo o site**, que entrou palavra por palavra:
  o topo da home ("Pizza a domicilio a Verona" / "La pizza fatta come si deve." e dois parágrafos), a faixa do senza glutine
  ("La libertà di scegliere la tua pizza..." e três itens com título), os 4 passos do método, os 3 passos de "Ordinare è facile"
  (agora com rótulos "01 · Scarica l'app..."), os cartões das 4 massas no menu, os dois jeitos de pedir na consegna (app e telefono),
  as perguntas frequentes da consegna (6) e do senza glutine (4) e a chamada final do senza glutine ("Una pizza per tutti. Senza rinunce.").
- **"Esse aqui de Just Eat elimina"**: o Just Eat saiu do site todo (cartão da consegna, linha da home, nota do menu, descrição para o Google).
- As **zonas de entrega** agora são as que ele listou (Santa Lucia, Golosine, Borgo Milano, San Massimo, Borgo Nuovo, Borgo Roma,
  Madonna di Dossobuono, Dossobuono, Caselle, Borgo Venezia e Porto San Pancrazio, e algumas áreas vizinhas). Como isso vai muito
  além dos CAP 37137 e 37138 que vinham do Just Eat, a **verificação por CAP saiu**: o site mostra as zonas e, como ele escreveu,
  manda conferir o endereço no app antes de pedir (ou ligar).

Em 18/10 ele mostrou o site para a **responsável da AIC**, que pediu três mudanças (entraram palavra por palavra):

- A seção da AIC agora diz **"Programma AFC"** e "Punto Pizza aderisce al programma AFC (Alimentazione Fuori Casa) dell'Associazione
  Italiana Celiachia…", em dois parágrafos. Para ficar igual, o nome do programa foi trocado também no selo da home, nas duas
  perguntas frequentes que falam dele, na descrição da página para o Google e nos dados estruturados.
- O cartão "Ingredienti e attrezzature dedicati" virou **"Ingredienti, attrezzature e procedure dedicate"**, com o texto novo.
- O aviso para celíacos virou **"Hai bisogno di informazioni?"** ("Per qualsiasi dubbio o esigenza… Chiamaci allo 045 862 2340 prima di ordinare…").

E pediu para **tirar o preço da etiqueta da Margherita no topo** (agora: "San Marzano DOP e fiordilatte"). O preço continua
na seção da Margherita e no menu.

## O que tem no site

**Home** (`index.html`):

1. **Topo**: fundo escuro e quente; à esquerda, "aperto ora / chiuso" pelo horário de Verona, o título
   "Pizza a domicilio a Verona, *fatta come si deve*." entrando palavra por palavra, os botões **Ordina ora · −5 € sul primo ordine** e
   **Sfoglia il menu**, a nota do Google e os diferenciais. À direita, **a margherita do Carlos girando** num prato inclinado,
   com três folhas de manjericão flutuando, o selo **−5 € sul primo ordine dall'app** e a etiqueta da *Margherita Come Si Deve* (leva à seção dela).
   No celular, a pizza fica em cima e o texto embaixo.
2. Faixa vermelha correndo com os diferenciais (impasto 24 ore, San Marzano DOP, fiordilatte artigianale...).
3. **La Margherita come si deve**: a foto inteira da pizza do Carlos, com o fundo original, os 4 ingredientes do app e o preço.
4. **Le nostre pizze**: carrossel com 12 pizzas e as **fotos reais do app** (dá para arrastar com o mouse, usar as setas ou o dedo), com os selos do app (Novità, Eccellenza, Più venduto...).
5. **Fatta come si deve**: o método em 4 passos; no computador a foto da esquerda fica parada e troca conforme o passo que está na tela.
6. **Senza glutine. Con tutto il resto.**: o selo da **AIC Alimentazione Fuori Casa**, a pizza Luna recortada e a avaliação da Ilaria por cima.
7. **Como pedir em 3 passos**, os botões da App Store e do Google Play e o **QR code** do app para quem está no computador.
8. **Avaliações em duas faixas que correm** em sentidos opostos (param com o mouse em cima) e a nota 4,6 contando.
9. **Horários** (o dia de hoje marcado), **"Consegniamo da te?"** (as zonas de entrega) e endereço.
10. Chamada final vermelha "Hai fame?" com duas pizzas flutuando.

**Menu** (`menu/`): o menu do app com **foto de cada item**: Pizze classiche (31), Le nostre specialità (8), Pizze baby (4),
Fritti, Bibite e Birre. No topo, as 4 massas (classico, integrale, carbone vegetale con cereali e senza glutine). Abas fixas com a "pílula" que desliza até a seção da tela, filtros (**Consigliate**, Vegetariane, Piccanti),
busca por ingrediente ("porcini", "bufala"...) e o botão **"Scegli per me"**, que sorteia uma pizza e gira a foto.
No computador são cartões com foto grande; no celular, linhas com a foto ao lado, como num app de delivery.

**Senza glutine** (`senza-glutine/`): logo da **AIC** com o texto do Carlos sobre o programma Alimentazione Fuori Casa, como preparam, aviso para celíacos, avaliações de clientes celíacos, as duas cervejas sem glúten do app e perguntas.

**Consegna e ritiro** (`consegna/`): as 2 formas de pedir (app e telefone), as zonas de entrega, retirada, horários e perguntas.

**Chi siamo e contatti** (`contatti/`): "Punto Pizza, da Carlos", contatos, horários e o **mapa do Google só quando a pessoa clica**
(antes disso o Google não coloca cookies).

**Em todo o site:**

- **Rolagem suave** (Lenis) e **transição suave entre as páginas** (navegadores que suportam, como Chrome, Edge e Safari recentes).
- Seções que entram ao rolar, títulos palavra por palavra, pizzas recortadas flutuando e girando com a rolagem, botões que
  "puxam" levemente o mouse, cards que sobem ao passar o mouse e fotos que giram de leve.
- Tudo desliga sozinho para quem ativou "reduzir movimento" no celular ou no computador.
- Barra fixa no celular (Ordina ora, com "−5 € sul primo ordine dall'app" embaixo / Chiama), página 404, prévia bonita no WhatsApp (`assets/img/og-image.jpg`), dados para o Google
  (pizzaria, horários, menu com preços e fotos, perguntas, trilha), `sitemap.xml` e `robots.txt` gerados na publicação.

**Testes (18/10, depois dos textos do Carlos):** Lighthouse no computador 100 em desempenho, acessibilidade, boas práticas e SEO;
no celular, 91 (home) e 95 (consegna) em desempenho e 100 nos outros três. Zero problemas no teste de acessibilidade (axe) em todas
as páginas, no celular e no computador. Sem rolagem lateral em nenhuma página (360, 390 e 1440 px). A página não "pula" enquanto
carrega (CLS 0,0003 no computador e 0,014 no celular, com internet lenta).
Testados também: a pizza girando e a etiqueta que leva à Margherita, o celular baixando a imagem menor, carrossel (setas e arrastar),
filtros, busca, "Scegli per me", abas, as zonas de entrega, nenhum link para o Just Eat, menu do celular, barra fixa, o mapa e os
93 links internos, sem erros de JavaScript.

### Identidade

- **Logo**: o original dele, vetorizado (vermelho **#DA0014** e grafite **#3A3A3A**), um só arquivo em todo o site. O favicon é o "P" do logo.
- O **"punto"** (a bolinha vermelha do i de "Pizza") fecha os títulos e marca o item ativo do menu.
- Cores: vermelho do logo, preto quente das fotos do menu (#0C0A09), **areia** no fundo (#E8DAC3, faixas em #DCCAAB, cartões em #F6EFE3)
  e o dourado dos cartazes dele (#EDB94A).
- Fontes: **Bricolage Grotesque** (títulos condensados e textos) e **Instrument Serif** itálico nos destaques, dentro de `assets/fonts/`.

## Antes de mostrar ao Carlos: o que confirmar

- [ ] **Marca d'água na margherita**: a foto que ele pediu para o topo (a mesma da *Margherita Come Si Deve* no app) tem uma **marca d'água fraca de banco de imagens** no meio. Na pizza girando ela quase não aparece (e na foto inteira da seção da Margherita aparece de leve no centro), mas a foto pode não ser dele. Se for de banco de imagens, ele precisa da licença ou de uma foto própria. Vale perguntar; se ele mandar outra foto, veja [A pizza que gira no topo](#a-pizza-que-gira-no-topo).
- [ ] **AIC**: confirmar que a adesão ao programa Alimentazione Fuori Casa está em dia e que ele pode usar o logo da AIC no site (o logo foi vetorizado da imagem que ele mandou; se a AIC mandou o arquivo oficial, melhor usar esse).
- [ ] **"Única pizzaria delivery de Verona na AIC"**: ele disse isso no áudio, mas **não está no site**. Uma frase de "única" precisa ser verdade e dá para conferir na lista de locais da AIC (app AiC Mobile). Se ele confirmar, dá para acrescentar.
- [x] **Massas**: classico, integrale, ai cereali con carbone vegetale e senza glutine, com os textos do Carlos.
- [ ] Ainda sobre as massas: o menu do app não mostra as massas por item. Todas as pizzas aceitam as 4 massas? Tem acréscimo?
- [x] **Senza glutine**: o texto dos cartões (espaço dedicado, ingredientes e utensílios, **forno dedicado**) e o aviso para celíacos são do próprio Carlos (17/10).
- [x] Pizzas normais e sem glúten no mesmo pedido: sim (resposta do próprio Carlos na pergunta frequente).
- [ ] **Horário**: terça a domingo 17:00–21:30, segunda fechado (do site antigo). Confirmar.
- [x] **Zona de entrega**: as zonas que o Carlos listou (17/10). Falta saber: tem taxa de entrega e pedido mínimo? (hoje o site não fala disso)
- [ ] **Fotos do método** (massa, farinha, molho): são quadros de clipes gratuitos do Mixkit, não da cozinha dele. A pizza de mortadela do passo 4 é dos anúncios dele, mas não está no menu do app. Se ele mandar vídeos ou fotos da cozinha, troca.
- [ ] **Promoção de 5 €** no primeiro pedido pelo app: continua valendo?
- [ ] **Nota do Google**: "4,6 · più di 340 recensioni" (do banner dele). Atualizar quando ligar o domínio.
- [ ] **Avaliações**: as 6 são reais, do banner de avaliações do site antigo; sobrenomes abreviados.
- [ ] **"Chi siamo"**: texto curto feito só com o que sabemos. Pedir a história dele e, se quiser, uma foto dele.
- [ ] **Facebook** `facebook.com/puntopizzadaCarlo` (de um guia para celíacos) e **Instagram** `@puntopizzaverona`: confirmar.
- [ ] **Formas de pagamento** e **WhatsApp**: não estão no site. Perguntar se quer.

## Como editar

O conteúdo fica direto no HTML (é o que o Google lê).

| O quê | Onde |
| --- | --- |
| Itens do menu (nome, descrição, preço, selos) | `menu/index.html`: cada `<li class="dish">` é um item; `data-tags` diz em quais filtros ele aparece (`top`, `veg`, `hot`). No `<head>`, o bloco `"@type": "Menu"` tem os preços para o Google: atualize junto |
| Fotos do menu | `assets/img/menu/<nome>.webp` (600 × 600) e `<nome>-300.webp` (300 × 300), vindas do app |
| Pizzas do carrossel da home | `index.html`, seção 3: cada `<li class="card">` |
| A Margherita em destaque | `index.html`, seção 2 |
| Horário | `CONFIG.hours` no topo do `assets/js/app.js` (calcula o "Aperto ora"), as tabelas `class="orari"`, o rodapé e o `openingHoursSpecification` no `<head>` da home e do contatti. Buscar `17:00` na pasta toda |
| Telefone | Buscar e substituir: `045 862 2340` e `390458622340` |
| Zonas de entrega | As listas `class="zones"` (`index.html` e `consegna/index.html`), a pergunta "In quali zone consegnate?" (texto e bloco `FAQPage` no `<head>` da consegna) e o `areaServed` no `<head>` da home |
| Link do app (pedido com −5 €) | Buscar `url.velocissimo.app/o/157`. Lojas: `apps.apple.com/it/app/punto-pizza` e `it.webapp.puntopizza` |
| Avaliações | `index.html`, seção 7 (cada faixa repete a lista para correr sem fim: mude nas duas `<ul>`), e `senza-glutine/index.html` |
| Texto e logo da AIC | `senza-glutine/index.html`, seção `id="aic"` (o texto é o do Carlos), o selo `class="aic-chip"` na home e o logo em `assets/img/aic.svg` |
| Perguntas frequentes | `senza-glutine/` e `consegna/`: cada `<details>` e o bloco `FAQPage` no `<head>` |
| Pizzas recortadas que flutuam | `assets/img/cut/` (fundo transparente, recortadas das fotos do app) |
| Cores, fontes e animações | `assets/css/styles.css` (cores e fontes no topo) e `assets/js/app.js` |

Quando o Carlos mudar o menu no app, dá para pedir ao Claude para "sincronizar o menu do site com o app" (o link é o de cima):
ele lê o menu do app, baixa as fotos novas e refaz `menu/index.html`.

## A pizza que gira no topo

A pizza do topo é a foto da margherita que o Carlos mandou (`tools/src/margherita-carlos.jpg`). Como a foto foi tirada de lado,
o script `tools/make-hero-pizza.py` acha a borda da pizza, "endireita" a imagem até virar um círculo visto de cima e recorta o fundo
(`assets/img/hero/margherita-spin.webp` e a versão menor `-560`). No site, o CSS inclina o prato de novo e gira só a pizza
(uma volta a cada 48 s, mais um pouco com a rolagem), como num prato giratório. As folhas de manjericão (`assets/img/hero/basilico-*.webp`)
são recortes da mesma foto.

**Para trocar a foto:** uma pizza inteira, de cima ou levemente de lado, sobre fundo escuro, com a pizza toda dentro da foto. Coloque em
`tools/src/`, rode `python3 tools/make-hero-pizza.py tools/src/<foto>.jpg` dentro de `punto-pizza/` (precisa de `numpy`, `scipy` e `pillow`)
e confira o resultado.

O vídeo da v2 saiu do site (e com ele o script do vídeo e o `worker/` que servia o vídeo para o Safari). Se um dia quiserem de volta,
está no histórico do Git, no commit `0386a17`.

## Publicar

O workflow `.github/workflows/deploy-punto-pizza.yml` publica o site no Cloudflare a cada push que mexe em `punto-pizza/`
(no `main` ou no branch `claude/inspiring-gates-bp5orb`). Vai como **Worker** chamado `puntopizza`, no mesmo esquema da
Black Rock Floors, porque a conta já chegou ao limite de projetos do Cloudflare Pages.
No ar em <https://puntopizza.lucassouzalima10.workers.dev> (o endereço também aparece no resumo de cada execução, em **Actions**).

- Usa o mesmo secret dos outros sites: `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, opcional).
- Na publicação, o workflow coloca o endereço completo no `og:image` (o WhatsApp exige), o `canonical` e o `og:url` em cada página, e gera o `sitemap.xml` e o `robots.txt`.
- O README e a pasta `tools/` não vão para o ar.
- No endereço `.workers.dev`, o site vai com `noindex` (arquivo `_headers`): a prévia não concorre no Google com o site atual dele.

### Ligar o domínio do Carlos (`puntopizzaverona.it`)

Hoje o domínio aponta para o site que ele montou numa plataforma de funis (LeadConnector/HighLevel).
Consulta pública de 20/10: o domínio está na **Register.it** (nameservers `ns1.register.it` e `ns2.register.it`) e o **e-mail
também é da Register.it** (MX `10 mail.register.it`). Há ainda dois registros TXT: o SPF `v=spf1 include:spf.webapps.net ~all`
e a verificação do Google (`google-site-verification=...`). Esses três **precisam continuar existindo** depois da troca,
senão o e-mail dele para de funcionar e o Search Console perde a verificação.

O site é um Worker do Cloudflare, e um Worker só recebe um domínio próprio quando o domínio está no Cloudflare. Por isso a troca
é de *nameservers*, e não um registro A/CNAME na Register.it.

O workflow já cuida da parte do Cloudflare que dá para automatizar. A cada execução ele confere o domínio e escreve no
**resumo da execução** (Actions → Deploy Punto Pizza → a última execução) em que pé está:

1. **No Cloudflare: Add a domain** com `puntopizzaverona.it` (plano Free). Na lista de registros que o Cloudflare importa,
   confira que estão lá o **MX `mail.register.it`** e os **dois TXT** acima; se faltar algum, crie igual. Os registros A/CNAME
   do site antigo podem ficar: assim o site antigo continua no ar até a troca, e o workflow os substitui na hora de ligar o novo.
2. **Rode o workflow** (Actions → Deploy Punto Pizza → Run workflow). O resumo mostra os **dois nameservers do Cloudflare**:
   é isso que se manda ao Carlos, para trocar `ns1/ns2.register.it` no painel da Register.it (ou faça você, com o acesso dele).
3. Quando a troca pegar (o Cloudflare manda e-mail e o domínio fica *Active*; pode levar de minutos a algumas horas),
   **rode o workflow de novo**. Ele liga `puntopizzaverona.it` e `www.puntopizzaverona.it` ao site e passa a usar
   `https://puntopizzaverona.it` no canonical, no sitemap e na prévia do WhatsApp. O site antigo também usava o endereço sem
   `www`, então o Google não perde nada.
   - Se aparecer erro de permissão, o token do Cloudflare precisa também de **Zone → Workers Routes → Edit** e **Zone → DNS → Edit**
     (ou ligue à mão: Workers & Pages → puntopizza → Settings → Domains & Routes → Add → Custom domain).
4. No Google Search Console (a verificação do domínio continua valendo pelo TXT), envie `https://puntopizzaverona.it/sitemap.xml`.
   No Perfil da Empresa no Google, confira que o link do site é esse.

Para usar outro endereço no canonical (por exemplo, com `www`), crie a variável `PUNTOPIZZA_SITE_URL` em
Settings → Secrets and variables → Actions → Variables.

## Ver no computador

```bash
cd punto-pizza
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

```
punto-pizza/
├── index.html                    home
├── menu/index.html               menu completo (do app)
├── senza-glutine/index.html      sem glúten
├── consegna/index.html           entrega e retirada
├── contatti/index.html           quem somos e contatos
├── 404.html                      página "não encontrada"
├── _headers                      cabeçalhos do Cloudflare (noindex na prévia, cache)
├── assets/css/styles.css         visual (cores e fontes no topo)
├── assets/js/app.js              horário, rolagem, animações, carrossel, filtros, mapa
├── assets/js/vendor/lenis.min.js rolagem suave (MIT)
├── assets/fonts/                 Bricolage Grotesque e Instrument Serif (só os caracteres usados)
├── assets/img/                   logo, logo da AIC, favicon, QR do app, og-image, a foto da Margherita
│   ├── hero/                     a margherita que gira no topo e as folhas de manjericão
│   ├── menu/                     fotos de cada item do menu (do app)
│   ├── cut/                      pizzas recortadas (fundo transparente)
│   └── scene/                    quadros de clipes do Mixkit, usados no "metodo"
└── tools/make-hero-pizza.py      gera a pizza do topo (fotos de origem em tools/src/)
```

Créditos: fontes Bricolage Grotesque e Instrument Serif (SIL Open Font License); Lenis (MIT); fotos do método tiradas de clipes do
[Mixkit](https://mixkit.co/license/) (Mixkit Stock Video Free License): [farinha na massa](https://mixkit.co/free-stock-video/a-chef-covering-dough-with-flour-1669/),
[sovando](https://mixkit.co/free-stock-video/hands-of-a-baker-kneading-a-dough-42467/),
[abrindo a pizza](https://mixkit.co/free-stock-video/chef-shaping-a-pizza-42469/) e
[molho](https://mixkit.co/free-stock-video/smearing-sauce-on-the-pizza-42474/); logo, fotos do menu e dos anúncios do próprio Carlos;
logo da AIC (Associazione Italiana Celiachia), usado como participante do programa Alimentazione Fuori Casa;
avaliações públicas do Google da pizzaria.
