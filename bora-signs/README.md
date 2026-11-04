# Bora Signs · site

Novo site da [Bora Signs](https://www.borasigns.com.au) (Adelaide), para substituir o Wix, com **painel próprio em
`/admin`** para o Carlos mudar textos, fotos, serviços, blog e configurações sem mexer em código.
Roda inteiro no Cloudflare (Worker + Workers KV), sem banco de dados nem servidor para manter.

## O que tem no site

- **Home**: no topo, o título, o "One less thing" da campanha e a nota 5.0 do Google; ao lado, direto no fundo do
  site, o camaleão de óculos em 3D, que gira seguindo o mouse com luz neon, e as tarefas do dono do negócio flutuando
  atrás dele, cada uma no seu ritmo; o card "Signage" se desfaz em estilhaços e volta, e ele dá um pulinho olhando
  para o card. Parado, ele olha em volta sozinho. No celular o título vem em cima e ele logo abaixo: dá para arrastar
  o dedo para os lados para girá-lo, um toque faz ele pular, e a rolagem também o vira. Depois: números, serviços,
  processo em 4 passos, clientes, depoimentos, dúvidas e chamada final. O camaleão do logo pisca.
- **Uma página por serviço** (12), com os mesmos endereços do Wix: `/vehicle-signage`, `/shopfront-signage`, `/window-graphics`,
  `/office-signage`, `/decor` etc. Cada uma tem por que contratar, opções, fotos, depoimento, processo, dúvidas e serviços relacionados.
- **Van antes/depois** em `/vehicle-signage`: arrastando, a van branca vai sendo envelopada e o preço indicativo sobe de
  **$500** (logo e letreiro) até **$7.000** (envelopamento completo).
- **Blog** em `/blog` (aparece no rodapé e no Google quando houver posts publicados).
- **Orçamento** (`/contact`, vai para o ShopVox), **Trabalhe conosco** (`/join-us`), **todos os serviços** (`/services`) e página 404.
- Rolagem suave, olho do camaleão que segue o mouse, textos que entram palavra por palavra. Tudo é desligado para quem
  ativou "reduzir movimento" no celular ou no computador.

## O painel (`/admin`)

Em `https://<endereço do site>/admin`, com usuário e senha. Tudo em português:

| Parte do painel | O que dá para fazer |
| --- | --- |
| **Painel** | Resumo: o que mudou e ainda não foi publicado, atalhos, mensagens novas |
| **Página inicial** | Todos os textos da home, os cartões atrás do camaleão, serviços em destaque, motivos, depoimentos, dúvidas, título e descrição no Google |
| **Serviços** | Criar, duplicar, esconder, apagar e reordenar serviços; cada um com textos, foto, galeria, dúvidas, relacionados, lugar no menu e Google. Mudar o endereço cria o redirecionamento do antigo sozinho |
| **Blog** | Posts com editor de texto (títulos, negrito, listas, links, fotos), capa, data (pode agendar), rascunho e Google |
| **Outras páginas** | Página de serviços, contato, trabalhe conosco, obrigado, 404 |
| **Blocos repetidos** | Processo em 4 passos, chamada final, cabeçalho e textos comuns das páginas de serviço |
| **Menu e rodapé** | O menu do topo (com subitens) e as colunas do rodapé |
| **Fotos** | Enviar fotos (o painel reduz e converte para WebP sozinho) e ver onde cada uma está em uso |
| **Mensagens** | Candidaturas do Trabalhe conosco e cópia de cada pedido de orçamento (o original vai para o ShopVox) |
| **Configurações** | Empresa, telefone, endereço, redes, nota do Google, números, logos de clientes, preços da van, acabamentos, SEO, ShopVox, Meta Pixel, Google Analytics, redirecionamentos |
| **Histórico** | As últimas 60 publicações; dá para ver como estava e voltar |
| **Usuários** | Trocar a senha, adicionar ou remover pessoas |

Como funciona: as mudanças aparecem na **prévia** ao lado na hora (computador ou celular; clicar num link da prévia abre
o editor daquela página). **Salvar rascunho** guarda sem colocar no ar; **Publicar** coloca no site (leva até 1 minuto
para aparecer em todo lugar). Nos títulos, `*asteriscos*` deixam a palavra em rosa.

**Primeiro acesso**: há dois usuários iniciais, `carlos` e `lucas`, com senhas provisórias (passadas fora do repositório).
No primeiro login cada um cria a própria senha. A lista inicial está em `worker/seed.mjs`, só com os hashes das senhas.

## Como o código está organizado

```
bora-signs/
├── build.mjs               copia public/ e admin/ para dist/ e escreve worker/build-info.mjs
├── wrangler.jsonc          para rodar no computador (npx wrangler dev)
├── worker/
│   ├── index.mjs           o Worker: monta as páginas, sitemap, robots, redirecionamentos e a API do painel
│   ├── store.mjs           conteúdo publicado, rascunho, histórico, fotos e mensagens no Workers KV
│   ├── auth.mjs            login (PBKDF2), sessão em cookie assinado, limite de tentativas
│   └── seed.mjs            usuários iniciais
├── admin/                  o painel (HTML, CSS e um arquivo JS, sem etapa de build)
├── src/
│   ├── defaults.mjs        o conteúdo inicial do site inteiro (vem de site.mjs e content.mjs)
│   ├── render.mjs          HTML de todas as páginas a partir do conteúdo
│   ├── site.mjs            dados iniciais da empresa
│   ├── content.mjs         textos iniciais dos serviços, menu, processo, dúvidas
│   ├── text.mjs            escape de texto, *destaque* e o filtro de HTML dos posts
│   ├── icons.mjs, logo.mjs, van.mjs, images.mjs
└── public/                 CSS, JS, fontes (Archivo, licença OFL), fotos e ícones
```

O conteúdo é um documento só. `src/defaults.mjs` tem os valores iniciais; depois da primeira publicação no painel vale
o que está no KV. Campos novos adicionados ao `defaults.mjs` são preenchidos sozinhos nos documentos antigos.
Cada publicação é testada antes: se alguma página não puder ser montada, o painel avisa e nada vai para o ar.

Fotos que vieram com o site ficam em `public/assets/img/work/` (`<nome>-800` e `-1600`, em `.avif` e `.webp`, mais um
`.jpg` de 1200 px), registradas em `src/images.mjs`. As fotos enviadas pelo painel ficam no KV e são servidas em `/media/`.

## Ver no computador

```bash
node build.mjs
npx wrangler dev        # http://localhost:8787 e http://localhost:8787/admin (KV local, separado do site no ar)
```

## Formulários

O **pedido de orçamento** (`/contact`) vai direto para o **ShopVox**, como lead no funil "Online Leads", com os arquivos
anexados, e a pessoa cai em `/thank-you`. Uma cópia sem os arquivos fica em **Mensagens** no painel. As chaves do
ShopVox ficam no painel (Configurações → Integrações).

O **Trabalhe conosco** chega em **Mensagens**. Para receber também por e-mail, crie uma chave grátis no
[Web3Forms](https://web3forms.com) com o e-mail da Bora e cole em Configurações → Integrações.
Com o Meta Pixel ou o Google Analytics configurados, cada envio conta como Lead.

## Publicar

O workflow `.github/workflows/deploy-bora-signs.yml` monta o site e publica no Cloudflare como **Worker** (a conta já
chegou ao limite de projetos do Pages), sempre em `https://bora-signs.<subdomínio da conta>.workers.dev`.
Na primeira vez ele cria o Workers KV `bora-signs-cms`, onde ficam o conteúdo, o histórico, as fotos enviadas, as
mensagens e os usuários. Usa o secret `CLOUDFLARE_API_TOKEN` (e `CLOUDFLARE_ACCOUNT_ID`, se existir); o token precisa
das permissões de Workers Scripts e **Workers KV Storage** (Edit).

Publicar o código de novo **não apaga** nada do que foi feito no painel.

Só o endereço oficial do site (Configurações → SEO, hoje `https://www.borasigns.com.au`) aparece no Google; o link
workers.dev fica fora (`noindex`), para não competir com o site atual no Wix. Quando o domínio apontar para o Worker,
ele passa a ser indexado sozinho, sem mudar nada.

### Domínio e e-mails (hoje no Wix)

Os e-mails (Google Workspace) continuam no Google: só o site muda de lugar. Um Worker só atende um domínio cujo DNS
esteja no Cloudflare, então:

1. No Cloudflare: **Add a domain** → `borasigns.com.au`. Ele importa os registros atuais; **confira que os MX, TXT
   (SPF/DKIM/DMARC) e CNAME do Google vieram todos**, iguais aos do Wix. São eles que mantêm os e-mails funcionando.
2. No Wix: trocar os nameservers do domínio pelos dois que o Cloudflare mostrar. Se o Wix não deixar trocar
   (domínio comprado nele), transferir o registro do domínio para fora do Wix (precisa do código de transferência e da ABN).
3. Com o domínio ativo no Cloudflare: **Workers & Pages → bora-signs → Settings → Domains & Routes → Add → Custom domain**
   → `www.borasigns.com.au` e `borasigns.com.au` (quem abrir sem `www` é levado para o `www`).
4. O painel passa a funcionar em `https://www.borasigns.com.au/admin`.

### Endereços antigos

Os endereços do Wix foram mantidos. Os que mudaram redirecionam sozinhos (301): `/copy-of-vehicle-signage → /trailer-wrap`,
`/contact-8 → /join-us`, `/home → /`. A lista fica no painel (Configurações → Redirecionamentos).

## SEO

- Título e descrição únicos por página (editáveis no painel, com prévia de como aparece no Google), um `h1` por página.
- Dados estruturados: `LocalBusiness`, `Service` em cada serviço, `BlogPosting` nos posts, `BreadcrumbList` e `FAQPage`.
- `sitemap.xml` e `robots.txt` montados na hora, com os serviços e posts publicados.
- Imagens em AVIF/WebP com tamanho certo para cada tela e fonte hospedada no próprio site.

Depois de publicar no domínio: cadastre o site no [Google Search Console](https://search.google.com/search-console),
envie `https://www.borasigns.com.au/sitemap.xml` e, se pedirem verificação por meta tag, cole o código no painel
(Configurações → SEO).

## Antes de publicar no domínio

- [ ] Preços da van: $500 e $7.000 foram os exemplos do Carlos. Confirmar no painel (Configurações → Van).
- [ ] Depoimentos: vieram do Wix. Confirmar que são de clientes reais.
- [ ] Join Us por e-mail: chave do Web3Forms (opcional; as candidaturas já chegam em Mensagens).
- [ ] Meta Pixel e Google Analytics da Bora Signs (se houver). O pixel `1070067669184384` é do Bora Decor.

`lenis.min.js` (rolagem suave) é a biblioteca [Lenis](https://github.com/darkroomengineering/lenis), licença MIT.
