# The Berry Coffee · site

Site de uma página para a **The Berry Coffee**, café da 2 Main Street em Arklow (Co. Wicklow, Irlanda), do Thiago Nunes e do Chef George.
O site é em inglês, porque o público do café é irlandês. É HTML, CSS e JavaScript puros: sem build e sem dependências. Dá para abrir o `index.html` direto no navegador.

## O pedido

**Primeira versão** (WhatsApp e áudios de 13/10):

- O site atual (Hostinger Website Builder, em `shop.theberrycoffee.ie`) é básico e "não conversa" com o Instagram e o Facebook, que eles atualizam todo dia.
- O Thiago quer o site com a cara das redes sociais: a história do café, a missão, os pratos e fotos dos pratos, tudo mais integrado.
- Ele também pediu ajuda com o domínio e o e-mail (veja [Domínio e e-mail](#domínio-e-e-mail)).

**Ajustes de 15/10.** O Thiago gostou do design e pediu para refinar alguns detalhes:

| Pedido | Como ficou |
| --- | --- |
| Trocar o telefone, que era o pessoal dele | Agora é o do café, **085 737 2391**, em todos os botões e nos dados para o Google. O botão de WhatsApp saiu, porque usava o número pessoal |
| Sem preços, porque eles mudam sempre | O cardápio não tem preços |
| Cardápio só com os pratos do ano todo | Só os pratos fixos. Os da estação ficam no Instagram, e o quadro *Seasonal specials* leva para lá |
| Mais do verde suave de dentro do café, com tons claros e naturais | Paleta nova: verde-sálvia, linho e verde-escuro, no lugar do azul-marinho |
| Manter o logotipo original | O logo é o mesmo, vetorizado do arquivo deles |
| Fotos reais do café, dos pratos e da equipe | Todas as fotos são do café, tiradas do Instagram e do site antigo |
| Integrar o Instagram, com posts recentes | Grade com os 12 posts mais recentes. Com o Behold, os novos entram sozinhos (veja abaixo) |
| Mais destaque para os pratos principais e os prêmios | Foto grande do brunch ao lado dos pratos e uma seção só para o prêmio de 2026, junto com as avaliações |
| Área de Gift Vouchers | Seção nova, com botões para ligar, mandar e-mail ou mensagem no Instagram |
| Navegação simples, principalmente no celular | Menu com 4 itens (*Menu*, *Our story*, *Gift vouchers*, *Visit us*) e barra fixa no celular com status, cardápio e rota |
| Alguns textos são antigos | O Jorge vai mandar os textos novos (veja [Pendências](#pendências-com-o-thiago-e-o-jorge)) |

## O que tem no site

- **Topo**: a vitrine da fachada, agora em verde-sálvia, com fotos dos pratos se alternando. A plaquinha pendurada muda sozinha pelo horário da Irlanda: *Open*, *Last orders soon!* ou *Closed*. O selo do prêmio fica no canto e leva até a seção do prêmio.
- **Faixa verde** com os destaques (Irish breakfast, French toast, açaí, matcha, gift vouchers…).
- **Pratos em destaque**: uma foto grande do brunch, com os dias e horários, e os 4 pratos principais em pratos canelados claros.
- **Prêmio e avaliações**: o *Exceptional Customer Service Award 2026*, com a foto do Thiago e a frase deles no post do prêmio. Embaixo ficam as avaliações de clientes, com links para avaliar no Google e no Tripadvisor.
- **Cardápio** do ano todo, sem preços, mais o quadro *Seasonal specials*, que leva para o Instagram.
- **História e missão**: a missão usa as palavras deles no post do prêmio. Embaixo ficam o recorte do jornal *Independent* e os 3 valores do café.
- **Gift Vouchers**: um cartão-presente desenhado com o logo e botões para ligar, mandar e-mail ou mensagem no Instagram.
- **Instagram**: grade no estilo do perfil. Com o Behold configurado, os posts novos entram sozinhos.
- **Visite**: endereço com Eircode, horários da semana com o dia de hoje marcado, rota no Google Maps, telefone, e-mail e mensagem no Instagram. O mapa do Google só carrega quando a pessoa toca no botão (privacidade/GDPR).
- Barra fixa no celular com o status (aberto/fechado), o cardápio e a rota.
- Prévia bonita do link no WhatsApp (`og-image.jpg`) e dados estruturados para o Google (horários, endereço, telefone, prêmio).
- Fontes hospedadas no próprio site (não chamam o Google Fonts) e animações desligadas para quem ativou "reduzir movimento".

## De onde veio o conteúdo

- **Bio do Instagram** (@theberrycoffee): *"All Day Irish Breakfast & Brunch / French Toast • Pancakes / Vegetarian • Vegan • Gluten-Free • Açaí • Matcha – WED to MOND 9AM – 4PM"*.
- **Posts de setembro e outubro de 2026**:
  - o prêmio *Exceptional Customer Service Award 2026* da Arklow & District Chamber of Commerce;
  - a volta do *Berry Brunch*: "From a classic Full Irish to fluffy pancakes… Come hungry, leave happy!";
  - o Chef George no cardápio de outono e o chocolate quente com marshmallow tostado.
- **Site antigo**: endereço, e-mail, as duas avaliações e as fotos da fachada, dos pratos e da equipe.
- **Matéria do jornal** (print postado por eles): a citação do quadro *In the paper*.
- **Thiago, em 15/10**: o telefone do café e os ajustes da tabela acima.

As fotos estão em `assets/img/`, em WebP, já no tamanho certo para a web.

## Pendências com o Thiago e o Jorge

- [ ] **Textos novos do Jorge.** O Thiago avisou que alguns textos são antigos e que o Jorge vai mandar os detalhes. Os que mais precisam da revisão dele:
  - a história (`index.html`, seção *Our story*) e os 3 valores embaixo dela;
  - os pratos do ano todo e as descrições (`favourites` e `menu` em `content.js`). Hoje são: Full Irish, French toast, pancakes, ovos no sourdough, açaí, toasties, pratos do chef, bolos, scones e banana bread.
- [ ] **Outros prêmios**: só achei o de 2026. Se houver outros, entram em `awards` (veja [Como editar](#como-editar)).
- [ ] **Gift Vouchers**: hoje o site diz que o voucher se compra no café, por telefone, e-mail ou Instagram. Se houver valores fixos ou um link de compra online, é só incluir.
- [ ] **WhatsApp**: o botão saiu porque era o número pessoal. Se o 085 737 2391 tiver WhatsApp, preencha `whatsapp` no `content.js` e o botão volta.
- [ ] **Instagram automático**: o Thiago precisa conectar o Instagram do café no Behold uma vez (veja abaixo).
- [ ] **Fotos novas** (opcional): se eles tiverem fotos melhores do salão, da equipe ou dos pratos, é só trocar os arquivos.
- [ ] **Jornal**: a citação é do *Irish Independent*? Um cliente no Tripadvisor cita "the Independent".
- [ ] **Facebook**: o site antigo apontava para `facebook.com/417483234775001`. Usei a página *The Berry Coffee | Arklow*, de 1.488 seguidores (`facebook.com/p/The-Berry-Coffee-61563827972137`).

## Como editar

| O quê | Onde |
| --- | --- |
| Telefone, WhatsApp, e-mail, endereço, redes | `assets/js/content.js`, seção 1. O botão de ligar e o Google usam o mesmo `phone` |
| Horários, feriados e faixa de aviso no topo | `hours`, `specialDays` e `notice` em `content.js` |
| Prêmios | `awards` em `content.js`. O primeiro da lista é o destaque |
| Link de compra do Gift Voucher | `vouchers.buyUrl` em `content.js` |
| Fotos da vitrine (topo) | `window` em `content.js` (fotos 4:5, em pé) |
| Foto grande ao lado dos pratos | `feature` em `content.js` |
| Pratos em destaque | `favourites` em `content.js` (fotos quadradas, aparecem redondas) |
| Cardápio do ano todo | `menu` em `content.js` |
| Avaliações | `reviews` em `content.js` |
| Posts do Instagram (sem Behold) | `instagram.posts` em `content.js` e as imagens em `assets/img/feed/` |
| Títulos, história, missão e textos dos vouchers | `index.html` |
| Selo redondo do prêmio na vitrine | `index.html`, procure por `award-badge` |
| Cores e fontes | topo de `assets/css/styles.css` |

Exemplos:

- **Feriado de Natal**: em `specialDays`, coloque `'2026-12-25': 'closed'`. Em `notice`, escreva `'Closed 25–26 December. Happy Christmas from all of us!'`.
- **Novo prêmio**: em `awards`, copie o bloco `{ ... }` do prêmio de 2026 e troque os textos. O mais importante fica em primeiro.
- **Venda de vouchers online**: cole o link em `vouchers.buyUrl` e aparece o botão *Buy a voucher online*.
- **Testar o status** em qualquer dia e hora (hora da Irlanda): abra `index.html?now=2026-10-20T10:00`.

Se a página ficar em branco depois de uma edição, quase sempre falta uma vírgula ou aspa no `content.js`. O site mostra um aviso vermelho no topo quando isso acontece.

## Instagram automático (Behold)

Hoje a grade mostra os 12 posts mais recentes até 15/10, salvos em `assets/img/feed/`. Para os posts novos entrarem sozinhos:

1. O Instagram do café precisa ser uma conta profissional (Business ou Creator). Se ainda não for, a troca é grátis e dá para desfazer, no próprio app do Instagram.
2. Crie uma conta grátis em <https://behold.so> e conecte o Instagram do café. O Thiago precisa fazer o login no Instagram nessa hora.
3. Crie um feed do tipo **JSON** e copie o endereço (algo como `https://feeds.behold.so/…`).
4. Cole esse endereço em `content.js`, no campo `instagram.feedUrl`.

O plano grátis do Behold tem 1 feed com até 6 posts, atualizado uma vez por dia, e 1.200 leituras por mês.

- O site mostra os 6 posts mais novos do Behold e completa a grade com os posts salvos.
- Cada visitante guarda o feed por 6 horas, para gastar menos leituras.
- Se o feed falhar ou passar do limite do mês, o site volta para os posts salvos.
- Com o Behold, o número de seguidores também aparece ao lado do @.

Conectado pelo login do Instagram, o Behold pede para reautorizar a conta a cada 3 meses. Conectado por um *Business Portfolio* do Facebook (com a página do Facebook ligada ao Instagram), não precisa.

## Ver no computador

Abra o `index.html` no navegador, ou rode um servidor local nesta pasta:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

### Link do site: <https://theberrycoffee.lucassouzalima10.workers.dev>

> **Fora do ar desde 26/10/2026**, a pedido do Lucas. O link está desligado, mas nada foi apagado: o Worker continua na conta do Cloudflare.
>
> **Para voltar ao ar**, troque `SITE_ONLINE: 'false'` por `SITE_ONLINE: 'true'` no topo de `.github/workflows/deploy-berry-coffee.yml` e faça push. Em cerca de um minuto o site volta no mesmo link, já com a versão mais nova do repositório.

O workflow `.github/workflows/deploy-berry-coffee.yml` publica a pasta `berry-coffee/` sempre nesse mesmo link. Ele roda a cada push que mexe nela, no `main` ou no branch `claude/keen-tesla-fjkq02`. O endereço exato aparece no resumo de cada execução, em Actions.

O site vai como **Worker com arquivos estáticos**, e não como projeto do Cloudflare Pages. A conta já tem 100 projetos no Pages, que é o limite do Cloudflare (erro 8000027). Os Workers têm limite separado.

- Antes de publicar, o workflow confere se já existe um Worker `theberrycoffee` que não seja este site. Se existir, ele para e não sobrescreve nada.
- O workflow troca o `og:image` pelo endereço completo, que é o que o WhatsApp exige para mostrar a imagem, e não publica este README.
- Depois de publicar, ele abre o site para conferir que está no ar.
- Com `SITE_ONLINE: 'false'`, o workflow não publica nada: só desliga o link `workers.dev` e confere que o site saiu do ar. Os pushes seguintes também não publicam, até a chave voltar para `'true'`.
- Enquanto o site estiver só no `.workers.dev`, o Google não indexa a prévia (arquivo `_headers`). Com o domínio `theberrycoffee.ie` ligado, ele fica indexável normalmente.

### Credenciais

O workflow usa o secret `CLOUDFLARE_API_TOKEN`, que já está cadastrado no repositório. O ID da conta é opcional: o workflow usa o secret ou a variável `CLOUDFLARE_ACCOUNT_ID`, se existirem, e senão descobre a conta pelo token.

Se um dia precisar refazer o token, use o modelo *Edit Cloudflare Workers* em <https://dash.cloudflare.com/profile/api-tokens> e salve em <https://github.com/lucassouzalima2004/Projects/settings/secrets/actions> com o nome `CLOUDFLARE_API_TOKEN`. Depois, em Actions, abra a última execução de *Deploy The Berry Coffee* e clique em *Re-run all jobs*.

### Sem o workflow: upload manual

Cloudflare → Workers & Pages → Create → *Upload your static files*. Dê o nome `theberrycoffee` e arraste a pasta `berry-coffee`, sem este README. Antes de subir, troque no `index.html` o `og:image` pelo endereço completo do site. Nesse caminho, cada atualização precisa de um novo upload.

## Domínio e e-mail

O Thiago pediu ajuda com isso. Esta é a situação em 14/10/2026, consultando o DNS público:

| Item | Hoje |
| --- | --- |
| Registro do domínio `theberrycoffee.ie` | register365 (segundo o Thiago) |
| DNS (nameservers) | **Hostinger**: `ns1.dns-parking.com` e `ns2.dns-parking.com`. Os registros se editam no hPanel → Domínios → DNS |
| Site | `www` aponta para o construtor da Hostinger (`*.cdn.hstgr.net`) e redireciona para `shop.theberrycoffee.ie` |
| E-mail | **Titan Mail**, vendido pela Hostinger: MX `mx1.titan.email` e `mx2.titan.email`, SPF `include:spf.titan.email` e DKIM `titan1._domainkey`. Não tem DMARC |

Sobre o "número que o sistema pede": é bem provável que seja um registro de DNS. Pode ser um código de verificação (TXT) ou os registros novos para migrar do Titan para o "Hostinger Email" e conseguir caixa maior. Esse registro precisa ser criado no DNS, que hoje está na Hostinger, e não na register365. Peça um print da tela para confirmar o que é.

Para colocar o site novo no domínio sem derrubar o e-mail: no Cloudflare, um Worker só aceita domínio próprio quando o DNS do domínio está no Cloudflare. Siga esta ordem:

1. No Cloudflare, *Add a domain* → `theberrycoffee.ie`, plano Free. O Cloudflare copia os registros de DNS que já existem na Hostinger.
2. **Confira que os registros do e-mail vieram iguais**:
   - MX `mx1.titan.email` (prioridade 10) e `mx2.titan.email` (prioridade 20);
   - o TXT do SPF `v=spf1 include:spf.titan.email ~all`;
   - o TXT `titan1._domainkey`.

   Se faltar algum, crie igual ao que está na Hostinger.
3. Na register365, troque os nameservers pelos dois que o Cloudflare mostrar. Espere o domínio ficar *Active* no Cloudflare (de minutos a algumas horas).
4. Em Workers & Pages → `theberrycoffee` → *Settings* → *Domains & Routes* → *Add* → *Custom domain*, adicione `theberrycoffee.ie` e `www.theberrycoffee.ie`. Se o Cloudflare avisar de registros antigos do `@`/`www` (os da Hostinger), apague esses dois. **Não apague os de e-mail.**
5. Desconecte o construtor de sites da Hostinger do domínio e troque `og:image` e `canonical` do `index.html` para `https://www.theberrycoffee.ie/` se ainda não estiverem.

Se preferir não mudar os nameservers: apague um projeto antigo do Cloudflare Pages para abrir uma vaga e publique o site no Pages. Aí o `www` pode ser só um `CNAME` na Hostinger.

## Estrutura

```
berry-coffee/
├── index.html              estrutura da página, títulos, história e missão
├── 404.html                página de "não encontrado"
├── robots.txt, sitemap.xml
├── _headers                cabeçalhos do Cloudflare (prévia .workers.dev fora do Google, cache das fontes)
├── assets/css/styles.css   visual (cores e fontes no topo do arquivo)
├── assets/js/content.js    contato, horários, prêmios, vouchers, cardápio, fotos, avaliações, Instagram
├── assets/js/app.js        comportamento (status aberto/fechado, vitrine, prêmios, cardápio, feed, mapa)
├── assets/fonts/           Gloock, Nunito e Caveat (licença OFL, do Google Fonts)
└── assets/img/             logo vetorizado, fotos (photos/, plates/, feed/), favicon e prévia do link
```

O logo é a vetorização do arquivo original do café. Ele fica embutido no `index.html` e herda a cor do texto, então serve em fundo claro e escuro.
