// Domínio antigo. Este Worker fica na conta do Lucas, com o nome "blackrockfloors", e é o que responde em
// blackrockfloors.com e www.blackrockfloors.com (domínios ligados pelo painel, 17/10). Desde a troca para o
// blackrockremod.com, ele só leva cada endereço para o mesmo caminho no domínio novo (TARGET, no workflow): 301 para
// quem só lê (visitante, Google) e 308 para um envio de formulário, que continua sendo envio.
// O site de verdade é o worker.js, publicado na conta do Gabriel.

export default {
  fetch(request, env) {
    const { pathname, search } = new URL(request.url);
    const status = ['GET', 'HEAD'].includes(request.method) ? 301 : 308;
    return Response.redirect(`${env.TARGET}${pathname}${search}`, status);
  },
};
