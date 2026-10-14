# The Berry Coffee · site

Site de uma página para a **The Berry Coffee**, café da 2 Main Street em Arklow (Co. Wicklow, Irlanda), do Thiago Nunes e do Chef George.
O site é em inglês, porque o público do café é irlandês. É HTML, CSS e JavaScript puros: sem build e sem dependências. Dá para abrir o `index.html` direto no navegador.

## O pedido

Pelo WhatsApp e pelos áudios de 13/10:

- O site atual (Hostinger Website Builder, em `shop.theberrycoffee.ie`) é básico e "não conversa" com o Instagram e o Facebook, que eles atualizam todo dia.
- O Thiago quer o site com a cara das redes sociais: a história do café, a missão, os pratos e fotos dos pratos, tudo mais integrado.
- Ele também pediu ajuda com o domínio e o e-mail (veja [Domínio e e-mail](#domínio-e-e-mail)).

## O que tem no site

- **Topo**: a vitrine da fachada (caixilho azul-marinho, janelinhas azul-claras, as espadas-de-são-jorge do parapeito), com fotos dos pratos se alternando. A plaquinha pendurada muda sozinha pelo horário da Irlanda: *Open*, *Last orders soon!* ou *Closed*. O selo do prêmio de 2026 fica no canto.
- **Faixa azul** com os destaques (Irish breakfast, French toast, açaí, matcha…).
- **Pratos em destaque** em pratos azuis canelados, como a louça do café.
- **Cardápio** com preços, quadro de destaque da estação (hoje: outono) e selos GF/DF/V/VG.
- **História e missão**: a missão usa as palavras deles no post do prêmio. Ao lado ficam o cartão do prêmio, o recorte do jornal *Independent* e os 3 valores do café.
- **Instagram**: grade no estilo do perfil. Com o Behold configurado, os posts novos entram sozinhos (veja abaixo).
- **Avaliações** (as mesmas do site antigo), com links para avaliar no Google e no Tripadvisor.
- **Visite**: endereço com Eircode, horários da semana com o dia de hoje marcado, rota no Google Maps, telefone, WhatsApp e e-mail. O mapa do Google só carrega quando a pessoa toca no botão (privacidade/GDPR).
- Barra fixa no celular com o status (aberto/fechado) e o botão de rota, prévia bonita do link no WhatsApp (`og-image.jpg`) e dados estruturados para o Google (horários, endereço, prêmio).
- Fontes hospedadas no próprio site (não chamam o Google Fonts) e animações desligadas para quem ativou "reduzir movimento".

## De onde veio o conteúdo

- **Bio do Instagram** (@theberrycoffee): *"All Day Irish Breakfast & Brunch / French Toast • Pancakes / Vegetarian • Vegan • Gluten-Free • Açaí • Matcha – WED to MOND 9AM – 4PM"*.
- **Pôster "Our New Autumn Menu"** (post de outubro/2026): preços de cafés, bolos, bebidas geladas e smoothies.
- **Posts de setembro e outubro de 2026**:
  - o prêmio *Exceptional Customer Service Award 2026* da Arklow & District Chamber of Commerce;
  - o Chef George apresentando o *Irish Beef & Potato Boxty*;
  - o chocolate quente com marshmallow tostado.
- **Site antigo**: endereço, telefone, e-mail, as duas avaliações e as fotos da fachada, dos pratos e da equipe.
- **Matéria do jornal** (print postado por eles): a citação do quadro *In the paper*.

As fotos estão em `assets/img/`, em WebP, já no tamanho certo para a web.

## Antes de mostrar ao Thiago — confirmar com ele

- [ ] **Horário**: a bio do Instagram diz quarta a segunda, das 9h às 16h, fechado na terça. O site antigo dizia 8h–16h, e uma listagem antiga dizia domingo 10h–16h.
- [ ] **Preços da comida** (café da manhã, brunch e almoço): não estavam no pôster, então hoje aparecem sem preço. Peça uma foto do cardápio.
- [ ] **Pratos e descrições** (French toast, pancakes, açaí bowl, toasties): escritos a partir das fotos e da bio.
- [ ] **História** (`index.html`, seção *Our story*):
  - o café abriu em 2024?
  - "o Chef George na cozinha, o Thiago e a equipe no balcão";
  - "trouxemos um pouco do sol do Brasil".
- [ ] **Nomes** na foto da equipe ("Thiago & Chef George") e na assinatura.
- [ ] **Jornal**: a citação é do *Irish Independent*? Um cliente no Tripadvisor cita "the Independent".
- [ ] **"Stop 7 on the Arklow Pottery Trail"**: tirado do prato decorativo que aparece na parede do café.
- [ ] **Facebook**: o site antigo apontava para `facebook.com/417483234775001`. Usei a página *The Berry Coffee | Arklow*, de 1.488 seguidores (`facebook.com/p/The-Berry-Coffee-61563827972137`).
- [ ] **Fotos**: o ok para usar no site as fotos e as capas dos vídeos do Instagram, que são deles.

## Como editar

| O quê | Onde |
| --- | --- |
| Telefone, WhatsApp, e-mail, endereço, redes | `assets/js/content.js`, seção 1 |
| Horários, feriados e faixa de aviso no topo | `hours`, `specialDays` e `notice` em `content.js` |
| Fotos da vitrine (topo) | `window` em `content.js` (fotos 4:5, em pé) |
| Pratos em destaque | `favourites` em `content.js` (fotos quadradas, aparecem redondas) |
| Cardápio e preços | `menu` em `content.js` |
| Quadro da estação | seção do `menu` com `seasonal: true` e o `emoji` que cai (🍂 ❄️ 🌸 ☀️) |
| Avaliações | `reviews` em `content.js` |
| Posts do Instagram (sem Behold) | `instagram.posts` em `content.js` e as imagens em `assets/img/feed/` |
| Títulos, história e missão | `index.html` |
| Cores e fontes | topo de `assets/css/styles.css` |

Exemplos:

- **Feriado de Natal**: em `specialDays`, coloque `'2026-12-25': 'closed'`. Em `notice`, escreva `'Closed 25–26 December. Happy Christmas from all of us!'`.
- **Testar o status** em qualquer dia e hora (hora da Irlanda): abra `index.html?now=2026-10-20T10:00`.

Se a página ficar em branco depois de uma edição, quase sempre falta uma vírgula ou aspa no `content.js`. O site mostra um aviso vermelho no topo quando isso acontece.

## Instagram automático (Behold)

Hoje a grade mostra os 12 últimos posts, salvos em `assets/img/feed/`. Para os posts novos entrarem sozinhos:

1. Crie uma conta grátis em <https://behold.so> e conecte o Instagram do café. A conta precisa ser profissional (Business ou Creator), o que é comum para negócios.
2. Crie um feed do tipo **JSON** e copie o endereço (algo como `https://feeds.behold.so/…`).
3. Cole esse endereço em `content.js`, no campo `instagram.feedUrl`.

No plano grátis o Behold atualiza o feed uma vez por dia. Se o feed falhar, o site volta para os posts salvos. Com o Behold, o número de seguidores também aparece ao lado do @.

## Ver no computador

Abra o `index.html` no navegador, ou rode um servidor local nesta pasta:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

### Link do site: <https://theberrycoffee.pages.dev>

O workflow `.github/workflows/deploy-berry-coffee.yml` publica a pasta `berry-coffee/` sempre nesse mesmo link. Ele roda a cada push que mexe nela, no `main` ou no branch `claude/keen-tesla-fjkq02`. Na primeira vez, o workflow cria no Cloudflare o projeto `theberrycoffee`.

- Se esse nome já estiver em uso no Cloudflare, o endereço ganha um sufixo. O endereço certo aparece no resumo da execução, em Actions.
- O workflow troca o `og:image` pelo endereço completo, que é o que o WhatsApp exige para mostrar a imagem, e não publica este README.
- Enquanto o site estiver só no `.pages.dev`, o Google não indexa a prévia (arquivo `_headers`). Com o domínio `theberrycoffee.ie` ligado ao projeto, ele fica indexável normalmente.

### Ligar o deploy (uma vez só, uns 2 minutos)

O workflow precisa de dois secrets no GitHub. São os mesmos que os workflows do `nail-studio` e do PurGrace usam, então isso destrava os três sites.

1. **Token**: abra o link abaixo, já preenchido com a permissão *Cloudflare Pages: Edit*. Clique em *Continue to summary* → *Create Token* e copie o token (ele só aparece uma vez). Se não tiver conta no Cloudflare, crie uma grátis antes.
   <https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22page%22%2C%22type%22%3A%22edit%22%7D%5D&accountId=*&zoneId=all&name=GitHub%20Actions%20-%20Cloudflare%20Pages>
2. **Account ID**: no Cloudflare, abra *Workers & Pages*. O *Account ID* aparece na coluna da direita; copie.
3. **GitHub**: em <https://github.com/lucassouzalima2004/Projects/settings/secrets/actions/new>, crie o secret `CLOUDFLARE_API_TOKEN` com o token. Depois crie o `CLOUDFLARE_ACCOUNT_ID` com o Account ID.
4. **Publicar**: abra a última execução de *Deploy The Berry Coffee* em Actions e clique em *Re-run all jobs*, ou faça um novo push.

### Sem os secrets: upload manual

1. Cloudflare → Workers & Pages → Create → Pages → *Upload assets*. Dê ao projeto o nome `theberrycoffee`.
2. Arraste a pasta `berry-coffee` sem este README.
3. Antes de subir, troque no `index.html` o `og:image` pelo endereço completo: `https://theberrycoffee.pages.dev/assets/img/og-image.jpg`.

Nesse caminho, cada atualização precisa de um novo upload.

## Domínio e e-mail

O Thiago pediu ajuda com isso. Esta é a situação em 14/10/2026, consultando o DNS público:

| Item | Hoje |
| --- | --- |
| Registro do domínio `theberrycoffee.ie` | register365 (segundo o Thiago) |
| DNS (nameservers) | **Hostinger**: `ns1.dns-parking.com` e `ns2.dns-parking.com`. Os registros se editam no hPanel → Domínios → DNS |
| Site | `www` aponta para o construtor da Hostinger (`*.cdn.hstgr.net`) e redireciona para `shop.theberrycoffee.ie` |
| E-mail | **Titan Mail**, vendido pela Hostinger: MX `mx1.titan.email` e `mx2.titan.email`, SPF `include:spf.titan.email` e DKIM `titan1._domainkey`. Não tem DMARC |

Sobre o "número que o sistema pede": é bem provável que seja um registro de DNS. Pode ser um código de verificação (TXT) ou os registros novos para migrar do Titan para o "Hostinger Email" e conseguir caixa maior. Esse registro precisa ser criado no DNS, que hoje está na Hostinger, e não na register365. Peça um print da tela para confirmar o que é.

Para colocar o site novo no domínio sem derrubar o e-mail, siga esta ordem:

1. No Cloudflare, no projeto `theberrycoffee` → *Custom domains*, adicione `www.theberrycoffee.ie`.
2. No DNS da Hostinger, troque o registro do `www` por um `CNAME` apontando para `theberrycoffee.pages.dev`. Desconecte o construtor da Hostinger desse domínio.
3. O domínio sem `www` (`theberrycoffee.ie`) pode redirecionar para o `www` pelo hPanel. A alternativa é mudar os nameservers na register365 para o Cloudflare (grátis); aí dá para usar o domínio sem `www` direto no Pages.
4. **Não mexa nos registros MX, SPF e DKIM** do Titan. Se o DNS for para o Cloudflare, copie esses registros iguais antes de trocar os nameservers.

## Estrutura

```
berry-coffee/
├── index.html              estrutura da página, títulos, história e missão
├── 404.html                página de "não encontrado"
├── robots.txt, sitemap.xml
├── _headers                cabeçalhos do Cloudflare (prévia .pages.dev fora do Google, cache das fontes)
├── assets/css/styles.css   visual (cores e fontes no topo do arquivo)
├── assets/js/content.js    contato, horários, cardápio, fotos, avaliações, Instagram
├── assets/js/app.js        comportamento (status aberto/fechado, vitrine, cardápio, feed, mapa)
├── assets/fonts/           Gloock, Nunito e Caveat (licença OFL, do Google Fonts)
└── assets/img/             logo vetorizado, fotos (photos/, plates/, feed/), favicon e prévia do link
```

O logo é a vetorização do arquivo original do café. Ele fica embutido no `index.html` e herda a cor do texto, então serve em fundo claro e escuro.
