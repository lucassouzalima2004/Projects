# Bora Signs · site

Novo site da [Bora Signs](https://www.borasigns.com.au) (Adelaide), para substituir o Wix.
É HTML, CSS e JavaScript puros, gerado por um script Node sem dependências: cada serviço vira uma página própria,
com título, descrição e dados estruturados para o Google, e os anúncios podem apontar direto para a página certa.

## O que tem no site

- **Home**: vídeo de fundo com fotos reais de instalação, título animado, faixa de serviços que acelera com a rolagem,
  números, serviços, seção "One less thing" (o camaleão no meio das tarefas do dono do negócio), processo em 4 passos,
  trabalhos recentes em rolagem horizontal, clientes, depoimentos, dúvidas e chamada final.
- **Uma página por serviço** (13), com os mesmos endereços do Wix: `/vehicle-signage`, `/shopfront-signage`, `/window-graphics`,
  `/office-signage`, `/decor` etc. Cada uma tem por que contratar, opções, fotos, depoimento, processo, dúvidas e serviços relacionados.
- **Van antes/depois** em `/vehicle-signage`: arrastando, a van branca vai sendo envelopada e o preço indicativo sobe de
  **$500** (logo e letreiro) até **$7.000** (envelopamento completo). O botão "Get my exact quote" leva ao formulário já
  com o serviço e o pacote preenchidos.
- **Orçamento** (`/contact`), **Trabalhe conosco** (`/join-us`), **todos os serviços** (`/services`) e página 404.
- Rolagem suave, olho do camaleão que segue o mouse, textos que entram palavra por palavra. Tudo é desligado para quem
  ativou "reduzir movimento" no celular ou no computador.
- Barra fixa de "Ligar / Orçamento" no celular e prévia bonita do link (`og-image.jpg`).

## Como editar

| O quê | Onde |
| --- | --- |
| Telefone, e-mail, endereço, ABN, redes sociais | `src/site.mjs` |
| Meta Pixel | `metaPixelId` em `src/site.mjs` (hoje vazio: o pixel `1070067669184384` é do Bora Decor) |
| Para onde vão os formulários | `form` em `src/site.mjs` (veja abaixo) |
| Preços da van ($500 → $7.000) e nomes dos pacotes | `wrapEstimate` em `src/site.mjs` |
| Números da home (15+ anos etc.) e logos de clientes | `stats` e `clients` em `src/site.mjs` |
| Textos de cada serviço, título e descrição do Google, dúvidas | `services` em `src/content.mjs` |
| Processo, depoimentos da home, dúvidas da home, fotos da faixa "Recent work" | `src/content.mjs` |
| Layout das páginas | `src/render.mjs` |
| Cores e fontes | topo de `public/assets/css/site.css` |
| Animações e interações | `public/assets/js/site.js` |

Fotos novas: coloque em `public/assets/img/work/` como `<nome>-800` e `<nome>-1600`, em `.avif` e `.webp`
(mais um `.jpg` de 1200 px para a prévia do link), e registre largura e altura em `src/images.mjs`.

O vídeo do topo (`public/assets/video/hero.mp4` deitado e `hero-mobile.mp4` em pé) foi montado com as fotos de instalação
do site atual. Se a Bora tiver um vídeo próprio, é só trocar os arquivos mantendo os nomes (e os pôsteres `hero-poster*`,
que são o primeiro quadro).

## Ver no computador

```bash
node build.mjs          # gera a pasta dist/
npx serve dist          # abre em http://localhost:3000 (entende /vehicle-signage sem o .html)
```

## Formulários

Sem configuração, o formulário abre o e-mail do visitante com a mensagem pronta para `sales@borasigns.com.au`.
Para receber direto, sem depender do app de e-mail, crie uma chave grátis no [Web3Forms](https://web3forms.com)
com o e-mail da Bora e preencha em `src/site.mjs`:

```js
form: {
  endpoint: 'https://api.web3forms.com/submit',
  fields: { access_key: 'a-chave-que-eles-mandam' },
},
```

(Formspree também funciona: `endpoint: 'https://formspree.io/f/xxxx'` e `fields: {}`.)
Quando houver um pixel da Bora Signs em `metaPixelId`, cada envio conta como **Lead** e cliques em telefone e e-mail
contam como **Contact**.

## Publicar

O workflow `.github/workflows/deploy-bora-signs.yml` monta o site e publica no Cloudflare como **Worker** com arquivos
estáticos (a conta já chegou ao limite de projetos do Pages, como nos outros sites do repositório), sempre no mesmo link:
`https://bora-signs.<subdomínio da conta>.workers.dev`. O endereço exato aparece no resumo da execução em **Actions**.
Usa o secret `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, se existir).
O `worker.js` só entra em dois casos: nos vídeos, para entregar o pedaço do arquivo que o navegador pede (sem isso o
iPhone não toca o vídeo do topo), e em endereços que não existem (página 404 sem cache).

Enquanto o site não estiver no domínio, o link fica fora do Google (`noindex`), para não competir com o site atual no Wix.
Quando `www.borasigns.com.au` apontar para o Worker, crie a variável `BORASIGNS_SITE_URL` = `https://www.borasigns.com.au`
em **Settings → Secrets and variables → Actions → Variables** e rode o workflow de novo: o site passa a ser indexado,
com o domínio no canonical, no sitemap e na prévia do link.

### Domínio e e-mails (hoje no Wix)

Os e-mails (Google Workspace) continuam no Google: só o site muda de lugar. Um Worker só atende um domínio cujo DNS
esteja no Cloudflare, então:

1. No Cloudflare: **Add a domain** → `borasigns.com.au`. Ele importa os registros atuais; **confira que os MX, TXT
   (SPF/DKIM/DMARC) e CNAME do Google vieram todos**, iguais aos do Wix. São eles que mantêm os e-mails funcionando.
2. No Wix: trocar os nameservers do domínio pelos dois que o Cloudflare mostrar. Se o Wix não deixar trocar
   (domínio comprado nele), transferir o registro do domínio para fora do Wix (precisa do código de transferência e da ABN).
3. Com o domínio ativo no Cloudflare: **Workers & Pages → bora-signs → Settings → Domains & Routes → Add → Custom domain**
   → `www.borasigns.com.au` (e `borasigns.com.au`, ou uma regra redirecionando o domínio sem `www` para o `www`).
4. Criar a variável `BORASIGNS_SITE_URL` (veja acima) e rodar o workflow.

O endereço oficial do site é `https://www.borasigns.com.au` (o mesmo do Wix). Se mudar, troque `url` em `src/site.mjs`.

### Endereços antigos

Os endereços do Wix foram mantidos. Os que mudaram redirecionam sozinhos (301), então anúncios e Google continuam
caindo na página certa: `/copy-of-vehicle-signage → /trailer-wrap`, `/contact-8 → /join-us`, `/home → /`.
Para adicionar outros, edite `redirects` em `build.mjs`.

## SEO

- Título e descrição únicos por página, com a palavra-chave e "Adelaide"; um `h1` por página.
- Dados estruturados: `LocalBusiness` (endereço, telefone, ABN, redes), `Service` em cada serviço, `BreadcrumbList` e `FAQPage`.
- `sitemap.xml` e `robots.txt` gerados no build; links canônicos e prévias (Open Graph) em todas as páginas.
- Imagens em AVIF/WebP com tamanho certo para cada tela, fonte hospedada no próprio site, vídeo carregado só depois da página.
- Lighthouse (celular): Desempenho 92, Acessibilidade 100, SEO 100 na home.

Depois de publicar no domínio: cadastre o site no [Google Search Console](https://search.google.com/search-console),
envie `https://www.borasigns.com.au/sitemap.xml` e, se pedirem verificação por meta tag, cole o código em
`googleSiteVerification` em `src/site.mjs`.

## Antes de publicar no domínio

- [ ] Preços da van: $500 e $7.000 foram os exemplos do Carlos. Confirmar valores e nomes dos pacotes (`wrapEstimate`).
- [ ] Depoimentos: vieram do Wix. Confirmar que são de clientes reais (os sem nome aparecem como "Bora Signs client").
- [ ] Horário de atendimento (o Wix não tinha; dá para incluir no `site.mjs` e nos dados do Google).
- [ ] Formulário: configurar o Web3Forms (ou manter o envio por e-mail).
- [ ] Meta Pixel da Bora Signs (se houver): colocar em `metaPixelId`. O `1070067669184384` é do Bora Decor.
- [ ] Endereço do Bora Decor, se quiser um link da página `/decor` para o site da Decor.

## Estrutura

```
bora-signs/
├── build.mjs               gera dist/: páginas, sitemap, robots.txt e _redirects
├── worker.js               vídeos por pedaço (iPhone) e 404 no Cloudflare
├── src/
│   ├── site.mjs            dados da empresa e configurações
│   ├── content.mjs         textos de todas as páginas
│   ├── render.mjs          HTML das páginas
│   ├── van.mjs             desenho da van do antes/depois
│   ├── logo.mjs            logo vetorizado (o olho do camaleão é separado para poder se mexer)
│   └── images.mjs          tamanhos das fotos
└── public/                 copiado como está para dist/
    ├── _headers            cache e cabeçalhos de segurança do Cloudflare
    └── assets/             css, js, fontes (Archivo, licença OFL), imagens e vídeos
```

`lenis.min.js` (rolagem suave) é a biblioteca [Lenis](https://github.com/darkroomengineering/lenis), licença MIT.
