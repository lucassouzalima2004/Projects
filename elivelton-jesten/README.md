# Jesten Construções · site e painel

Cliente: **Elivelton Phillips**, da **Jesten Construções** (Jesus & Buten, Lda · NIF 517737098), construtora de Coimbra
que trabalha em Portugal e Espanha (estrutura em betão armado: cofragem, armação de ferro e betonagem; obras novas,
reabilitação e remodelação). O site antigo (jesten.pt, na Netlify) foi feito com IA: vídeos e fotos de serviço gerados
por IA, letras genéricas, contadores parados em zero. O pedido foi um site muito mais profissional, com e-mail, Facebook
e LinkedIn no orçamento, e um **painel** onde ele vê de que cidade vêm as visitas e troca fotos e vídeos sozinho.

## O que tem

**Site** em português de Portugal (`/`), espanhol (`/es/`), inglês (`/en/`) e francês (`/fr/`):

- Topo em ecrã inteiro com uma foto real de obra (fundações, com a grua), o título "Construímos com rigor, do alicerce
  ao acabamento." (a partir do lema do site antigo), os botões de orçamento e de obras e um botão "Ver a equipa em
  obra" que abre o vídeo da betonagem. Logo abaixo, num cartão, os números da empresa (54+ clientes,
  91+ profissionais, 8 obras em curso, desde 2023), que contam até ao valor quando aparecem.
- **Serviços** (4), **Empresa** (fotos da equipa e os valores: segurança, rigor, compromisso), **Obras** (fotos e
  vídeos reais das equipas, com filtro por tipo e galeria em ecrã inteiro), **Como trabalhamos** em 4 passos, faixa de
  **recrutamento** e **Orçamento**: formulário (com anexo de projeto até 10 MB) e todos os contactos diretos (e-mail,
  WhatsApp, telefones de Portugal e Espanha, Instagram, Facebook e LinkedIn quando preenchidos, morada com mapa).
- Visual de construtora premium: Montserrat nos títulos (a mesma família do "CONSTRUÇÕES" do logótipo) e Inter no
  texto, cantos arredondados, botões em pílula e sombras suaves. No telemóvel aparece uma barra fixa com WhatsApp e
  "Pedir orçamento" (nas carreiras, "Enviar candidatura"); no computador, um botão redondo de WhatsApp.
- Animações: títulos que entram palavra a palavra, fotos que abrem como uma cortina, parallax na foto do topo e nas
  fotos da empresa e do recrutamento, faixa com os serviços a passar, números que contam, "Como trabalhamos" com a
  linha a acender cada passo, cabeçalho que se esconde ao descer e volta ao subir, barra de leitura no alto, galeria
  e menu com transições e troca suave entre páginas. Quem tem "reduzir movimento" ligado no aparelho vê tudo parado.
- **Carreiras** (`/carreiras`): funções, o que a empresa oferece, contactos diretos e formulário de candidatura com
  currículo em PDF.
- **Política de Privacidade** e **Termos** reescritos para o site novo (RGPD, Livro de Reclamações, resolução de litígios).
- Quem abre o site com o telemóvel em espanhol, inglês ou francês cai direto na versão dessa língua (só na primeira
  visita; o botão PT/ES/EN/FR fica guardado).
- Prévia bonita do link no WhatsApp em cada língua, dados para o Google (GeneralContractor), sitemap e hreflang.

Nada de imagens de IA: tudo é foto e vídeo real das obras (Instagram e site antigo), otimizado. Cada vídeo tem perto
de 2 MB (o do topo do site antigo tinha 36 MB) e só carrega quando aparece no ecrã. O logótipo foi redesenhado em
vetor a partir do PNG do cliente.

**Painel** em `/painel` (em português do Brasil, que é como o cliente fala), com senha:

- **Visitas**: visitantes, páginas vistas, quem está no site agora, gráfico por dia, **mapa com as cidades**, listas de
  cidades, países, de onde vieram (Google, Instagram, WhatsApp, Facebook…), páginas, aparelho e idioma, e as últimas
  visitas. Sem cookies e sem guardar IP (não precisa de aviso de cookies). As visitas do próprio cliente com sessão
  aberta e os robôs não contam.
- **Fotos e vídeos**: envia várias de uma vez direto da galeria do celular (as fotos são reduzidas no próprio aparelho),
  título, local, mês, tipo, "em curso/concluída", ponto de foco da foto, girar, ocultar, reordenar, apagar, e
  "usar no topo do site". A primeira da lista fica em destaque. Tudo publica na hora.
- **Página inicial**: foto do topo (qualquer foto ou vídeo da galeria pode ir para o topo) e a sua legenda, os 4
  números e a faixa de recrutamento.
- **Contatos e redes**: e-mail, telefones, WhatsApp, Instagram, **Facebook**, **LinkedIn**, morada, NIF, alvará.
- **Mensagens**: pedidos de orçamento e candidaturas, com anexo para baixar e botões de responder por e-mail,
  WhatsApp e ligar.
- **Conta**: trocar a senha, espaço usado, sair.

## Como funciona por dentro

É um **Worker do Cloudflare** (mesma conta dos outros sites):

```
elivelton-jesten/
├── wrangler.jsonc          configuração do Worker (nome, arquivos estáticos, banco)
├── src/
│   ├── index.js            rotas: páginas, formulários, contagem de visitas, API do painel
│   ├── pages.js            HTML das páginas
│   ├── i18n.js             todos os textos nas 4 línguas
│   ├── content.js          conteúdo inicial (obras, números, contactos) e limpeza do que vem do painel
│   ├── store.js            banco: Durable Object com SQLite (visitas, conteúdo, fotos/vídeos, mensagens, sessões)
│   ├── panel.js            casca HTML do painel
│   └── icons.js            ícones
├── public/                 servido direto pelo Cloudflare
│   ├── _headers            cache dos arquivos
│   └── assets/             css, js (site.js, panel.js, mapa), fontes, logótipo, fotos e vídeos otimizados
└── tools/
    ├── make-media.sh       gera as fotos e vídeos otimizados a partir dos originais do cliente
    ├── make-images.mjs     gera as imagens de prévia do link e os ícones
    └── make-map.mjs        gera o mapa em pontos do painel
```

O banco é um **Durable Object com SQLite**, que faz parte do plano gratuito e é criado sozinho no primeiro deploy
(não precisa criar nada no Cloudflare nem cartão). Ele guarda as visitas (apagadas depois de 13 meses), o conteúdo
editado no painel, as fotos e vídeos enviados pelo painel (em pedaços de 1,9 MB; vídeo até 200 MB), as mensagens com
anexos (apagadas depois de 2 anos) e as sessões. A localização das visitas vem do próprio Cloudflare (`request.cf`).

Limites do plano gratuito que importam aqui: 100 mil pedidos por dia ao Worker e 5 GB no banco. Para um site de
construtora isto sobra; o espaço usado aparece no painel em **Conta**.

## Publicar

O workflow `.github/workflows/deploy-elivelton-jesten.yml` publica a cada push que mexe em `elivelton-jesten/`.
Usa os mesmos secrets dos outros sites (`CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`) e mais um:

| Secret | O que é |
| --- | --- |
| `JESTEN_ADMIN_PASSWORD` | Senha inicial do painel. Cadastre em **Settings → Secrets and variables → Actions → New repository secret** e rode o workflow de novo (Actions → Deploy Jesten Construções → Run workflow). |

O site fica em `https://elivelton-jesten.<subdomínio da conta>.workers.dev` (o endereço exato aparece no resumo da
execução, em Actions) e o painel no mesmo endereço com `/painel`. Enquanto estiver no `.workers.dev`, o site pede ao
Google para **não** indexar (é prévia); no domínio definitivo passa a indexar sozinho.

**Senha do painel**: o cliente pode trocá-la em **Conta**. Se ele esquecer, mude o secret `JESTEN_ADMIN_PASSWORD` e
rode o workflow: a senha nova do Cloudflare passa a valer e a que ele tinha criado no painel é descartada.

### Levar para o domínio jesten.pt

Hoje o jesten.pt está na Netlify (conta que o cliente recebeu do programador anterior). Para o site novo responder
em jesten.pt:

1. No Cloudflare, **Add a domain** → `jesten.pt` (plano Free) e troque os nameservers do domínio no registrador
   (onde o .pt foi registado) pelos que o Cloudflare indicar.
2. Em **Workers & Pages → elivelton-jesten → Settings → Domains & Routes → Add → Custom domain**, adicione
   `jesten.pt` e `www.jesten.pt`.
3. Depois de o site novo abrir no domínio, o site antigo da Netlify pode ser apagado.

Se o cliente quiser tudo na conta dele, crie um Cloudflare em nome dele e troque os secrets do GitHub pelos dessa conta;
o workflow publica igual. (O banco começa vazio na conta nova: as fotos do site vão no código, as enviadas pelo painel
teriam de ser enviadas de novo.)

## Ver no computador

```bash
cd elivelton-jesten
npm install
echo "ADMIN_PASSWORD=uma-senha-de-teste" > .dev.vars
npm run dev            # http://localhost:8787 e http://localhost:8787/painel
```

Para forçar um idioma: `/es/`, `/en/`, `/fr/`. Fotos e vídeos de exemplo: `bash tools/make-media.sh` refaz os
otimizados (baixa os originais do jesten.pt se a pasta `tools/originals/` estiver vazia).

## Segurança e privacidade

- Cabeçalhos em todas as páginas: Content-Security-Policy (só scripts, fontes e imagens do próprio site), HSTS,
  nosniff, Referrer-Policy, Permissions-Policy e proibição de abrir o site dentro de outro (frame).
- Fontes servidas pelo próprio site (sem Google Fonts, que manda o IP do visitante para a Google).
- Painel: senha guardada com PBKDF2, sessão em cookie HttpOnly/SameSite=Strict de 30 dias, no máximo 8 tentativas de
  senha a cada 15 minutos por IP, e só aceita alterações vindas do próprio site.
- Formulários: campo escondido e tempo mínimo contra robôs, no máximo 6 envios por hora por IP, anexos conferidos pelo
  conteúdo (PDF/imagem de verdade) e guardados como privados (só baixam com sessão no painel).

## O que ainda falta confirmar

- [ ] **Links do Facebook e do LinkedIn** da Jesten (o cliente reclamou que faltavam; não encontrei as páginas).
      Quando chegarem, é só colar em **Contatos e redes** no painel: os botões aparecem no site na hora.
- [ ] Número do **alvará** de construção (IMPIC), se a empresa tiver: aparece no rodapé.
- [ ] Revisar com o cliente os textos dos serviços, de "Como trabalhamos" e da página de carreiras (o que a empresa
      oferece), e os locais das obras nas legendas (só pus local onde a foto ou o vídeo mostravam: Sant Cugat,
      Barcelona, Catalunha).
- [ ] Senha do painel: cadastrar o secret `JESTEN_ADMIN_PASSWORD` antes de mostrar o painel ao cliente.
- [ ] Mais fotos e vídeos recentes das obras (ele mesmo pode enviar pelo painel).
