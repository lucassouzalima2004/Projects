# __NOME_DO_SITE__ · site

Site de um cliente. Foi criado a partir da central `lucassouzalima2004/Projects`, onde vale a regra "um repositório por site".
Mudanças neste site acontecem aqui; um site novo nunca entra neste repositório.

- O que vai para o ar fica em `site/`: HTML, CSS e JavaScript puros, sem build e sem dependências.
- Conteúdo que o dono do site edita (nome, contato, preços, textos) fica em `site/assets/js/content.js`, separado do comportamento (`app.js`).
- A imagem de prévia do link é `site/assets/img/og-image.jpg` (1200×630), referenciada no `index.html` pelo caminho relativo
  `assets/img/og-image.jpg`. Mantenha esse caminho exato: o workflow troca pelo endereço completo ao publicar.
- `.github/workflows/deploy-cloudflare.yml` publica `site/` no Cloudflare Pages a cada push que mexe nela
  (branch padrão = site oficial, outros branches = prévia).
- Quando algo novo precisar ser confirmado com o cliente, acrescente na lista "Antes de mostrar para o cliente" do `README.md`.
- Fale com o usuário em português.
