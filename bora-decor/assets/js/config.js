/* Dados da Bora Decor usados pelo site (links do WhatsApp, telefone, e-mail, preço, garantia e anúncios).
   Os mesmos dados também estão escritos no index.html (para o Google e para quem está sem JavaScript):
   se trocar algo aqui, procure o valor antigo no index.html e troque lá também. */
window.BORA = {
  // WhatsApp que recebe os pedidos: só dígitos, com 61 na frente e sem o 0 do celular (0482 530 280 → 61482530280)
  whatsapp: '61482530280',
  phone: '0482 530 280',
  phoneIntl: '+61482530280',
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
