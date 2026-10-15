# Punto Pizza Verona · site

Site novo da **Punto Pizza**, pizzaria de entrega e retirada do **Carlos** em Verona (Itália), na Via Albere 117.
O site é em italiano, porque o público é de Verona. É HTML, CSS e JavaScript puros: sem build e sem dependências.

## O pedido

Pela conversa no WhatsApp e pelos áudios de 14/10:

- O Carlos já tem um site que ele mesmo montou (<https://puntopizzaverona.it>), mas "é bem simples e não dá a imagem que eu gostaria".
- As agências de lá só querem fechar pacote completo (tráfego, propaganda, SEO). Ele quer **só o site, bonito e funcional**.
- É pizzaria **com delivery**. Instagram: <https://instagram.com/puntopizzaverona>.
- Perguntou se o site é de uma página só ou de várias: combinamos **várias páginas**.
- Combinado: a primeira prévia vai quase pronta, em até 2 dias. Ele paga os R$ 1.000 quando aprovar a prévia, antes dos ajustes finais.

## O que tem no site

**Home** (`index.html`):

- **Topo** com a foto da pizza balançando de leve, o vapor subindo, o título "Pizza a domicilio a Verona, *fatta come si deve*." (a frase do site atual dele), o selo **−5 € no primeiro pedido pelo app**, nota do Google e os três diferenciais.
- No cabeçalho, **"Aperto ora · fino alle 21:30" / "Chiuso · apre domani alle 17:00"**, calculado pelo horário de Verona.
- Faixa vermelha correndo com os diferenciais dos cartazes dele (impasto 24 ore, farine selezionate...).
- **Qualche idea per stasera**: 6 pizzas do cardápio, cada uma com um **desenho gerado a partir dos ingredientes** (veja abaixo).
- **Fatta come si deve**: o método em 4 pontos, com a foto da pizza de mortadela dos anúncios dele.
- **Senza glutine. Con tutto il resto.**: o laboratório dedicado e a avaliação da Ilaria (filha celíaca).
- **Como pedir em 3 passos**, com os botões da App Store e do Google Play e um **QR code** para quem está no computador.
- **6 avaliações reais do Google** (do banner de avaliações do site atual).
- **Horários** (o dia de hoje marcado), **"Consegniamo da te?"** (a pessoa digita o CAP e o site responde) e endereço.
- Chamada final vermelha "Hai fame?".

**Menu** (`menu/`): o cardápio completo com **abas fixas** (Classiche, Speciali, Mono, Fritti, Bevande, Birre), os 3 impastos,
**filtros** (vegetarianas, picantes, brancas), **busca por ingrediente** ("bufala", "speck"...) e o botão **"Scegli per me"**,
que sorteia uma pizza, gira o desenho e diz "Stasera si va di Capricciosa!". Selos *Veg* e *Piccante* saem sozinhos dos ingredientes.

**Senza glutine** (`senza-glutine/`): como preparam (laboratório, ingredientes e utensílios separados, cozimento separado),
aviso para celíacos, avaliações de clientes celíacos e perguntas frequentes.

**Consegna e ritiro** (`consegna/`): as 3 formas de pedir (app, telefone, Just Eat), verificação do CAP, retirada, horários e perguntas.

**Chi siamo e contatti** (`contatti/`): "Punto Pizza, da Carlos", contatos, horários e o **mapa do Google só quando a pessoa clica**
(antes disso o Google não coloca cookies; bom para a lei de privacidade europeia).

**Também:** página 404 ("Questa pagina è finita come l'ultima fetta."), barra fixa no celular (Ordina −5 € / Chiama),
prévia bonita do link no WhatsApp (`assets/img/og-image.jpg`), dados estruturados para o Google (pizzaria, horários,
cardápio com preços, perguntas frequentes, trilha de navegação), `sitemap.xml` e `robots.txt` gerados na publicação.
As animações desligam sozinhas para quem ativou "reduzir movimento".

**Testes (15/10):** Lighthouse no computador 100 em desempenho, acessibilidade, boas práticas e SEO em todas as páginas;
no celular, 96–99 em desempenho e 100 nos outros três. Zero problemas no teste de acessibilidade (axe), no celular e no computador.
Sem rolagem lateral no celular. A página não "pula" quando as fontes carregam (CLS abaixo de 0,03 mesmo com internet lenta).

### Identidade

- **Logo** vetorizado a partir do PNG do site dele (`logo.svg` e, para fundo escuro, `logo-light.svg`; as versões `compact` não têm o "VERONA").
  O favicon é o "P" do logo com a bolinha vermelha.
- O **"punto"** (a bolinha vermelha do i de "Pizza") virou a marca do site: fecha os títulos, marca o item do menu e os marcadores.
- Cores: vermelho do logo **#D9000F**, escuro quente **#16110E** (forno), creme **#FAF5EC** (farinha) e o dourado dos cartazes dele **#EDB94A**.
- Fontes: **Bricolage Grotesque** (títulos condensados, como nos cartazes, e textos) e **Instrument Serif** itálico nos destaques.
  Ficam em `assets/fonts/`, sem Google Fonts (mais rápido e sem enviar dados ao Google).

### As pizzas desenhadas

Não há foto de cada pizza, então cada uma ganha um **desenho feito pelo próprio site a partir dos ingredientes escritos**:
molho de tomate ou base branca, mozzarella, salame, cogumelos, alcachofra, azeitonas, rúcula, burrata, *sfilacci di cavallo*...
Mudou os ingredientes no HTML, muda o desenho. O desenho de cada pizza é sempre o mesmo (depende do nome).
Ingrediente novo sem desenho fica só no texto; para desenhar, acrescente em `TOPPINGS` no `assets/js/app.js`.

## Antes de mostrar ao Carlos: o que confirmar

- [ ] **Preços**: vieram do cardápio do Just Eat (<https://punto-pizza-verona.it>). No Just Eat os preços costumam ser mais altos que no app e no balcão. Pedir os preços certos.
- [ ] **Cardápio completo**: o Just Eat pode não ter tudo. A pizza de mortadela, burrata e pistache dos anúncios dele, por exemplo, não aparece lá (no site ela só está na foto, sem nome). Pedir o cardápio do app.
- [ ] **Impastos**: integral e sem glúten servem para todas as pizzas? Tem acréscimo de preço? Há outros (ex.: sem lactose)?
- [ ] **"Cirio"** (Estiva, Luna, Svolta): é tomatinho (pomodorini Cirio)? O desenho mostra tomatinho cortado.
- [ ] **Friarielli e Salsiccia**: no Just Eat aparece só "friarielli e salsiccia", sem tomate nem mozzarella. Confirmar.
- [ ] **Horário**: usamos o do site atual dele, terça a domingo 17:00–21:30 e segunda fechado. O Just Eat diz entrega 18:30–21:30 e o Restaurant Guru diz até 22:00 no fim de semana. Confirmar.
- [ ] **Zona de entrega**: CAP 37137 e 37138 (do Just Eat). Pelo app ou telefone ele entrega mais longe? Tem taxa de entrega e pedido mínimo?
- [ ] **Senza glutine** (é informação de segurança para celíacos, confirmar tudo): "ingredientes e utensílios separados" e "cozimento/forno separado" vêm de avaliações de clientes; "laboratório dedicado" vem do site dele. Também: dá para misturar pizzas normais e sem glúten no mesmo pedido?
- [ ] **Promoção de 5 €** no primeiro pedido pelo app: continua valendo?
- [ ] **Nota do Google**: "4,6 · più di 340 recensioni" (do banner dele; o Restaurant Guru mostra 379). Atualizar quando ligar o domínio.
- [ ] **Avaliações**: as 6 são reais, do banner de avaliações do site atual. Os sobrenomes estão abreviados (Manuela M., Marco S.). Ver se ele prefere outras.
- [ ] **Fotos**: as duas fotos são dos anúncios dele (capricciosa e mortadela). A foto da margherita do site atual tem **marca d'água de banco de imagens** e não foi usada. Pedir fotos reais: pizzas saindo do forno, a loja, o Carlos e a equipe.
- [ ] **"Chi siamo"**: texto curto feito só com o que sabemos (pizzaria do Carlos, só retirada e entrega, clientes de anos, muitos celíacos). Pedir a história dele (desde quando, de onde vem a receita) para deixar mais pessoal.
- [ ] **Facebook**: usamos `facebook.com/puntopizzadaCarlo` (de um guia para celíacos). Instagram: `@puntopizzaverona`, o que ele mandou.
- [ ] **Formas de pagamento**: não estão no site. Perguntar (cartão no app, dinheiro na entrega?).
- [ ] **WhatsApp**: se ele quiser receber dúvidas pelo WhatsApp, dá para pôr o botão.
- [ ] **Alérgenos**: o site diz que a informação está disponível a pedido. Se ele tiver a tabela de alérgenos, dá para publicar.

## Como editar

O conteúdo fica direto no HTML (é o que o Google lê).

| O quê | Onde |
| --- | --- |
| Pizzas, ingredientes e preços | `menu/index.html`: cada `<li class="dish">` é um item. Na mesma página, o bloco `"@type": "Menu"` no `<head>` tem os preços para o Google: atualize junto |
| As 6 pizzas da home | `index.html`, seção 2 (comentário `<!-- 2. ... -->`) |
| Desenho de um ingrediente novo | `TOPPINGS` no `assets/js/app.js` |
| Horário | `CONFIG.hours` no topo do `assets/js/app.js` (é ele que calcula o "Aperto ora"), as tabelas `class="orari"` de cada página, o rodapé e o `openingHoursSpecification` no `<head>` da home e do contatti. Buscar `17:00` na pasta toda |
| Telefone | Buscar e substituir na pasta toda: `045 862 2340` e `390458622340` |
| CAP de entrega | `data-caps="37137 37138"` nos formulários (`index.html` e `consegna/index.html`), a lista `class="caps"` e as perguntas da página de consegna, e o `areaServed` no `<head>` da home |
| Link do app (pedido com −5 €) | Buscar `url.velocissimo.app/o/157`. Lojas: `apps.apple.com/it/app/punto-pizza` e `it.webapp.puntopizza` |
| Avaliações | `index.html`, seção 6, e `senza-glutine/index.html`: cada `<li class="review">` |
| Perguntas frequentes | `senza-glutine/` e `consegna/`: cada `<details>` e o bloco `FAQPage` no `<head>` (o Google lê esse) |
| Cores e fontes | Topo do `assets/css/styles.css` |

As fotos estão em WebP em `assets/img/`. Para trocar a do topo, mantenha o nome (`pizza-capricciosa.webp` e a versão `-600`) ou troque no `index.html`.

## Publicar

O workflow `.github/workflows/deploy-punto-pizza.yml` publica o site no Cloudflare a cada push que mexe em `punto-pizza/`
(no `main` ou no branch `claude/inspiring-gates-bp5orb`). Vai como **Worker** chamado `puntopizza`, no mesmo esquema da
Black Rock Floors, porque a conta já chegou ao limite de projetos do Cloudflare Pages.
No ar em <https://puntopizza.lucassouzalima10.workers.dev> (o endereço também aparece no resumo de cada execução, em **Actions**).

- Usa o mesmo secret dos outros sites: `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, opcional).
- Na publicação, o workflow coloca o endereço completo no `og:image` (o WhatsApp exige), o `canonical` e o `og:url` em cada página, e gera o `sitemap.xml` e o `robots.txt`.
- O README não vai para o ar.
- No endereço `.workers.dev`, o site vai com `noindex` (arquivo `_headers`): a prévia não concorre no Google com o site atual dele.

### Ligar o domínio do Carlos (`puntopizzaverona.it`)

Hoje o domínio aponta para o site que ele montou numa plataforma de funis (LeadConnector/HighLevel).

1. Descobrir onde o domínio `.it` está registrado (Aruba, Register.it, GoDaddy...) e pedir o acesso ao Carlos.
2. No Cloudflare: **Add a domain** com `puntopizzaverona.it`. O Cloudflare mostra dois *nameservers*; troque no registrador.
3. Quando o Cloudflare confirmar o domínio: **Workers & Pages → puntopizza → Settings → Domains & Routes → Add → Custom domain**, com `www.puntopizzaverona.it` e `puntopizzaverona.it`.
4. No GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable** `PUNTOPIZZA_SITE_URL` = `https://www.puntopizzaverona.it`, e rode o workflow de novo (**Actions → Deploy Punto Pizza → Run workflow**).
5. No Google Search Console, adicione o domínio e envie `https://www.puntopizzaverona.it/sitemap.xml`. No Perfil da Empresa no Google, confira que o link do site é esse.

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
├── menu/index.html               cardápio completo
├── senza-glutine/index.html      sem glúten
├── consegna/index.html           entrega e retirada
├── contatti/index.html           quem somos e contatos
├── 404.html                      página "não encontrada"
├── _headers                      cabeçalhos do Cloudflare (noindex na prévia, cache)
├── assets/css/styles.css         visual (cores e fontes no topo)
├── assets/js/app.js              horário, menu do celular, desenho das pizzas, filtros, CAP, mapa
├── assets/fonts/                 Bricolage Grotesque e Instrument Serif (só os caracteres usados)
└── assets/img/                   logo (SVG), favicon, QR do app, og-image e fotos (WebP)
```

Créditos: fontes Bricolage Grotesque e Instrument Serif (SIL Open Font License); logo e fotos das pizzas do próprio Carlos
(site e anúncios dele); avaliações públicas do Google da pizzaria.
