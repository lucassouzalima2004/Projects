# Bossa Nail Studio · site

Site de uma página para uma manicure brasileira na Austrália, em português e inglês.
É HTML, CSS e JavaScript puros: sem build, sem dependências. Dá para abrir o `index.html` direto no navegador.

## O que tem no site

- **Topo**: título, chamadas para agendar e uma cartela de cores interativa (toque numa cor).
- **Tabela de serviços**: o "cartão" com categorias, duração e preço. A cliente toca nos serviços e monta o pedido.
- **Seu pedido**: soma o total e o tempo, pede nome, dia, período e observações, e abre o WhatsApp com a mensagem pronta.
- **Monte sua unha**: formato, cor, acabamento e tom de pele numa mão ilustrada. A inspiração vai junto no pedido.
- **Sobre**, **protocolo de higiene**, **como agendar em 3 passos**, **dúvidas frequentes** e **contato**.
- **Galeria** (aparece sozinha quando houver fotos).
- **Vídeos** (aparece sozinha quando houver vídeos): a tela fica parada enquanto a pessoa rola e um vídeo dá lugar ao outro,
  com barrinhas de progresso como nos stories.
- Idioma automático (português para quem usa o celular em português, inglês para o resto), com botão PT/EN.
- Barra de agendamento fixa no celular, prévia bonita do link no WhatsApp (`og-image.jpg`) e dados estruturados para o Google.

## Como editar

Tudo o que muda fica em **`assets/js/content.js`**:

| O quê | Onde |
| --- | --- |
| Nome do estúdio | `brand.name` e `brand.tagline` |
| WhatsApp que recebe os pedidos | `whatsapp` (só dígitos, com 61 na frente: `61412345678`) |
| Cidade | `location.city` e `location.in` (ex.: `{ pt: 'na Gold Coast', en: 'on the Gold Coast' }`) |
| Instagram | `instagram` (vazio esconde o link) |
| Horários | `hours` |
| Serviços e preços | `services` (e `categories` para as seções) |
| Cores da cartela | `colors` |
| Fotos | `gallery` e `aboutPhoto` (coloque os arquivos em `assets/img/`) |
| Vídeos | `videos` (coloque os arquivos em `assets/video/`; veja [Vídeos](#vídeos)) |
| Todos os textos | `text.pt` e `text.en` |

Combos com `includes: ['id-a', 'id-b']` mostram sozinhos o selo "economize $X".

Se a página ficar em branco depois de uma edição, quase sempre é uma vírgula ou aspa faltando no `content.js`. O site mostra um aviso vermelho no topo quando isso acontece.

## Antes de mostrar para a cliente

O conteúdo atual é de **exemplo**. Confirme e troque:

- [ ] Serviços, descrições, durações e preços do cartão dela
- [ ] Nome do estúdio (hoje "Bossa Nail Studio")
- [ ] Número de WhatsApp (hoje `61400000000`, que não existe)
- [ ] Cidade
- [ ] Horários de atendimento
- [ ] Formas de pagamento e política de cancelamento (na seção de dúvidas)
- [ ] Protocolo de higiene (esterilização, lixas de uso único etc.)
- [ ] Fotos e vídeos dos trabalhos e uma foto dela, se ela quiser

O endereço exato não aparece no site: ele vai junto com a confirmação do horário.

## Vídeos

Cada vídeo da lista `videos` ganha um trecho da rolagem: a seção fica presa na tela e, conforme a pessoa desce,
um vídeo dá lugar ao próximo, na ordem da lista. Os vídeos tocam sozinhos, sem som e em loop.

- **Formato:** MP4, sem som, de 5 a 15 segundos. Vertical (como os do Instagram) fica melhor. O quadro segue o
  formato do primeiro vídeo, então não misture verticais e horizontais.
- **Peso:** até uns 4 MB cada. Vídeo leve é o que deixa a troca lisa no 4G.
- **Capa (`poster`):** uma foto do vídeo, que aparece enquanto ele carrega. Sem ela, o quadro fica escuro por um instante.
- **Legenda (`caption`):** curta, em português e inglês. No celular ela ocupa uma linha só.

Com o [ffmpeg](https://ffmpeg.org) instalado, estes dois comandos (rodados dentro de `nail-studio/`) preparam um vídeo
do celular e tiram a capa:

```bash
ffmpeg -i video-do-celular.mov -an -vf "scale=720:-2,fps=30" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart assets/video/01.mp4
```

```bash
ffmpeg -ss 0.5 -i assets/video/01.mp4 -frames:v 1 -q:v 3 assets/video/01.jpg
```

Para vídeo horizontal, troque `720` por `1280`. Sem ffmpeg, o [HandBrake](https://handbrake.fr) faz o mesmo
(predefinição *Fast 720p30*, sem faixa de áudio), e a capa pode ser um print do vídeo.

Quem ativou "reduzir movimento" ou a economia de dados vê as capas e um botão de play. No iPhone em modo de
economia de bateria também, porque o iOS bloqueia vídeo automático. O botão no canto do vídeo pausa e retoma.

## Ver no computador

Abra o `index.html` no navegador, ou rode um servidor local nesta pasta:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Para forçar um idioma: `index.html?lang=en` ou `index.html?lang=pt`.

## Publicar

### Cloudflare Pages (já configurado)

O workflow `.github/workflows/deploy-cloudflare.yml` publica o site no Cloudflare a cada push que mexe em
`nail-studio/`. Na primeira vez ele cria o projeto `bossa-nail-studio`, e o site fica em
<https://bossa-nail-studio.pages.dev> (se esse nome já estiver em uso, o Cloudflare acrescenta um sufixo;
o endereço certo aparece no resumo da execução, em Actions).

Ele precisa de dois secrets, cadastrados uma vez em **Settings → Secrets and variables → Actions → New repository secret**:

| Nome | Onde pegar |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → Create Custom Token, com a permissão **Account · Cloudflare Pages · Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → Workers & Pages: o Account ID aparece na lateral direita |

Depois, em **Actions → Deploy site (Cloudflare Pages)**, clique em **Run workflow** (ou faça um novo push).
Sem os secrets, o workflow só deixa um aviso e não publica nada.

O workflow também troca o `og:image` pelo endereço completo, que é o que o WhatsApp exige para mostrar a imagem
da prévia. Para usar um domínio próprio, adicione o domínio no projeto em Cloudflare → Workers & Pages → Custom domains.

### Outra hospedagem

Qualquer hospedagem de site estático serve. Publique a pasta `nail-studio/`:

- **Netlify**: arraste a pasta em <https://app.netlify.com/drop>.
- **Vercel**: importe o repositório e defina `nail-studio` como Root Directory.

Nesses casos, troque no `index.html` o `og:image` pelo endereço completo
(ex.: `https://seudominio.com/assets/img/og-image.jpg`).

## Estrutura

```
nail-studio/
├── index.html              estrutura da página
├── assets/css/styles.css   visual (cores e fontes no topo do arquivo)
├── assets/js/content.js    conteúdo: serviços, preços, contato e textos
├── assets/js/app.js        comportamento (pedido, idiomas, cartela, mão ilustrada, vídeos)
├── assets/img/             favicon, ícone do iPhone e imagem de prévia do link
└── assets/video/           vídeos dos trabalhos (crie a pasta quando tiver o primeiro)
```

Fontes: Newsreader (títulos) e Figtree (textos), do Google Fonts, escolhidas para leitura fácil no celular.

As animações (entrada das seções, título palavra por palavra, reflexo na cartela, unha "pintada" ao trocar a cor)
são desligadas automaticamente para quem ativou "reduzir movimento" no celular ou no computador. Para essas pessoas,
os vídeos também não começam sozinhos.
