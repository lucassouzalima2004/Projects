# __NOME_DO_SITE__ · site

__DESCRICAO__

É HTML, CSS e JavaScript puros: sem build, sem dependências. Dá para abrir o `site/index.html` direto no navegador.

Endereço: <https://__PROJETO__.pages.dev> (se o nome já estiver em uso, o Cloudflare acrescenta um sufixo;
o endereço certo aparece no resumo de cada publicação, em Actions).

## Como editar

__COMO_EDITAR__

Se a página ficar em branco depois de uma edição, quase sempre é uma vírgula ou aspa faltando no `content.js`.

## Antes de mostrar para o cliente

O conteúdo atual é de **exemplo**. Confirme e troque:

__CONFERIR__

## Ver no computador

```bash
cd site
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar

O workflow `.github/workflows/deploy-cloudflare.yml` publica a pasta `site/` no Cloudflare Pages a cada push que mexe nela.
Push no branch `main` atualiza o site oficial; push em outro branch gera uma prévia com endereço próprio,
boa para mostrar ao cliente antes de publicar.

Ele precisa de dois secrets, cadastrados uma vez em **Settings → Secrets and variables → Actions → New repository secret**
(os mesmos valores usados nos outros sites):

| Nome | Onde pegar |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → Create Custom Token, com a permissão **Account · Cloudflare Pages · Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → Workers & Pages: o Account ID aparece na lateral direita |

Depois, em **Actions → Deploy site (Cloudflare Pages)**, clique em **Run workflow** (ou faça um novo push).
Sem os secrets, o workflow só deixa um aviso e não publica nada.

Para usar um domínio próprio, adicione o domínio no projeto em Cloudflare → Workers & Pages → Custom domains.

## Estrutura

```
site/                       o que vai para o ar
├── index.html              estrutura da página
├── assets/css/styles.css   visual (cores e fontes no topo do arquivo)
├── assets/js/content.js    conteúdo: nome, contato, preços e textos
├── assets/js/app.js        comportamento
└── assets/img/             favicon, ícone do iPhone e imagem de prévia do link (og-image.jpg, 1200×630)
```
