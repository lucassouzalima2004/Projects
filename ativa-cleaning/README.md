# Ativa Cleaning · site

Site novo da Ativa Cleaning Services (Roni e a esposa são os diretores), empresa de limpeza **residencial e comercial**
em Adelaide, Austrália. Substitui o site antigo em WordPress (<https://ativacleaning.com.au>).
Em inglês, porque os clientes são australianos.

É HTML, CSS e JavaScript puros: sem build e sem bibliotecas. Dá para abrir o `index.html` direto no navegador.

Todas as fotos, avaliações e textos de garantia vêm do site antigo e do Google da Ativa: não tem foto de banco de imagens.

## O que tem no site

Revisão de 11/11/2026 (e-mail da Julia Walker, "Atualizacoes no website") aplicada; o que depende de arquivos está
em "Falta chegar", logo abaixo.

- **Topo** centralizado: logo da Ativa acima do slogan **"Your life + clean"**, uma frase de apoio (**provisória**: a
  Danubia vai mandar a definitiva; no `index.html` ela está marcada com `TEXTO PROVISÓRIO` e `data-provisional`),
  dois botões de vidro no estilo do iPhone e um selinho discreto com a nota do Google (★★★★★ 5.0) com um brilho
  passando. Logo abaixo, a foto da equipe num porta-retrato empoeirado (horizontal no computador, em pé no celular),
  com "clean me" escrito no pó: um pano de microfibra limpa a foto em "S" e a pessoa termina com o mouse ou o dedo.
- **Faixa** correndo com os serviços: regular house cleaning, end of lease, offices, cafe & restaurants, childcare &
  school, post-construction, spring cleaning, window cleaning, carpet cleaning, steam cleaning, gardening, inspection
  cleaning, deep cleaning, once off cleaning, property sale cleaning.
- **Home or business**: seletor com 3 abas (a pílula escura desliza até a escolhida); o menu abre cada uma.
  - Residential: regular (**from $55/h**), end of lease (garantia do bond), once off & spring cleaning, deep cleaning,
    inspection & property sale cleaning, window cleaning.
  - Commercial: escritórios, cafes (sem acento) e restaurantes, creches e escolas, pós-obra.
  - Extras: carpet cleaning, steam cleaning (100% chemical-free), gutter cleaning, gardening, window cleaning
    (residencial e comercial). As fotos desta aba são provisórias (janelas) até chegarem as de carpete/vapor.
- **Como funciona** em 3 passos.
- **NDIS & aged care cleaning**: seção no mesmo estilo da garantia do bond, com o texto da cliente e o botão
  "Let's talk about your cleaning needs", que já escolhe "NDIS & aged care cleaning" no formulário.
- **Trabalhos reais**: antes/depois de arrastar, um segundo antes/depois e a galeria **"From the job sheet" com uma aba
  por serviço** (montada a partir de `gallery` em `assets/js/config.js`; aba sem fotos não aparece).
- **Garantia do bond**, **Sobre** e **Avaliações** (5.0 com **32** avaliações do Google).
- **Pedido de orçamento**: a lista de serviços agora é um menu agrupado (Residential, Commercial, Extras, com NDIS) e as
  perguntas mudam conforme o serviço. Horário de agendamento: **Mon – Fri, 8:30am – 4:30pm**.
- **Perguntas frequentes**: preço from $55/h, "Are your cleaners police checked and trained?", política de cancelamento
  (aparece sozinha quando o PDF estiver no site) e, por último, "Which areas do you cover?" com a resposta da cliente.
- **Where we clean**: mapa (OpenStreetMap) com o CBD e um círculo de ~45 minutos; os pinos dos bairros entram em
  `serviceArea.suburbs` no `config.js`.
- Chamada final, rodapé (residencial, comercial & extras, contatos, horário e link da política de cancelamento),
  barra fixa no celular, prévia do link no WhatsApp, dados para o Google e página 404.

## Falta chegar (anexos do e-mail da cliente)

Os anexos ficaram no Gmail do Lucas. Quando chegarem, é só colocar cada um no lugar abaixo (mesmo nome) e fazer push:

| Arquivo da cliente | Onde colocar | Observação |
| --- | --- | --- |
| `1.jpeg` (nova foto do topo, no lugar da Julia com a Dan) | `assets/img/hero-team.jpg` (em pé, 1000×1250) e `assets/img/hero-team-wide.jpg` (horizontal, 1440×900) | duas versões recortadas da mesma foto |
| `2.1.jpeg` / `2.2.jpeg` (antes / depois) | `assets/img/before-1.jpg` / `assets/img/after-1.jpg` | o de arrastar: as duas fotos precisam ter o mesmo enquadramento |
| `3.1.PNG` / `3.2.PNG` (antes / depois) | `assets/img/before-2.jpg` / `assets/img/after-2.jpg` | converter para JPG |
| Galeria: House cleaning 1-5, House Cleaning 2, End of lease 1, Spring Cleaning 1-3, carpet cleaning 1-3, windows 1-4 | `assets/img/gallery/` | acrescentar cada uma na aba certa em `gallery` (`config.js`); as abas Carpet, Spring e Commercial aparecem sozinhas quando tiverem fotos |
| `Cancelation Policy - Ativa Cleaning Services.pdf` | `assets/docs/cancellation-policy.pdf` | os links (FAQ e rodapé) aparecem sozinhos |
| `mapa.jpeg` + lista de bairros | `serviceArea.suburbs` em `config.js` | um pino por bairro: `{ name, lat, lng }` |
| Texto de apoio do topo (Danubia) | `index.html`, procure `TEXTO PROVISÓRIO` | |

Fotos da aba Extras: hoje são de janelas; trocar em `#panel-extras` no `index.html` quando houver fotos de carpete/vapor.

Ainda para confirmar com o Roni: se o horário 8:30am – 4:30pm é de segunda a sexta; o WhatsApp no mesmo número do
telefone; o ID do Meta Pixel; e se pode mostrar a foto da equipe na frente da Eden Academy (cliente).

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
├── assets/js/config.js     contatos, avaliações, galeria, mapa, PDF, formulário, Meta Pixel, redes
├── assets/js/app.js        menu, porta-retrato que se limpa, abas de serviços, antes/depois, galeria, mapa, formulário
├── assets/img/             logo, fotos reais, ícones e imagem de prévia (gallery/: fotos da galeria)
├── assets/docs/            política de cancelamento (PDF)
└── tools/og.html           página da imagem de prévia (não vai para o ar)
```

Fontes: Bricolage Grotesque (títulos, pesada e geométrica como o logo) e Instrument Sans (textos), do Google Fonts.
Cores: o teal `#71C8D1` e o verde-menta `#8CF8C5` do logo, com o azul-marinho do uniforme `#0C2236`.
