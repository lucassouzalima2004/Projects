# Art with Love by Lulu · loja

Loja virtual da Luciene (Lulu), que faz laços de cabelo de luxo e velas de aniversário em biscuit em Londres.
Site todo em inglês britânico, preços em libras, entrega pelo Royal Mail e pagamento com cartão, Apple Pay e Google Pay pelo Stripe.

HTML, CSS e JavaScript puros, sem build. O servidor é o Cloudflare Pages (de graça), com três funções pequenas em `functions/`.

## O que tem na loja

- **Início**: título animado, "varal" com as cartelas dos laços balançando, coleções, vitrine, a parte da régua
  ("Every bow is shown with a ruler", ideia dela), seleções especiais, velas sob encomenda e Instagram.
- **Loja** (`/shop` e `/shop/<coleção>`): filtros e ordenação sem recarregar a página, contagem de peças.
- **Produto** (`/product/<id>`): galeria com miniaturas, deslizar no celular e foto ampliada, cores com fotos
  próprias, quantidade, aviso de estoque baixo, perguntas pelo WhatsApp, detalhes, tamanho, entrega e segurança,
  sugestões e barra de compra fixa no celular.
- **Sacola**: gaveta lateral, quantidade, remover, barra de "frete grátis", sacola salva no aparelho.
- **Checkout**: página de pagamento do Stripe com entrega, telefone, cupom de desconto e recado para presente.
  Sem o Stripe ligado, o mesmo botão vira **"Order on WhatsApp"** com o pedido pronto.
- **Made to order** (`/made-to-order`): velas e laços sob encomenda, como funciona e formulário que abre o WhatsApp.
- **Busca** (lupa ou tecla `/`), **Our story**, **Help** (entrega, devolução, cuidados, pagamento, contato),
  **Privacy & terms**, **Thank you** depois do pagamento e página 404.
- Prévia bonita do link de cada produto no WhatsApp/Instagram (`assets/og/`), dados estruturados para o Google
  Shopping, `sitemap.xml` e `robots.txt` automáticos.
- Meta Pixel opcional para os anúncios, só depois de a cliente aceitar os cookies (exigência do Reino Unido).
- Animações desligadas automaticamente para quem ativou "reduzir movimento".

## Antes de mostrar para ela

O conteúdo foi montado a partir das conversas do WhatsApp. Confirme e troque em `public/assets/js/catalog.js`:

- [ ] **Preços** de todos os produtos (os atuais são de exemplo, entre £9 e £16)
- [ ] **Frete**: valores do Royal Mail e o mínimo para frete grátis (hoje £3.50 / £4.95, grátis acima de £35)
- [ ] Nomes e descrições dos produtos (escritos a partir das legendas que ela mandou)
- [ ] Estoque: peças únicas ganham `stock: 1`; esgotadas, `stock: 0`
- [ ] Prazo das encomendas (`madeToOrder.leadTime`, hoje "2–3 weeks")
- [ ] Fotos das velas que ela já fez: ela perguntou se pode mostrar as já vendidas. Pode: entram em
      `madeToOrder.gallery` como "Past commissions"
- [ ] E-mail da loja (`email`), se ela tiver um
- [ ] Textos de "Our story" (`about` em `views.js`): falam da técnica brasileira do biscuit
- [ ] Política de devolução e privacidade (`help` e `legal` em `views.js`): seguem as regras do Reino Unido para
      quem vende pela internet. A lei pede também nome e endereço comercial do vendedor
- [ ] WhatsApp que recebe os pedidos (hoje o iPhone da loja, `447575206135`)

Observação: o tema "Lion King" virou **The Savannah Edit** (Warthog, Lion Cub e Monkey Branch Bow) para não usar
a marca da Disney na loja. A foto do caderno com a senha do Instagram ficou fora do repositório.

## Como editar

Quase tudo fica em **`public/assets/js/catalog.js`**:

| O quê | Onde |
| --- | --- |
| WhatsApp, Instagram, e-mail | `whatsapp`, `instagram`, `email` |
| Endereço final do site | `siteUrl` (ex.: `'https://artwithlovebylulu.co.uk'`) |
| Frete e frete grátis | `shipping` |
| Coleções e filtros | `collections` |
| Produtos, preços, cores e estoque | `products` |
| Promoção | `was: 14` no produto mostra o preço antigo riscado |
| Vitrine da página inicial | `featured: true` no produto |
| Velas sob encomenda | `madeToOrder` |
| Meta Pixel | `metaPixelId` |

Os preços são conferidos de novo no servidor na hora de pagar, lendo este mesmo arquivo. Ninguém consegue mudar o
preço pelo navegador.

### Produto novo

1. Fotos com a régua, como ela já faz. Na pasta `art-with-love`:

   ```bash
   python3 tools/prepare_images.py foto1.jpg foto2.jpg --name unicorn-bow
   ```

   Use `--rotate ccw` (ou `cw`) se a foto estiver deitada. Cada foto vira duas WebP em `public/assets/products/`.
   Para um produto com cores, rode uma vez por cor com `--name <produto>-<cor>` (ex.: `headband-duo-sky-coral`).
2. Acrescente o produto em `products` no `catalog.js` (copie um parecido).
3. Gere a prévia do link e a miniatura do checkout:

   ```bash
   python3 tools/share_images.py
   ```

Precisa de Python com Pillow (`pip install pillow`) e do Node.

## Pagamento (Stripe)

1. Crie a conta em <https://dashboard.stripe.com/register> com os dados dela (país: United Kingdom).
2. Em **Developers → API keys**, copie a **Secret key** (`sk_live_…`). Para testar antes, use a `sk_test_…`
   e o cartão `4242 4242 4242 4242`.
3. No GitHub: **Settings → Secrets and variables → Actions → New repository secret**, nome `STRIPE_SECRET_KEY`.
4. Rode o workflow (**Actions → Deploy Art with Love → Run workflow**). Ele guarda a chave no Cloudflare e publica.

Ela vê os pedidos, endereços e recados de presente no app do Stripe no celular. Em **Settings → Notifications**
dá para receber um e-mail a cada venda, e em **Settings → Customer emails** ligar o recibo automático para a
cliente. Cupons de desconto são criados em **Product catalogue → Coupons** e aparecem no checkout.

Apple Pay e Google Pay já vêm ligados no checkout do Stripe. Se não aparecerem, confira em
**Settings → Payment methods**.

## Publicar

O workflow `.github/workflows/deploy-art-with-love.yml` publica a cada push que mexe em `art-with-love/`.
Na primeira vez ele cria o projeto `artwithlove-by-lulu`, e a loja fica em <https://artwithlove-by-lulu.pages.dev>
(se o nome estiver em uso, o Cloudflare acrescenta um sufixo; o endereço certo aparece no resumo da execução).

Precisa dos mesmos secrets do site da manicure: `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`
(veja `nail-studio/README.md`). Sem eles, o workflow só avisa e não publica.

### Domínio .co.uk

1. Compre o domínio (ex.: `artwithlovebylulu.co.uk`) em qualquer registrador. Custa poucas libras por ano.
2. No Cloudflare: **Workers & Pages → artwithlove-by-lulu → Custom domains → Set up a domain**.
3. Ponha o endereço em `siteUrl` no `catalog.js`, para os links de prévia e o Google usarem o domínio certo.

Hospedagem e funções ficam no plano grátis do Cloudflare. O único custo fixo é o domínio. O Stripe cobra por venda.

## Ver no computador

As rotas (`/shop`, `/product/...`) e o checkout precisam do servidor do Cloudflare. Na pasta `art-with-love`:

```bash
npx wrangler pages dev public
```

Abra o endereço que aparecer (normalmente <http://localhost:8788>). Para testar o Stripe localmente, crie um arquivo
`.dev.vars` (fica fora do Git) com `STRIPE_SECRET_KEY=sk_test_…`.

## Estrutura

```
art-with-love/
├── public/                      o site
│   ├── index.html               estrutura fixa (topo, rodapé, sacola, busca)
│   ├── assets/js/catalog.js     catálogo: produtos, preços, frete, contato
│   ├── assets/js/views.js       páginas (início, loja, produto, encomendas, ajuda…)
│   ├── assets/js/app.js         rotas, sacola, checkout, busca, animações
│   ├── assets/js/lib.js         sacola salva no aparelho e funções comuns
│   ├── assets/css/shop.css      visual (cores e fontes no topo)
│   ├── assets/products/         fotos dos produtos (WebP) e miniaturas do checkout
│   ├── assets/og/               prévias de link de cada produto
│   ├── _headers, _routes.json   cache e segurança no Cloudflare
│   └── site.webmanifest         ícone ao salvar no celular
├── functions/
│   ├── api/checkout.js          confere a sacola e abre o pagamento no Stripe
│   ├── api/order.js             resumo do pedido na página "Thank you"
│   ├── _middleware.js           título, prévia e 404 certos em cada endereço
│   ├── sitemap.xml.js, robots.txt.js
└── tools/
    ├── prepare_images.py        fotos do celular → WebP
    ├── share_images.py          prévias de link, miniaturas e ícones
    └── fonts/                   fontes usadas pelas prévias
```

Fontes do site: Bodoni Moda (títulos), Jost (textos) e Allura (logo), do Google Fonts.
As cores holográficas vêm das cartelas dela, e o fundo escuro com brilho combina com o glitter das fotos.
