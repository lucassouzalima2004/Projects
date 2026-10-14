---
name: novo-site
description: Cria um site novo num repositório próprio no GitHub (regra do usuário, um repositório por site), já com a publicação no Cloudflare Pages. Use sempre que o usuário pedir um site novo, para um cliente ou negócio novo, mesmo sem falar em repositório. Não use para mudar um site que já existe.
---

# Site novo = repositório novo

Regra combinada com o usuário: cada site novo ganha um repositório próprio na conta `lucassouzalima2004`.
Nunca monte um site novo dentro do `Projects`: ele é só a central (regras, modelo e lista dos sites).

## 1. Combinar nome e visibilidade

Se o usuário ainda não disse, pergunte numa pergunta só, já com as sugestões:

- **Nome do repositório**: o nome do negócio em minúsculas com hífens, sem prefixo (ex.: `bossa-nail-studio`).
  Esse nome vira o endereço do site: `https://bossa-nail-studio.pages.dev`.
- **Visibilidade**: privado (padrão) ou público.

## 2. Criar o repositório

`mcp__github__create_repository` com `name`, `description` (uma linha, ex.: "Site do Bossa Nail Studio"),
`private` e `autoInit: true`. O README inicial cria o branch `main`, que o clone e o `add_repo` precisam.

Se a criação for recusada, peça ao usuário para criar em <https://github.com/new> com esse nome,
marcando **Add a README file**, e continue quando ele avisar.

## 3. Ligar à sessão e clonar

`mcp__claude-code-remote__add_repo` com `owner: "lucassouzalima2004"`, o nome e `access: "push"`.
Rode o comando de clone que ele devolver, clonando fora do `Projects` (ex.: ao lado dele, em `../<repo>`),
e depois chame `mcp__claude-code-remote__register_repo_root`.

Se o `add_repo` recusar porque o app do Claude no GitHub não tem acesso ao repositório novo, o app está liberado
só para repositórios escolhidos. Peça ao usuário para incluir o repositório em
<https://github.com/settings/installations> → Claude → Configure → Repository access
(ou marcar **All repositories**, que evita isso nos próximos sites) e tente de novo.
Enquanto isso, monte o site no scratchpad.

## 4. Copiar o modelo

```bash
cp -R templates/site-repo/. ../<repo>/
```

Troque os marcadores em todos os arquivos copiados:

| Marcador | Valor |
| --- | --- |
| `__NOME_DO_SITE__` | nome do negócio como aparece no site |
| `__DESCRICAO__` | uma ou duas frases sobre o site (para quem é, o que faz) |
| `__PROJETO__` | nome do projeto no Cloudflare: o do repositório em minúsculas, só letras, números e hífens (o workflow calcula igual) |
| `__COMO_EDITAR__` | tabela "O quê / Onde" apontando o que se edita no `site/assets/js/content.js` |
| `__CONFERIR__` | checklist `- [ ]` com tudo o que é exemplo e precisa ser confirmado com o cliente |

No fim, `grep -rn '__[A-Z_]*__' ../<repo>` não pode devolver nada.

## 5. Montar o site em `site/`

Siga as convenções do `nail-studio/` deste repositório, que serve de referência:

- HTML, CSS e JavaScript puros, sem build e sem dependências; abre direto do `index.html`.
- Conteúdo editável (nome, contato, preços, textos) em `site/assets/js/content.js`, separado do comportamento em `app.js`.
- Feito para celular primeiro; animações desligadas para quem ativou "reduzir movimento".
- `og:image` com o caminho relativo exato `assets/img/og-image.jpg` (1200×630): o workflow troca pelo endereço completo ao publicar.
- Favicon e ícone do iPhone em `site/assets/img/`.

## 6. Enviar

Commit e push no repositório novo, no branch que a sessão designar para ele; se nenhum foi designado, em `main`
(o repositório acabou de nascer e `main` é o site oficial). Push em `main` publica o site oficial; em outro branch, uma prévia.

## 7. Registrar na central

No `Projects`, acrescente uma linha na tabela "Sites" do `README.md` (site, repositório, endereço)
e faça commit e push no branch de trabalho do `Projects`.

## 8. Avisar o usuário

Em poucas linhas, em português:

- o link do repositório novo;
- os dois secrets para cadastrar nele, com o link direto
  `https://github.com/lucassouzalima2004/<repo>/settings/secrets/actions`:
  `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` (os mesmos valores dos outros sites);
- depois, **Actions → Deploy site (Cloudflare Pages) → Run workflow**; o site fica em `https://<projeto>.pages.dev`;
- o que ainda é exemplo e precisa ser confirmado com o cliente.
