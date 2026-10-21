/* Dados da Bora Decor usados pelo site (telefone, e-mail, preço, garantia e anúncios).
   Os mesmos dados também estão escritos no index.html e no commercial/index.html (para o Google e para quem está
   sem JavaScript): se trocar algo aqui, procure o valor antigo nas páginas e troque lá também.
   Os pedidos de orçamento NÃO saem daqui: vão por e-mail pelo Worker (ver README, "Pedidos de orçamento por e-mail"). */
window.BORA = {
  phone: '0482 530 280',
  phoneIntl: '+61482530280',
  // E-mail mostrado no site e usado no plano B (quando o envio automático falha)
  email: 'sales@borasigns.com.au',

  // Faixa de preço mostrada no site (dólares australianos)
  priceFrom: 3000,
  priceTo: 6000,

  // Garantia (anos)
  warrantyFilm: 10,
  warrantyInstall: 2,

  // Meta (Facebook/Instagram) Pixel: cole só o número do pixel (ex.: '123456789012345').
  // Com ele, o site avisa o Meta a cada pedido de orçamento (evento "Lead") e os anúncios aprendem quem converte.
  metaPixelId: '',

  // Redes sociais da Bora Decor (vazio esconde o link)
  instagram: '',
  facebook: ''
};
