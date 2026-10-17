/* Dados da Ativa usados pelo site (telefone, WhatsApp, e-mail, avaliações do Google, redes e anúncios).
   Os mesmos dados também estão escritos no index.html (para o Google e para quem está sem JavaScript):
   se trocar algo aqui, procure o valor antigo no index.html e troque lá também. */
window.ATIVA = {
  // WhatsApp: só dígitos, com 61 na frente e sem o 0 do celular (0438 357 508 → 61438357508)
  whatsapp: '61438357508',
  phone: '0438 357 508',
  phoneIntl: '+61438357508',

  // E-mail que recebe os pedidos de orçamento (no site antigo, "Julia - Quotes")
  email: 'office@ativaservices.com',

  // Opcional: endereço de um serviço de formulário (Formspree, FormSubmit etc.).
  // Vazio: o botão abre o e-mail da pessoa com o pedido pronto (mailto).
  // Preenchido: o pedido vai direto para esse endereço, sem abrir nada, e o site mostra "recebido".
  //   Formspree:  'https://formspree.io/f/SEU_ID'
  //   FormSubmit: 'https://formsubmit.co/ajax/office@ativaservices.com' (o primeiro envio pede confirmação por e-mail)
  formEndpoint: '',

  // Avaliações do Google (perfil da Ativa). Atualize a nota e o total quando mudarem.
  googleRating: '5.0',
  googleReviews: 23,
  googleReviewsUrl: 'https://search.google.com/local/reviews?placeid=ChIJg7CEj3w_fyURnbtdfkqCKVg',
  googleWriteUrl: 'https://search.google.com/local/writereview?placeid=ChIJg7CEj3w_fyURnbtdfkqCKVg',

  // Meta (Facebook/Instagram) Pixel: cole só o número do pixel (ex.: '123456789012345').
  // Com ele, cada pedido de orçamento vira um evento "Lead" e cada toque no telefone/WhatsApp, "Contact".
  metaPixelId: '',

  // Redes sociais (vazio esconde o ícone)
  instagram: 'https://www.instagram.com/ativaservices/',
  facebook: 'https://www.facebook.com/profile.php?id=61567827256646'
};
