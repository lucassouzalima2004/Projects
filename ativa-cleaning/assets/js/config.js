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
  googleReviews: 32,
  googleReviewsUrl: 'https://search.google.com/local/reviews?placeid=ChIJg7CEj3w_fyURnbtdfkqCKVg',
  googleWriteUrl: 'https://search.google.com/local/writereview?placeid=ChIJg7CEj3w_fyURnbtdfkqCKVg',

  // Meta (Facebook/Instagram) Pixel: cole só o número do pixel (ex.: '123456789012345').
  // Com ele, cada pedido de orçamento vira um evento "Lead" e cada toque no telefone/WhatsApp, "Contact".
  metaPixelId: '',

  // Política de cancelamento (PDF). Enquanto o arquivo não existir no site, os links ficam escondidos.
  cancellationPdf: 'assets/docs/cancellation-policy.pdf',

  // Área atendida (mapa no fim das perguntas). O círculo marca ~45 min do CBD.
  // Para pôr os pinos dos bairros: { name: 'Glenelg', lat: -34.9799, lng: 138.5156 }
  serviceArea: {
    center: [-34.9285, 138.6007],
    radiusKm: 40,
    suburbs: []
  },

  // Galeria "From the job sheet": uma aba por serviço. Aba sem fotos não aparece.
  // Fotos novas: coloque em assets/img/gallery/ e acrescente { src: 'assets/img/gallery/arquivo.jpg', caption: 'Texto' }.
  gallery: [
    { label: 'House cleaning', photos: [
      { src: 'assets/img/job-kitchen.jpg', caption: 'Kitchen' },
      { src: 'assets/img/job-oven.jpg', caption: 'Oven' },
      { src: 'assets/img/job-shower.jpg', caption: 'Bathroom' },
      { src: 'assets/img/clean-rangehood.jpg', caption: 'Splashback' },
      { src: 'assets/img/job-fridge.jpg', caption: 'Fridge' }
    ] },
    { label: 'Carpet cleaning', photos: [] },
    { label: 'Spring cleaning', photos: [] },
    { label: 'Commercial cleaning', photos: [] },
    { label: 'End of lease', photos: [
      { src: 'assets/img/job-living.jpg', caption: 'Living area' },
      { src: 'assets/img/job-bedroom.jpg', caption: 'Bedroom' },
      { src: 'assets/img/job-kitchen-window.jpg', caption: 'Kitchen sink' }
    ] },
    { label: 'Window cleaning', photos: [
      { src: 'assets/img/job-window-outside.jpg', caption: 'Exterior windows' },
      { src: 'assets/img/job-window-inside.jpg', caption: 'Glass & frames' },
      { src: 'assets/img/job-kitchen-window.jpg', caption: 'Kitchen window' }
    ] }
  ],

  // Redes sociais (vazio esconde o ícone)
  instagram: 'https://www.instagram.com/ativaservices/',
  facebook: 'https://www.facebook.com/profile.php?id=61567827256646'
};
