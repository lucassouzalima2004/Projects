/* =============================================================================
   CATÁLOGO DA LOJA — tudo o que muda no dia a dia fica neste arquivo.
   -----------------------------------------------------------------------------
   • Marca, contato e redes ................. seção 1
   • Entrega (Royal Mail) ................... seção 2
   • Coleções (filtros da loja) ............. seção 3
   • Produtos e preços ...................... seção 4
   • Encomendas (velas e laços sob medida) .. seção 5

   O site é todo em inglês (britânico): "colour", "personalised", "favourite".
   Os preços são conferidos de novo no servidor na hora do pagamento
   (functions/api/checkout.js lê este mesmo arquivo), então mudar um preço
   aqui muda no site e no checkout ao mesmo tempo.

   Dica: mantenha as aspas e as vírgulas. Se a loja ficar em branco depois de
   uma edição, quase sempre é uma vírgula faltando.
   ========================================================================== */

export default {
  /* ---------------------------------------------------------------------------
     1. MARCA E CONTATO
     ------------------------------------------------------------------------- */
  brand: {
    name: 'Art with Love',
    by: 'by Lulu',
    maker: 'Luciene',            // Nome dela, usado no texto "Sobre"
    city: 'London',
    tagline: 'Luxury handmade bows',
  },

  // Endereço final do site (com https, sem barra no fim). Usado nas prévias de
  // link do WhatsApp/Instagram e no Google. Vazio = usa o endereço atual.
  siteUrl: '',

  // WhatsApp que recebe pedidos e encomendas: código do país + número, só dígitos.
  // 07575 206135 (iPhone da loja)  →  '447575206135'
  whatsapp: '447575206135',
  instagram: 'artwithlovebylulu',   // usuário sem @
  email: '',                        // ex.: 'hello@artwithlovebylulu.co.uk' (vazio = não aparece)

  currency: 'GBP',

  // Meta Pixel (anúncios no Instagram/Facebook). Vazio = desligado.
  // Quando preenchido, o site pede consentimento de cookies antes de carregar o pixel (lei do Reino Unido).
  metaPixelId: '',

  /* ---------------------------------------------------------------------------
     2. ENTREGA
     -------------------------------------------------------------------------
     ATENÇÃO: valores de exemplo. Confirme com ela os preços do Royal Mail.
     freeOver ... compras a partir deste valor têm a entrega padrão grátis
     ------------------------------------------------------------------------- */
  shipping: {
    freeOver: 35,
    countries: ['GB'],               // países aceitos no checkout
    dispatch: '1–2 working days',    // prazo para postar
    options: [
      { id: 'standard', name: 'Royal Mail Tracked 48', price: 3.5, days: [2, 3] },
      { id: 'express',  name: 'Royal Mail Tracked 24', price: 4.95, days: [1, 2] },
    ],
  },

  /* ---------------------------------------------------------------------------
     3. COLEÇÕES
     -------------------------------------------------------------------------
     kind: 'range' = categoria principal (cada produto tem uma)
     kind: 'edit'  = seleção extra; o produto entra se tiver o id em "tags"
     cover ......... foto usada no cartão da coleção (id do produto)
     ------------------------------------------------------------------------- */
  collections: [
    {
      id: 'statement-bows', kind: 'range', cover: 'mermaid-doll-bow',
      name: 'Statement Bows',
      blurb: 'Big, bold grosgrain bows, finished with pompoms, pearls and little cold porcelain characters.',
    },
    {
      id: 'sets-and-pairs', kind: 'range', cover: 'red-velvet-bow-pair',
      name: 'Sets & Pairs',
      blurb: 'Matching pairs and mix-and-match clip sets for bunches, plaits and fringes.',
    },
    {
      id: 'baby-headbands', kind: 'range', cover: 'headband-duo',
      name: 'Baby Headbands',
      blurb: 'Soft, stretchy nylon bands that stay put without pinching. Made for tiny heads.',
    },
    {
      id: 'porcelain', kind: 'edit', cover: 'bonnet-doll-bow',
      name: 'Porcelain Characters',
      blurb: 'Bows crowned with mermaids, teddies, dolls and rainbows in cold porcelain.',
    },
    {
      id: 'savannah', kind: 'edit', cover: 'safari-lion-cub-bow',
      name: 'The Savannah Edit',
      blurb: 'Sunny bows with savannah silhouettes, for little adventurers.',
    },
  ],

  /* ---------------------------------------------------------------------------
     4. PRODUTOS
     -------------------------------------------------------------------------
     ATENÇÃO: preços de exemplo. Substitua pelos preços dela (em libras).

     id .......... nome das fotos: assets/products/<id>-1-s.webp, -2-s.webp…
     photos ...... quantas fotos o produto tem
     range ....... coleção principal (seção 3, kind 'range')
     tags ........ seleções extras (seção 3, kind 'edit')
     price ....... em libras, número sem £
     was ......... opcional: preço antigo riscado (promoção)
     size ........ tamanho que aparece no cartão ('Large', 'Medium', 'Set of 2'…)
     stock ....... opcional: quantas peças restam (0 = esgotado; sem o campo = à venda)
     variants .... opcional: cores, cada uma com as próprias fotos
     featured .... aparece na vitrine da página inicial

     Para fotos novas, rode na pasta art-with-love:
       python3 tools/prepare_images.py foto1.jpg foto2.jpg --name id-do-produto
     ------------------------------------------------------------------------- */
  products: [
    {
      id: 'mermaid-doll-bow', photos: 2, range: 'statement-bows', tags: ['porcelain'], featured: true,
      name: 'Mermaid Doll Bow', size: 'Large', price: 16,
      summary: 'A peach grosgrain bow with a pink-haired cold porcelain mermaid, perched on the knot.',
      details: ['Large layered grosgrain bow', 'Cold porcelain mermaid with a sculpted tail', 'Alligator clip'],
    },
    {
      id: 'bonnet-doll-bow', photos: 2, range: 'statement-bows', tags: ['porcelain'], featured: true,
      name: 'Bonnet Doll Bow', size: 'Large', price: 16,
      summary: 'Blush grosgrain over iridescent glitter, with a little cold porcelain doll in a heart-embossed bonnet.',
      details: ['Large layered grosgrain bow', 'Glitter inner loops', 'Cold porcelain doll', 'Alligator clip'],
    },
    {
      id: 'teddy-bow', photos: 2, range: 'statement-bows', tags: ['porcelain'], featured: true,
      name: 'Teddy in Glasses Bow', size: 'Medium', price: 14,
      summary: 'Soft lilac grosgrain with a bookish cold porcelain teddy bear, glasses and all.',
      details: ['Layered grosgrain bow', 'Cold porcelain teddy bear', 'Alligator clip'],
    },
    {
      id: 'lollipop-bow', photos: 3, range: 'statement-bows', tags: ['porcelain'], featured: true,
      name: 'Lollipop Bow', size: 'Medium', price: 12,
      summary: 'Candy-pink grosgrain with a tiny cold porcelain lollipop, tied with its own satin bow.',
      details: ['Layered grosgrain bow', 'Cold porcelain lollipop', 'Alligator clip, ribbon-lined'],
    },
    {
      id: 'rainbow-cloud-bow', photos: 2, range: 'statement-bows', tags: ['porcelain'],
      name: 'Rainbow Cloud Bow', size: 'Medium', price: 13,
      summary: 'Powder-blue grosgrain scattered with micro pearls, finished with a cold porcelain rainbow and clouds.',
      details: ['Grosgrain bow with micro pearls', 'Cold porcelain rainbow', 'Alligator clip'],
    },
    {
      id: 'flamingo-pompom-bow', photos: 3, range: 'statement-bows', featured: true,
      name: 'Flamingo Pompom Bow', size: 'Medium', price: 12,
      summary: 'Sky-blue grosgrain layered with a flamingo print and a fluffy blush pompom in the middle.',
      details: ['Layered grosgrain bow', 'Flamingo print ribbon', 'Faux-fur pompom', 'Alligator clip, ribbon-lined'],
    },
    {
      id: 'rainbow-pompom-bow', photos: 2, range: 'statement-bows',
      name: 'Rainbow Pompom Bow', size: 'Medium', price: 10,
      summary: 'Baby-blue grosgrain over a rainbow ombré layer with gold stitching and a cloud-soft pompom.',
      details: ['Layered grosgrain bow', 'Rainbow ombré ribbon with gold stitch', 'Faux-fur pompom', 'Alligator clip'],
    },
    {
      id: 'pastel-layered-bow', photos: 2, range: 'statement-bows',
      name: 'Pastel Layered Bow', size: 'Medium', price: 11,
      summary: 'Three pastel layers in lilac, mint and blush, cinched with a sparkly glitter centre.',
      details: ['Three-layer grosgrain bow', 'Glitter centre band', 'Alligator clip'],
    },
    {
      id: 'lilac-organza-bow', photos: 2, range: 'statement-bows', featured: true,
      name: 'Lilac Organza Bow', size: 'Large', price: 14,
      summary: 'A cloud of lilac organza ribbon with sheer satin edges. Lovely on girls and grown-ups alike.',
      details: ['Large "flying ribbon" organza bow', 'Satin-edged sheer ribbon', 'Alligator clip', 'For girls and women'],
    },
    {
      id: 'safari-lion-cub-bow', photos: 2, range: 'statement-bows', tags: ['savannah'],
      name: 'Lion Cub Bow', size: 'Medium', price: 12,
      summary: 'Bright tangerine grosgrain with a matte lion cub silhouette mid-stride.',
      details: ['Layered grosgrain bow', 'Matte lion cub silhouette', 'Alligator clip'],
    },
    {
      id: 'safari-warthog-bow', photos: 2, range: 'statement-bows', tags: ['savannah'],
      name: 'Warthog Bow', size: 'Medium', price: 12,
      summary: 'Sunshine-yellow grosgrain with a cheeky warthog silhouette, tail up.',
      details: ['Layered grosgrain bow', 'Matte warthog silhouette', 'Alligator clip'],
    },
    {
      id: 'safari-monkey-bow', photos: 2, range: 'statement-bows', tags: ['savannah'],
      name: 'Monkey Branch Bow', size: 'Medium', price: 12,
      summary: 'Pale sky grosgrain with a little monkey swinging from its branch.',
      details: ['Layered grosgrain bow', 'Matte monkey silhouette', 'Alligator clip'],
    },
    {
      id: 'red-velvet-bow-pair', photos: 2, range: 'sets-and-pairs', featured: true,
      name: 'Red Velvet Bow Pair', size: 'Set of 2', price: 10,
      summary: 'A pair of plush red velvet bows wrapped in a band of rhinestones. Made for parties and Christmas.',
      details: ['Pair of velvet bows', 'Rhinestone centre band', 'Alligator clips'],
    },
    {
      id: 'denim-flamingo-bow-pair', photos: 2, range: 'sets-and-pairs',
      name: 'Denim Flamingo Bow Pair', size: 'Set of 2', price: 10,
      summary: 'Two denim-look bows with a flamingo print and blush knots. Perfect for bunches.',
      details: ['Pair of grosgrain bows', 'Denim-look flamingo print', 'Alligator clips'],
    },
    {
      id: 'pearl-blossom-clips', photos: 2, range: 'sets-and-pairs',
      name: 'Pearl Blossom Clips', size: 'Set of 2', price: 9,
      summary: 'White ruffled blossoms with a pearl heart, on glitter-wrapped fringe clips.',
      details: ['Pair of ribbon blossoms', 'Pearl centres', 'Glitter-wrapped alligator fringe clips'],
    },
    {
      id: 'celebration-clip-set', photos: 2, range: 'sets-and-pairs', featured: true,
      name: 'Celebration Clip Set', size: 'Set of 5', price: 10,
      summary: 'Two mini bows, two daisy clips and an embroidered butterfly, all in one colour. Made for party days.',
      details: ['2 mini grosgrain bows', '2 daisy clips', '1 embroidered organza butterfly', 'Ribbon-wrapped clips, gentle for baby hair'],
      variants: [
        { id: 'white', name: 'Snow',  swatch: '#F4F1EE', photos: 2 },
        { id: 'sky',   name: 'Sky',   swatch: '#9CC7EB', photos: 2 },
        { id: 'lemon', name: 'Lemon', swatch: '#F5DB45', photos: 2 },
        { id: 'lime',  name: 'Lime',  swatch: '#9ED84A', photos: 2 },
      ],
    },
    {
      id: 'headband-duo', photos: 2, range: 'baby-headbands', featured: true,
      name: 'Baby Bow Headband Duo', size: 'Set of 2', price: 12,
      summary: 'Two soft nylon headbands, each with a hand-tied bow. Stretchy, seamless and gentle on tiny heads.',
      details: ['2 stretchy nylon headbands', 'Hand-tied grosgrain bows with pearl and flower details', 'One size, newborn to toddler'],
      variants: [
        { id: 'cream-blush', name: 'Cream & Blush',    swatch: 'linear-gradient(135deg,#F1E3C8 50%,#F2A7B8 50%)', photos: 2 },
        { id: 'sky-apricot', name: 'Sky & Apricot',    swatch: 'linear-gradient(135deg,#A9CDEB 50%,#E9A57E 50%)', photos: 2 },
        { id: 'sky-coral',   name: 'Sky & Coral',      swatch: 'linear-gradient(135deg,#A9CDEB 50%,#F28A86 50%)', photos: 2 },
        { id: 'mint-sky',    name: 'Mint & Butterfly', swatch: 'linear-gradient(135deg,#9FE0C8 50%,#BFD8F2 50%)', photos: 2 },
        { id: 'lilac-peach', name: 'Lilac & Peach',    swatch: 'linear-gradient(135deg,#C3A6E6 50%,#F5A08E 50%)', photos: 2 },
      ],
    },
    {
      id: 'blossom-headband', photos: 2, range: 'baby-headbands',
      name: 'Blossom Baby Headband', size: 'One size', price: 9,
      summary: 'A soft nylon band with a little garden of flowers across the front.',
      details: ['Stretchy nylon headband', 'Lace and ribbon flowers', 'One size, newborn to toddler'],
      variants: [
        { id: 'meadow',   name: 'Meadow Butterfly', swatch: '#2FA84F', photos: 2 },
        { id: 'sunshine', name: 'Sunshine',         swatch: '#F7D53B', photos: 2 },
      ],
    },
  ],

  /* ---------------------------------------------------------------------------
     LANÇAMENTO DA SEMANA (página inicial, logo abaixo da faixa de fitas)
     -------------------------------------------------------------------------
     A ilustração da menina fica fixa; toda semana troca só o laço no cabelo.
     art ....... ilustração (artSmall = versão menor para celular)
     bow ....... foto do laço recortada, com fundo transparente (WebP/PNG)
     bowAt ..... onde o laço fica, em % da ilustração: x e y = centro do laço,
                 width = largura, rotate = inclinação em graus
     image ..... opcional: uma foto já montada, no lugar de art + bow
     product ... id do produto do laço (o botão "Shop this bow" leva até ele)
     Sem art/bow e sem image, a seção some.
     ------------------------------------------------------------------------- */
  launch: {
    art: 'assets/img/launch/girl-ponytail.webp',
    artSmall: 'assets/img/launch/girl-ponytail-640.webp',
    bow: 'assets/img/launch/bow-red-velvet.webp',
    bowAt: { x: 39.5, y: 16, width: 22, rotate: -18 },
    image: '',
    product: 'red-velvet-bow-pair',
    eyebrow: 'New this week',
    title: 'The Winter launch',
    text: 'Plush red velvet wrapped in a band of rhinestones: the first bow of the season, made for Christmas parties and winter days out.',
  },

  /* ---------------------------------------------------------------------------
     5. ENCOMENDAS (velas de aniversário em biscuit e laços sob medida)
     -------------------------------------------------------------------------
     gallery: fotos de trabalhos já feitos (mesmo os vendidos) para inspirar.
     Coloque em assets/img/made-to-order/ e liste aqui. Vazia = a seção some.
     Ex.: { src: 'assets/img/made-to-order/unicorn-candle.webp', alt: 'Unicorn birthday candle in cold porcelain' },
     ------------------------------------------------------------------------- */
  madeToOrder: {
    leadTime: '2–3 weeks',
    gallery: [],
  },
};
