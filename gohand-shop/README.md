# GoHand Shop · site

Site de uma página para a GoHand Shop, empresa de entregas de pacotes nos Estados Unidos que está começando.
O cliente pediu um site para quem quiser informação, com WhatsApp para clicar e telefone para ligar, que ajude a atrair empresas para trabalhar com ele.

É HTML, CSS e JavaScript puros: sem build, sem dependências. Dá para abrir o `index.html` direto no navegador.

## O que tem no site

- **Topo laranja** com o título "Your packages, in good hands." / "Sua entrega em boas mãos.", botões de WhatsApp e de ligar,
  e uma **etiqueta de envio animada**: a caixinha percorre a rota, o rastreio vai mudando (coletado → em trânsito → saiu para entrega)
  e, quando chega, a etiqueta leva o carimbo "Delivered / Entregue".
- **Faixa** inclinada com os serviços passando.
- **Serviços** (6 cartões). Cada um tem "Ask about this", que abre o WhatsApp já perguntando sobre aquele serviço.
- **Por que a GoHand** (4 diferenciais, fundo preto).
- **Como funciona** em 4 passos, desenhado como o rastreio de um pacote: os passos acendem um a um.
- **Orçamento**: um formulário com cara de etiqueta (nome, empresa, coleta, entrega, o que envia, frequência, volume).
  Ao enviar, abre o WhatsApp com a mensagem pronta, em tópicos.
- **Onde atendemos** (aparece sozinha quando houver cidades cadastradas).
- **Dúvidas frequentes** e **contato** (WhatsApp, telefone, e-mail, Instagram e horário).
- Inglês e português: o site abre em português para quem usa o celular em português e em inglês para o resto, com botão EN/PT.
- Barra fixa de WhatsApp + Ligar no celular, prévia bonita do link no WhatsApp (`og-image.jpg`) e dados estruturados para o Google.

Identidade visual tirada do material do cliente: laranja **#E94206** (a referência que ele mandou), asfalto **#141414** e branco,
Poppins Black Italic e Bold Italic. O logo do site é vetorial, extraído do PDF dele. A faixa inclinada do "SHOP" virou o destaque
dos títulos (o texto entre `*asteriscos*` no `content.js`) e o formato dos botões.

## Como editar

Tudo o que muda fica em **`assets/js/content.js`**:

| O quê | Onde |
| --- | --- |
| WhatsApp que recebe as mensagens | `whatsapp` (só dígitos, com 1 na frente: `15085550123`) |
| Telefone para ligar | `phone` (vazio = usa o mesmo do WhatsApp) |
| E-mail e Instagram | `email` e `instagram` (vazio esconde) |
| Horário | `hours` |
| Região que aparece nas frases | `location.name` (topo) e `location.in` (meio das frases) |
| Cidade-base e cidades atendidas | `location.base` e `areas` (lista vazia esconde a seção) |
| Serviços, diferenciais, passos e dúvidas | `services`, `promises`, `steps`, `faq` |
| Opções do orçamento | `quote` |
| Todos os textos | `text.en` e `text.pt` |

Nos títulos, `*texto*` ganha a faixa preta/laranja do logo e `\n` quebra a linha.

Se a página ficar em branco depois de uma edição, quase sempre é uma vírgula ou aspa faltando no `content.js`. O site mostra um aviso vermelho no topo quando isso acontece.

## Antes de mostrar para o cliente

Os áudios só trouxeram o ramo (entregas de pacotes nos EUA) e as cores. O resto é conteúdo de **exemplo**. Confirme e troque:

- [ ] Número de WhatsApp e telefone (hoje `15555550123`, que não existe)
- [ ] Cidade/estado onde ele atende: `location` e `areas` (hoje aparece só "United States")
- [ ] Instagram e e-mail (o Instagram dele pede login, não deu para puxar as informações de lá)
- [ ] Horário de atendimento
- [ ] Serviços que ele realmente faz (hoje: mesmo dia, rotas programadas, coleta, lojas online, entre empresas, última milha para transportadoras)
- [ ] Promessas que ele consegue cumprir: foto na entrega, aviso a cada etapa, resposta no mesmo dia, preço antes de sair
- [ ] Se atende em inglês e português (aparece no topo e nas dúvidas)
- [ ] Forma de pagamento (nas dúvidas)

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
