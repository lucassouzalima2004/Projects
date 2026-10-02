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
- [ ] Fotos dos trabalhos e uma foto dela, se ela quiser

O endereço exato não aparece no site: ele vai junto com a confirmação do horário.

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
├── assets/js/app.js        comportamento (pedido, idiomas, cartela, mão ilustrada)
└── assets/img/             favicon, ícone do iPhone e imagem de prévia do link
```

Fontes: Newsreader (títulos) e Figtree (textos), do Google Fonts, escolhidas para leitura fácil no celular.

As animações (entrada das seções, título palavra por palavra, reflexo na cartela, unha "pintada" ao trocar a cor)
são desligadas automaticamente para quem ativou "reduzir movimento" no celular ou no computador.
