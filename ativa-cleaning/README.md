# Ativa Cleaning · site

Site novo da Ativa Cleaning Services (Roni e a esposa são os diretores), empresa de limpeza **residencial e comercial**
em Adelaide, Austrália. Substitui o site antigo em WordPress (<https://ativacleaning.com.au>).
Em inglês, porque os clientes são australianos.

É HTML, CSS e JavaScript puros: sem build e sem bibliotecas. Dá para abrir o `index.html` direto no navegador.

Todas as fotos, avaliações e textos de garantia vêm do site antigo e do Google da Ativa: não tem foto de banco de imagens.

## O que tem no site

- **Topo** centralizado: "We clean, you live." (o slogan da Ativa), uma frase curta ("House and commercial cleaning
  across Adelaide...") e dois botões de vidro no estilo do iPhone (azul-marinho para o orçamento, branco para o
  telefone). Logo abaixo, a foto da equipe num porta-retrato empoeirado (horizontal no computador, em pé no celular),
  com "clean me" escrito no pó. Quando ele aparece na tela, um pano de microfibra limpa a foto em "S" e deixa a parte
  de baixo para a pessoa terminar: no computador é só passar o mouse; no celular, arrastar o dedo na horizontal (ou
  tocar em "tap here" para o pano terminar sozinho). No fim aparece "Spotless. That's the Ativa finish." com brilhos,
  e um botão para empoeirar de novo. Quem ativou "reduzir movimento" já vê a foto limpa.
- **Faixa** correndo com os serviços (casa, fim de contrato, escritórios, cafés, creches, pós-obra...).
- **Home or business**: seletor **Residential | Commercial** (a pílula escura desliza até a escolhida). Cada lado tem
  fotos da equipe, um trecho de avaliação real e os serviços:
  - Residential: limpeza regular (from $53), fim de contrato (garantia do bond), faxina pontual e de primavera, e
    janelas, fornos e geladeiras.
  - Commercial: escritórios, cafés e restaurantes, creches e escolas, pós-obra.
  O botão de cada lado já escolhe o serviço no formulário. Os links "Residential" e "Commercial" do menu abrem o lado certo.
- **Como funciona** em 3 passos (o terceiro é o slogan, "We clean, you live").
- **Trabalhos reais**: antes/depois de arrastar (tomada), antes/depois da pia, um trecho de avaliação e uma faixa de
  fotos dos serviços (cozinha, forno, banheiro, geladeira, quarto, janelas...).
- **Garantia do bond** (fim de contrato) com o selo girando.
- **Sobre**: fotos da equipe, a frase da própria Ativa e os 3 princípios do site antigo (Organisation, Clarity,
  Communication).
- **Avaliações**: nota 5.0 com 23 avaliações do Google e 6 depoimentos reais, com links para ler e para avaliar.
- **Pedido de orçamento**: escolhe o serviço e o formulário muda as perguntas: casa, fim de contrato e faxina pontual
  pedem quartos e banheiros (e a frequência, na limpeza regular); comercial pede tipo de lugar, frequência e tamanho;
  pós-obra pede se é casa ou empresa e o tamanho; janelas pedem andares, número de janelas e lados; forno/geladeira
  pergunta quais. Depois nome, telefone, e-mail, bairro, data e observações. O botão principal abre o e-mail da pessoa
  com tudo preenchido para `office@ativaservices.com`; o segundo manda a mesma mensagem pelo WhatsApp.
- **Perguntas frequentes**, chamada final ("Your space, spotless.") e rodapé com os serviços residenciais e comerciais
  e os 3 e-mails do site antigo (orçamentos, atendimento e financeiro).
- Barra fixa "Call / Get a free quote" no celular, prévia bonita do link no WhatsApp (`og-image.jpg`),
  dados para o Google (LocalBusiness) e página 404.

## Como editar

| O quê | Onde |
| --- | --- |
| WhatsApp, telefone, e-mail dos orçamentos | `assets/js/config.js` (e os mesmos valores no `index.html`: procure e troque) |
| Nota e total de avaliações do Google | `googleRating` e `googleReviews` em `assets/js/config.js` (e no `index.html`, procure `5.0` e `23`) |
| Mandar o formulário direto, sem abrir o e-mail | `formEndpoint` em `assets/js/config.js` (Formspree ou FormSubmit; instruções no arquivo) |
| Meta Pixel (anúncios) | `metaPixelId` em `assets/js/config.js`: cada pedido vira um evento "Lead" |
| Instagram / Facebook | `instagram` e `facebook` em `assets/js/config.js` (vazio esconde) |
| Textos, serviços, depoimentos, perguntas | `index.html` |
| Campos do pedido de orçamento | no `<form>` do `index.html`: cada bloco com `data-label` vira uma linha da mensagem, na ordem da página; `data-when` diz em quais serviços (o `data-key` de cada opção) o bloco aparece |
| Serviços de cada lado (Residential / Commercial) | `#panel-home` e `#panel-biz` no `index.html` |
| Cores e fontes | topo de `assets/css/styles.css` |
| Fotos | `assets/img/` (para trocar uma foto sem esperar o cache, use um nome novo) |

## Antes de mostrar para o cliente

Confirme com o Roni:

- [ ] Os serviços de cada lado: residencial (regular, fim de contrato, faxina pontual/primavera, janelas, forno e
      geladeira) e comercial (escritórios, cafés e restaurantes, creches e escolas, pós-obra). O site antigo também tinha
      "Inspection", "Sales cleaning" e "Bathroom/Toilet": entram?
- [ ] "From $53" na limpeza regular (estava no site antigo: "Cleanings start from $53")
- [ ] Horário: o site antigo tinha dois ("Mon–Fri 9am–5pm" no topo e "08.00–16.30" na página de serviços). Ficou 9am–5pm
- [ ] WhatsApp no mesmo número do telefone (0438 357 508)
- [ ] E-mail que recebe os orçamentos: `office@ativaservices.com` (no site antigo, "Julia - Quotes")
- [ ] Respostas das perguntas frequentes, principalmente "Do I need to be home?" (chave ou código de acesso) e
      "When can you clean my business?"
- [ ] Se pode mostrar a foto da equipe na frente da Eden Academy (cliente) no lado comercial
- [ ] Bairros atendidos (hoje o site diz só "Adelaide metro")
- [ ] ID do Meta Pixel da conta de anúncios
- [ ] Mais fotos de serviços comerciais e de antes/depois, assim que tiverem (o antes/depois de arrastar funciona
      melhor com as duas fotos do mesmo ângulo, como as da tomada)

## Ver no computador

```bash
cd ativa-cleaning
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

O workflow `.github/workflows/deploy-ativa-cleaning.yml` publica o site no Cloudflare (como Worker, igual aos
outros sites do repositório) a cada push que mexe em `ativa-cleaning/`, sempre no mesmo link:
`https://ativacleaning.<subdomínio da conta>.workers.dev` (o endereço exato aparece no resumo da execução em Actions).
Usa os secrets que já existem no repositório (`CLOUDFLARE_API_TOKEN` e, opcional, `CLOUDFLARE_ACCOUNT_ID`).

Enquanto estiver no endereço `.workers.dev`, o Google não indexa (`_headers`). Para ligar o domínio
`ativacleaning.com.au` (hoje no WordPress): Cloudflare → Workers & Pages → ativacleaning → Settings →
Domains & Routes → Add → Custom domain, e cadastre a variável `ATIVA_SITE_URL` (`https://ativacleaning.com.au`)
em Settings → Secrets and variables → Actions → Variables, para o canonical, o sitemap e a prévia do link usarem
o domínio. Os e-mails `@ativaservices.com` são de outro domínio e não mudam.

## Estrutura

```
ativa-cleaning/
├── index.html              a página
├── 404.html                página de "não encontrado"
├── _headers                cabeçalhos do Cloudflare (cache, noindex na prévia)
├── assets/css/styles.css   visual (cores e fontes no topo)
├── assets/js/config.js     contatos, avaliações, formulário, Meta Pixel, redes
├── assets/js/app.js        menu, porta-retrato que se limpa, seletor Residential/Commercial, antes/depois, carrosséis, formulário
├── assets/img/             logo (vetorizado do PNG do site antigo), fotos reais, ícones e imagem de prévia
└── tools/og.html           página da imagem de prévia (não vai para o ar)
```

Fontes: Bricolage Grotesque (títulos, pesada e geométrica como o logo) e Instrument Sans (textos), do Google Fonts.
Cores: o teal `#71C8D1` e o verde-menta `#8CF8C5` do logo, com o azul-marinho do uniforme `#0C2236`.
