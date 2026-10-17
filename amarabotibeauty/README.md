# Amarabotibeauty · site

Loja de produtos **O Boticário na Itália** (cliente: Jean, WhatsApp da logo +39 351 420 4866), em português e italiano.
Vitrine com estoque, sacola e pedido pelo WhatsApp. Visual preto e dourado da logo, tudo centralizado e animado.

É HTML, CSS e JavaScript puros: sem build e sem bibliotecas. Dá para abrir o `index.html` direto no navegador.

## O que tem no site

- **Topo**: o medalhão da logo girando devagar dentro de um anel de texto (perfumaria, corpo & banho, maquiagem...),
  brilhos dourados flutuando como os da logo, título entrando palavra por palavra e um traço dourado que se desenha.
  No computador, o medalhão acompanha o mouse.
- **Faixa dourada** correndo com as linhas (Lily, Malbec, Floratta, Nativa SPA...). Ela é montada sozinha a partir dos produtos.
- **Vitrine**: categorias (o botão dourado desliza até a escolhida), busca sem acento, "Ver mais" de 12 em 12.
  Cada produto mostra linha, nome, tamanho, preço e o estoque: "Em estoque", "Últimas 2 unidades" ou "Esgotado".
  Esgotados vão para o fim da lista e trocam o botão por **Avise-me** (abre o WhatsApp pedindo aviso).
  A sacola nunca deixa pegar mais do que tem em estoque.
- **Frascos desenhados**: enquanto não há fotos, o site desenha cada produto (perfume redondo, quadrado, alto, loção com
  válvula, pote, bisnaga, spray, sérum, gloss, blush, máscara, kit de presente) na cor do produto, com o nome da linha
  no rótulo. Quando houver foto, ela entra no lugar do desenho.
- **Detalhes** do produto numa janela (toque na imagem).
- **Mais amados**: carrossel com os produtos marcados como destaque, troca sozinho a cada 6,5 s (pausa com o mouse em cima,
  no botão de pausa ou fora da tela), setas, pontos e arrastar no celular. O fundo muda para a cor do produto.
- **Como comprar** em 3 passos, **Sobre**, **Dúvidas frequentes**, chamada final e rodapé.
- **Sacola**: abre de lado no computador e de baixo no celular. Soma o total, pede nome, retirada ou entrega (com cidade)
  e observações, e abre o WhatsApp com o pedido pronto:

  ```
  Olá, Amarabotibeauty! Quero fazer um pedido:

  • 2× Lily Eau de Parfum (75 ml) – € 129,80
  • 1× Malbec Eau de Toilette (100 ml) – € 49,90

  *Total: € 179,70*

  Nome: Ana
  Entrega: Receber em casa (Milano)
  ```

  A sacola e o nome ficam guardados no celular da cliente se ela fechar o site.
- **Português e italiano**: automático pelo idioma do celular (italiano para quem usa em italiano, português para o resto),
  com o botão PT/IT. O preço segue o formato de cada idioma (€ 37,40 / 37,40 €).
- Botão fixo do WhatsApp (computador), barra fixa com WhatsApp e sacola (celular), barra de progresso da página,
  prévia bonita do link no WhatsApp (`og-image.jpg`), dados para o Google e página 404.

As animações são desligadas automaticamente para quem ativou "reduzir movimento" no celular ou no computador.

## Como editar

| O quê | Onde |
| --- | --- |
| Produtos, preços e estoque | `assets/js/products.js` (ou a planilha do Google, abaixo) |
| WhatsApp que recebe os pedidos | `whatsapp` e `whatsappLabel` em `assets/js/content.js` |
| Instagram | `instagram` em `assets/js/content.js` (vazio esconde o ícone) |
| A partir de quantas unidades aparece "Últimas unidades" | `lowStock` em `assets/js/content.js` |
| Categorias da vitrine | `categories` em `assets/js/content.js` |
| Todos os textos (português e italiano) | `text.pt` e `text.it` em `assets/js/content.js` |
| Cores e fontes | topo de `assets/css/styles.css` |
| Logo | `assets/img/logo.webp` (medalhão) e `logo-360.webp` (Sobre e 404) |

Se a página ficar em branco depois de uma edição, quase sempre é uma vírgula ou aspa faltando. O site mostra um aviso
vermelho no topo quando isso acontece.

## Estoque pela planilha do Google (o "painel" do cliente)

Com a planilha ligada, o cliente atualiza produtos, preços e quantidades pelo app do Google Planilhas no celular,
sem mexer no site. O site lê a planilha toda vez que alguém abre a página.

1. No Google Drive: **Novo → Planilha**. Depois **Arquivo → Importar → Fazer upload** e escolha
   `tools/catalogo-modelo.csv` (já vem com os produtos do site). Em "Local da importação", **Substituir planilha**.
2. **Arquivo → Compartilhar → Publicar na Web**: escolha a aba, formato **Valores separados por vírgula (.csv)**, e publique.
3. Copie o link (termina em `output=csv`) e cole em `sheetCsv` no `assets/js/content.js`. Publique o site.
4. Compartilhe a planilha com o cliente (como editor).

Colunas (a primeira linha precisa ter estes nomes; a ordem não importa):

| Coluna | O que é |
| --- | --- |
| `nome` | obrigatório. `nome_it` é o nome em italiano (se for diferente) |
| `estoque` | quantidade. **0 ou vazio = esgotado** (o produto continua na vitrine com "Avise-me") |
| `preco` | em euro: `37,40` ou `37.40` |
| `categoria` | Perfumes, Corpo & banho, Cabelos, Rosto, Maquiagem, Masculino, Kits & presentes. Um nome novo vira uma categoria nova |
| `linha` | Lily, Malbec, Nativa SPA... (aparece em cima do nome e na faixa dourada) |
| `tamanho` | 75 ml, 200 g... |
| `destaque` | `sim` = entra em "Mais amados" |
| `novo` | `sim` = selo "Novo" |
| `foto` | nome do arquivo em `assets/img/produtos/` ou link completo de uma imagem |
| `id` | opcional: um nome único sem espaço (se vazio, é feito a partir do nome) |
| `cor`, `desenho` | opcionais: cor e formato do frasco desenhado (sem eles, o site escolhe pela linha e pelo nome) |
| `familia`, `descricao` | opcionais (e `familia_it`, `descricao_it` em italiano) |

Observações:

- O Google leva **até 5 minutos** para atualizar a versão publicada depois de uma mudança.
- Se a planilha não carregar (sem internet, link errado), o site mostra a lista do `products.js`.
- Se um produto da sacola esgotar, a cliente vê um aviso quando voltar ao site, e a sacola se ajusta sozinha.
- Para regerar o modelo depois de mudar o `products.js`: `node amarabotibeauty/tools/exportar-planilha.mjs`.

## Fotos dos produtos

Coloque as fotos em `assets/img/produtos/` (crie a pasta) e preencha `photo` no `products.js` (ou a coluna `foto`).
Funcionam melhor com **fundo transparente** (PNG ou WebP), frasco em pé e centralizado, uns 800 px de altura:
o brilho e a sombra do site ficam por trás. Use fotos próprias do cliente ou as oficiais do material de revenda,
se a revenda permitir.

## Antes de mostrar para o cliente

O conteúdo atual é de **exemplo**. Confirme com Jean e troque:

- [ ] Produtos, preços e quantidades (hoje são 28 produtos de exemplo, com nomes e preços de oboticario.pt em out/2026)
- [ ] WhatsApp que recebe os pedidos: usei o da logo (351 420 4866). A conversa no WhatsApp veio de outro número (+39 333 546 1353)
- [ ] Instagram (Jean tem, mas usa pouco)
- [ ] Cidade e entrega: retira pessoalmente? Envia para toda a Itália? Frete e prazo? (pergunta "Vocês entregam?")
- [ ] Formas de pagamento (pergunta "Como funciona o pagamento?")
- [ ] Se é revenda oficial ou independente (rodapé: "Revenda independente de produtos O Boticário") e se todos os produtos
      são lacrados (pergunta "Os produtos são originais?")
- [ ] Texto do "Sobre" (hoje é genérico: "nasceu para levar os perfumes e cuidados do Boticário para quem vive na Itália")
- [ ] Descrições e famílias dos perfumes
- [ ] Fotos dos produtos
- [ ] Planilha de estoque ligada e compartilhada (seção acima)
- [ ] Domínio próprio, se quiser (variável `AMARA_SITE_URL` no workflow)

## Ver no computador

```bash
cd amarabotibeauty
python3 -m http.server 8000
# abra http://localhost:8000
```

Para forçar um idioma: `index.html?lang=it` ou `index.html?lang=pt`.

## Publicar

O workflow `.github/workflows/deploy-amarabotibeauty.yml` publica o site no Cloudflare (Worker `amarabotibeauty`)
a cada push que mexe em `amarabotibeauty/`, no `main` ou no branch `claude/amazing-heisenberg-oh6er8`.
O link fica em `https://amarabotibeauty.<conta>.workers.dev` e aparece no resumo da execução, em **Actions**.
Usa os mesmos secrets dos outros sites (`CLOUDFLARE_API_TOKEN` e, opcional, `CLOUDFLARE_ACCOUNT_ID`).

Enquanto estiver no endereço `.workers.dev`, o Google não indexa (`_headers`). O workflow também troca o `og:image`
pelo endereço completo (o WhatsApp exige) e gera `sitemap.xml` e `robots.txt`. A pasta `tools/` e este README não vão para o ar.

Para refazer a imagem de prévia do link: abra `tools/og.html` com a janela em 1200×630 e salve um print
como `assets/img/og-image.jpg`.

## Estrutura

```
amarabotibeauty/
├── index.html               estrutura da página
├── 404.html                 página não encontrada
├── _headers                 cabeçalhos do Cloudflare
├── assets/css/styles.css    visual (cores e fontes no topo do arquivo)
├── assets/js/content.js     contato, categorias, planilha e textos PT/IT
├── assets/js/products.js    produtos, preços e estoque
├── assets/js/app.js         comportamento (vitrine, sacola, pedido, desenhos, animações, planilha)
├── assets/img/              logo, ícones e imagem de prévia do link
└── tools/                   imagem de prévia (og.html) e modelo da planilha (não vão para o ar)
```

Fontes: Bodoni Moda (títulos), Great Vibes (assinatura, como a logo) e Jost (textos), do Google Fonts.
