# GoHand Shop · site

Site de uma página para a GoHand Shop (GoHandShop LLC), empresa de entregas de pacotes que está começando em
Nova Jersey e Massachusetts, atendendo também Nova York e Connecticut. O público são pequenas empresas e sellers
que vendem em marketplaces (B2B). O cliente pediu um site com informação, WhatsApp para clicar e telefone para ligar,
com o formulário ligado ao CRM dele.

É HTML, CSS e JavaScript puros: sem build, sem dependências. Dá para abrir o `index.html` direto no navegador.

## O que tem no site

- **Topo laranja** com o título "Your packages, in good hands." / "Sua entrega em boas mãos.", botões de WhatsApp e de ligar,
  e uma **etiqueta de envio animada**: a caixinha percorre a rota, o rastreio vai mudando (coletado → em trânsito → saiu para entrega)
  e, quando chega, a etiqueta leva o carimbo "Delivered / Entregue".
- **Faixa** branca com os serviços passando.
- **Serviços** (6 cartões). Cada um tem "Ask about this", que abre o WhatsApp já perguntando sobre aquele serviço.
- **Por que a GoHand** (4 diferenciais).
- **Como funciona** em 4 passos, desenhado como o rastreio de um pacote: os passos acendem um a um.
- **Orçamento**: o **formulário do CRM** do cliente (LeadConnector / GoHighLevel) dentro de um cartão com cara de etiqueta,
  com WhatsApp e Ligar logo abaixo. Os pedidos caem direto no CRM. Sem o `crmForm`, o cartão volta a ser a etiqueta
  que monta a mensagem no WhatsApp (nome, empresa, coleta, entrega, o que envia, frequência, volume).
- **Onde atendemos**: NJ e MA em destaque, NY e CT.
- **Dúvidas frequentes** e **contato** (WhatsApp, telefone da empresa, horário, endereços de NJ e MA com link para o mapa;
  e-mail, Instagram, TikTok e Facebook aparecem quando forem preenchidos).
- Inglês e português: o site abre em português para quem usa o celular em português e em inglês para o resto, com botão EN/PT.
- Barra fixa de WhatsApp + Ligar no celular, prévia bonita do link no WhatsApp (`og-image.jpg`) e dados estruturados para o Google.

Identidade visual tirada do material do cliente: laranja **#E94206** (a referência que ele mandou), asfalto **#141414** e branco,
Poppins Black Italic e Bold Italic. O logo do site é vetorial, extraído do PDF dele. A faixa inclinada do "SHOP" virou o destaque
dos títulos (o texto entre `*asteriscos*` no `content.js`) e o formato dos botões.

Depois da primeira prévia, o cliente pediu um visual mais "clean": o topo reto (sem a faixa e a etiqueta inclinadas) e menos preto,
com o laranja e o branco em destaque. Hoje o preto aparece só no texto, no logo e no rodapé.

## Como editar

Tudo o que muda fica em **`assets/js/content.js`**:

| O quê | Onde |
| --- | --- |
| WhatsApp que recebe as mensagens | `whatsapp` (só dígitos, com 1 na frente: `17743461245`) |
| Telefone para ligar | `phone` (vazio = usa o mesmo do WhatsApp) |
| E-mail e redes sociais | `email`, `instagram`, `tiktok` e `facebook` (vazio esconde) |
| Endereços | `addresses` (o primeiro também vai para os dados do Google) |
| Horário | `hours` |
| Região que aparece nas frases | `location.name` (topo) e `location.in` (meio das frases) |
| Base e regiões atendidas | `location.base` e `areas` (`main: true` deixa a região em laranja; lista vazia esconde a seção) |
| Serviços, diferenciais, passos e dúvidas | `services`, `promises`, `steps`, `faq` |
| Formulário do CRM | `crmForm` (o id que aparece no código de incorporação do LeadConnector) |
| Opções da etiqueta do WhatsApp (sem CRM) | `quote` |
| Todos os textos | `text.en` e `text.pt` |

Nos títulos, `*texto*` ganha a faixa preta/laranja do logo e `\n` quebra a linha.

Se a página ficar em branco depois de uma edição, quase sempre é uma vírgula ou aspa faltando no `content.js`. O site mostra um aviso vermelho no topo quando isso acontece.

## O que ainda falta confirmar

Já vieram do cliente: WhatsApp (774) 346-1245, telefone da empresa (888) 311-1671, endereço em Branchburg, NJ, regiões
(NJ e MA principalmente, NY e CT), público (pequenas empresas e sellers de marketplace) e o formulário do CRM.

- [ ] Endereço de Boston (56 Broad St #77143): veio na foto de uma etiqueta; confirmar se ele quer mostrar no site
- [ ] Instagram, TikTok e Facebook (ele disse que vai mandar)
- [ ] Horário de atendimento (hoje: segunda a sábado, 7h às 19h)
- [ ] Serviços que ele realmente faz e as promessas: foto na entrega, aviso a cada etapa, resposta no mesmo dia, preço antes de sair
- [ ] Forma de pagamento (nas dúvidas)

No formulário do CRM (isso se ajusta no GoHighLevel, não no site):

- [ ] Os textos de consentimento de SMS ainda mostram `[BUSINESS NAME]` e `[USE_CASE_FROM_CAMPAIGN_DESCRIPTION]`; trocar por "GoHandShop LLC" e o motivo das mensagens
- [ ] Botão "Submit" está azul; trocar para o laranja #E94206
- [ ] Se quiser, acrescentar campos de empresa, ZIP de coleta e entrega e volume por semana

## Segurança

O arquivo `_headers` manda o Cloudflare enviar cabeçalhos de segurança em todas as páginas:

- **Content-Security-Policy**: o navegador só carrega scripts, fontes, imagens e iframes do próprio site, do Google Fonts e do CRM
  (`link.msgsndr.com` e `*.leadconnectorhq.com`). Se o CRM pedir para colocar outro script (chat, pixel de anúncio), acrescente o
  domínio dele no `_headers`, senão o navegador bloqueia.
- **frame-ancestors / X-Frame-Options**: nenhum outro site pode exibir este dentro de um iframe (proteção contra golpes de clique).
- **HSTS**, **nosniff**, **Referrer-Policy** e **Permissions-Policy** (câmera, microfone, localização e pagamento desligados).

O site não guarda dados: o formulário é do CRM, e a etiqueta do WhatsApp só abre o WhatsApp com a mensagem.
O `README.md` não é publicado.

## Ver no computador

Abra o `index.html` no navegador, ou rode um servidor local nesta pasta:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Para forçar um idioma: `index.html?lang=en` ou `index.html?lang=pt`.

## Publicar

O site está no ar em **<https://gohand-shop.pages.dev>** (projeto `gohand-shop` no Cloudflare Pages, produção no branch `main`).

### Cloudflare Pages (já configurado)

O workflow `.github/workflows/deploy-gohand-shop.yml` publica o site no Cloudflare a cada push que mexe em
`gohand-shop/`, sempre como produção, então o endereço principal mostra a última versão.

Ele usa os mesmos dois secrets do site da Bossa (`CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`, em
**Settings → Secrets and variables → Actions**; o passo a passo está no README do `nail-studio/`).
Sem os secrets, o workflow só deixa um aviso e não publica nada.

A conta do Cloudflare permite no máximo 10 projetos do Pages. Para um site novo, é preciso apagar um antigo
(Workers & Pages → projeto → Settings → Delete project) ou pedir aumento do limite ao suporte do Cloudflare.

O workflow também troca o `og:image` pelo endereço completo, que é o que o WhatsApp exige para mostrar a imagem
da prévia. Para usar um domínio próprio, adicione o domínio no projeto em Cloudflare → Workers & Pages → Custom domains.

### Link rápido de prévia (sem configurar nada)

Compacte o conteúdo da pasta `gohand-shop/` (o `index.html` precisa ficar na raiz do zip) e arraste em
<https://app.netlify.com/drop> ou em Cloudflare → Workers & Pages → Create → Pages → Upload assets.
Nesse caso, troque no `index.html` o `og:image` pelo endereço completo
(ex.: `https://gohand-shop.netlify.app/assets/img/og-image.jpg`) para a imagem aparecer na prévia do WhatsApp.

## Estrutura

```
gohand-shop/
├── index.html              estrutura da página (e o logo em SVG)
├── assets/css/styles.css   visual (cores e fontes no topo do arquivo)
├── assets/js/content.js    conteúdo: contato, serviços, dúvidas e textos
├── assets/js/app.js        comportamento (idiomas, etiqueta animada, orçamento pelo WhatsApp)
└── assets/img/             favicon, ícone do iPhone e imagem de prévia do link
```

Fontes: Poppins (a da marca) e IBM Plex Mono (os detalhes de etiqueta), do Google Fonts.

As animações (rota da etiqueta, faixa de serviços, passos do rastreio, entrada das seções) são desligadas
automaticamente para quem ativou "reduzir movimento" no celular ou no computador; nesse caso a etiqueta já aparece entregue.
