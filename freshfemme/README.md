# FreshFemme Thermal — tema Shopify

Tema novo para a loja [freshfemme.com.br](https://freshfemme.com.br), feito do zero para a Shopify (Online Store 2.0).
Conceito: **do calor ao frescor**. A capa é uma câmera térmica em 3D: uma mulher aparece em vermelho/laranja
(o fogacho), borrifa o spray no pescoço e o azul gelado vai descendo pelo corpo, com a temperatura caindo no visor.
Depois, conforme a cliente rola, o site "esfria" para tons de menta e creme.

![Capa no calor e no frescor](docs/capa.jpg)

| Pasta / arquivo | O que é |
| --- | --- |
| `freshfemme-thermal-theme.zip` | O tema pronto para subir na Shopify. |
| `theme/` | Código-fonte do tema (Liquid, CSS, JS). |
| `preview/` | Servidor local que mostra o tema com os produtos reais da loja, sem precisar da Shopify. |
| `docs/` | Capturas de tela e vídeos da capa animada para mostrar ao cliente: `capa.mp4` (computador) e `capa-celular.mp4` (vertical, bom para WhatsApp). |

## Como instalar na loja

1. No admin da Shopify: **Loja virtual → Temas → Adicionar tema → Fazer upload de arquivo zip** e escolha
   `freshfemme-thermal-theme.zip`. O tema entra como rascunho; o tema atual continua no ar.
2. Clique em **Personalizar** no tema novo. A página inicial já vem montada com os produtos, coleções e
   imagens que estão na loja hoje.
3. Para mostrar ao Fabiano antes de publicar: nos três pontinhos do tema → **Visualizar** → **Compartilhar
   prévia**. O link funciona por 14 dias, sem precisar de login.
4. Quando estiver aprovado: **Publicar**.

### Depois de instalar, conferir

- **Template do spray**: abra o produto *Spray Refrescante Para Calores Menopausa* no admin e, em
  *Modelo do tema*, escolha **`product.spray`**. Ele mostra a escolha de kits (1 unidade / Kit 2 / Kit 3 / Kit 5,
  com preço por unidade), a história "do calor ao frescor", o vídeo do Shark Tank e as dúvidas.
  Os outros produtos usam o modelo padrão.
- **WhatsApp**: *Configurações do tema → WhatsApp* → número com DDI e DDD (ex.: `5511999999999`).
  Enquanto estiver vazio, o botão flutuante não aparece.
- **Foto da Mariá** na seção *Fundadora* (hoje aparecem as iniciais "MM").
- **Menus**: o cabeçalho usa o menu `main-menu`. Os links das colunas *Institucional* e *Atendimento* do rodapé
  ficam no próprio bloco do rodapé (um por linha: `Texto | /endereço`) e já vêm com as páginas atuais da loja.
- **Parcelamento**: *Configurações do tema → Vendas*. Vem configurado com 12x e 4,27% de juros ao mês, que é o
  que reproduz as parcelas mostradas hoje no site. Use 0 para "sem juros". Também dá para mostrar o preço no Pix.
- **Frete grátis**: R$ 150 (barra de progresso no carrinho e aviso na página do produto).
- **Textos da capa**: as temperaturas do visor (38,4 °C → 31,2 °C) são ilustrativas e há um aviso
  "Representação artística do efeito refrescante". Se a marca tiver os números reais da câmera térmica do
  vídeo, é só trocar em *Capa térmica*.

## O que tem no tema

**Página inicial** (todas as seções podem ser reordenadas, duplicadas ou removidas no editor):

- **Capa térmica 3D** — WebGL desenhado em código (não usa foto, então não aparece tom de pele). Reage ao
  mouse, roda a 30 quadros por segundo, para quando sai da tela, baixa a resolução sozinha em aparelho fraco e
  troca por uma imagem estática se mesmo assim ficar lento ou se o navegador não tiver 3D. Quem usa "reduzir
  movimento" vê o quadro final parado.
- **Faixa de selos** em letreiro (Anvisa, premiado 2x, vegano…).
- **Vitrine com abas** (Elas amam / Spray / VivaAge / Kits presentes) com adicionar rápido.
- **História do spray** — termômetro que esfria conforme a rolagem, passos que acendem, números animados e
  botão de compra.
- **Categorias** em mosaico com inclinação 3D no mouse.
- **Vídeo** do Shark Tank (o YouTube só carrega quando clicam, para não pesar).
- **Resultados reais** do Sérum (também aceita antes × depois com arrastar).
- **Fundadora**, **Promoção com contagem regressiva**, **Perguntas frequentes** (com marcação para o Google),
  **Newsletter**.
- Extras para usar onde quiser: **Texto**, **Imagem com texto**, **Depoimentos** (use só depoimentos reais).

**Loja inteira**: cabeçalho centralizado que fica transparente sobre a capa e some ao descer; menu mobile
animado; busca com resultados enquanto digita; carrinho lateral com barra de frete grátis e "Leve também";
página de produto com galeria e zoom, escolha de kits, "Comprar agora", barra fixa de compra e produtos
relacionados; coleção com filtros (app Search & Discovery) e ordenação; carrinho, busca, páginas, contato,
blog, 404, senha, vale-presente e todas as telas de conta.

Tudo em português, com textos editáveis em `theme/locales/pt-BR.default.json`.

## Preview local

Mostra o tema renderizado com os 31 produtos e 7 coleções reais (salvos em `preview/data/`), com carrinho
funcionando em memória. Precisa do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
cd freshfemme/preview
npm install
npm run dev        # abre em http://localhost:4000
npm run zip        # gera de novo o freshfemme-thermal-theme.zip depois de mexer no tema
```

O preview imita a Shopify só o suficiente para ver o visual; a referência final é sempre a prévia dentro da
própria loja. Para editar direto na loja com recarregamento automático, use o Shopify CLI:
`shopify theme dev --path freshfemme/theme --store freshfemme.myshopify.com`.

## Verificação

- `shopify theme check` (linter oficial): 77 arquivos, nenhum problema.
- Testado no navegador (Chromium) em 1440, 1280, 1024 e 390 px: adicionar ao carrinho pelo card e pela página,
  mudar quantidade, remover, abas, busca, troca de kit (preço e parcelas atualizam), acordeões e menu mobile,
  sem erros no console.
