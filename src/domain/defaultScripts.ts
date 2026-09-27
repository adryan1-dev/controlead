/**
 * Conteúdo inicial da biblioteca de prospecção (venda de sites para
 * dentistas). Semeado na criação/upgrade do banco e restaurável em
 * "Restaurar modelos". Roteiro: curiosidade → problema → oportunidade →
 * conversa → solução. Nunca abrir com preço.
 */
import type { LeadStatus } from './constants'
import type { IsoTimestamp, Script } from './types'

interface ScriptSeed {
  title: string
  body: string
}

const STAGE_SEEDS: Partial<Record<LeadStatus, ScriptSeed[]>> = {
  to_contact: [
    {
      title: '1ª mensagem: avaliações sem página própria',
      body:
        'Oi, {tratamento}! Vi seu perfil no Google: {avaliacoes} avaliações com nota {nota} e um Instagram bem cuidado sobre {especialidade}. ' +
        'Só que reparei que quem pesquisa seu nome não encontra uma página própria reunindo isso, só o Maps e o Instagram. ' +
        'Trabalho criando sites para dentistas justamente para resolver essa lacuna. Faz sentido eu te mostrar como ficaria para o seu consultório?',
    },
    {
      title: '1ª mensagem: usando o gancho',
      body:
        'Oi, {tratamento}, tudo bem? Estava pesquisando {especialidade} em {cidade} e seu consultório chamou atenção. ' +
        'Uma coisa que notei: {gancho}. Dá para resolver isso de um jeito simples. Posso te mostrar em 2 minutos?',
    },
    {
      title: '1ª mensagem: concorrência local',
      body:
        'Oi, {tratamento}! Pesquisando {especialidade} em {cidade}, vi que {concorrente} já tem um site reunindo tratamentos e avaliações. ' +
        'Vocês têm {avaliacoes} avaliações com nota {nota}, mais prova social que muita gente com site, mas ela só aparece para quem já está no Maps. ' +
        'Posso te mostrar como ficaria uma página sua?',
    },
  ],
  approached: [
    {
      title: 'Follow-up 1 (2 a 3 dias)',
      body:
        'Oi, {tratamento}! Passando para saber se viu minha mensagem. Separei um exemplo rápido de como ficaria uma página só com o que você já tem hoje (avaliações + Instagram). Quer que eu envie?',
    },
    {
      title: 'Follow-up 2 (5 a 7 dias)',
      body:
        '{tratamento}, sei que a rotina de consultório é corrida! Deixo aqui: se quiser ver o exemplo do site em algum momento, é só me chamar. Sem compromisso.',
    },
    {
      title: 'Última tentativa',
      body:
        'Oi, {tratamento}! Vou parar de insistir por aqui para não atrapalhar 🙂 Se em algum momento fizer sentido ter um site que mostre suas {avaliacoes} avaliações para quem te pesquisa no Google, é só me chamar.',
    },
  ],
  replied: [
    {
      title: 'Respondeu com interesse: qualificar',
      body:
        'Que bom, {tratamento}! Para montar algo que faça sentido para você, me conta rapidinho: hoje a maioria dos pacientes novos chega por indicação, Instagram ou Google? E tem algum tratamento que você quer atrair mais?',
    },
    {
      title: 'Perguntou o preço logo de cara',
      body:
        'Te passo sim! O valor depende do que o site precisa ter, então prefiro primeiro te mostrar uma prévia com a sua cara. Assim você avalia vendo pronto, e não só um número. Posso montar e te mandar até amanhã?',
    },
  ],
  talking: [
    {
      title: 'Apresentar a solução',
      body:
        'Pelo que você me contou, o site teria: página sobre você e sua formação, página de {especialidade}, suas avaliações do Google em destaque, perguntas frequentes e botão de agendamento direto no WhatsApp. ' +
        'Tudo pensado para quem te pesquisa no Google virar paciente. Vou montar uma prévia e te mando para você ver, pode ser?',
    },
    {
      title: 'Pedir materiais',
      body:
        'Para a prévia ficar fiel, você pode me mandar: logo (se tiver), 3 a 5 fotos suas ou do consultório e os tratamentos que mais quer divulgar? Se não tiver tudo agora, uso o que está no seu Instagram.',
    },
  ],
  preview_sent: [
    {
      title: 'Enviar a prévia',
      body:
        'Pronto, {tratamento}! Aqui está a prévia: [link]. Montei com suas avaliações, sua trajetória e os tratamentos de {especialidade}. Dá uma olhada com calma e me diz o que achou. O que você mudaria?',
    },
    {
      title: 'Follow-up da prévia',
      body: 'Oi, {tratamento}! Conseguiu ver a prévia? Queria muito saber sua opinião, principalmente da parte das avaliações.',
    },
  ],
  proposal_sent: [
    {
      title: 'Enviar a proposta',
      body:
        '{tratamento}, segue a proposta com tudo o que conversamos: [o que inclui]. Investimento: [valor], com [condição de pagamento]. Prazo de entrega: [prazo] depois de receber os materiais. Qualquer dúvida, me chama aqui.',
    },
    {
      title: 'Follow-up da proposta',
      body:
        'Oi, {tratamento}! Ficou alguma dúvida sobre a proposta? Se quiser, a gente ajusta o escopo para caber melhor no momento do consultório.',
    },
    {
      title: 'Fechamento',
      body:
        '{tratamento}, consigo encaixar o seu site na agenda de [mês]. Se fecharmos até [data], a entrega fica para [data]. Posso reservar?',
    },
  ],
  closed: [
    {
      title: 'Boas-vindas e próximos passos',
      body:
        'Seja bem-vinda(o), {tratamento}! 🎉 Próximos passos: 1) me manda os materiais (logo, fotos, textos); 2) te envio a primeira versão em [prazo]; 3) ajustamos juntos até ficar do seu jeito.',
    },
    {
      title: 'Pedir indicação (depois da entrega)',
      body:
        '{tratamento}, que bom que o site ficou do jeito que você queria! Se conhecer algum colega que também não tem site, agradeço muito a indicação 🙏',
    },
  ],
  not_interested: [
    {
      title: 'Encerrar com elegância',
      body: 'Entendo perfeitamente, {tratamento}! Obrigado pela atenção. Se mudar de ideia, fico à disposição 🙂',
    },
  ],
  lost: [
    {
      title: 'Reativação (60 a 90 dias)',
      body:
        'Oi, {tratamento}! Tudo bem? Faz um tempo que conversamos sobre o site. Acabei de entregar um para um consultório de {especialidade} e lembrei de você. Se quiser ver como ficou, te mando o link.',
    },
  ],
}

const OBJECTION_SEEDS: ScriptSeed[] = [
  {
    title: 'Tá caro',
    body:
      'Entendo, {tratamento}. Pensa assim: se o site trouxer um único paciente de {especialidade} por mês, ele já se paga, e fica trabalhando para você 24h. ' +
      'Se ajudar, dá para dividir o pagamento ou começar com uma versão mais enxuta e crescer depois. O que faria mais sentido para você?',
  },
  {
    title: 'Já tenho Instagram, não preciso de site',
    body:
      'O Instagram é ótimo para quem já te segue. O site é para quem ainda não te conhece e pesquisa "{especialidade} em {cidade}" no Google: hoje essa pessoa só encontra o Maps. ' +
      'Um não substitui o outro. O site leva essa pessoa direto para o seu WhatsApp, com suas {avaliacoes} avaliações como prova.',
  },
  {
    title: 'Preciso pensar',
    body:
      'Claro, {tratamento}! Para te ajudar a pensar: ficou alguma dúvida específica, de valor, prazo ou se vai dar retorno? Se quiser, te mando a prévia para você decidir vendo pronto, sem compromisso.',
  },
  {
    title: 'Já tenho alguém que faz',
    body:
      'Que ótimo que você já tem alguém! Se quiser uma segunda opinião, posso te mostrar o que funciona especificamente para consultórios de {especialidade}: avaliações em destaque, FAQ para pacientes e botão de agendamento. Aí você compara com calma.',
  },
  {
    title: 'Não tenho tempo agora',
    body:
      'Entendo total, rotina de consultório é puxada. Por isso eu cuido de tudo: uso o que já está no seu Instagram e no Google, e você só aprova. Da sua parte são uns 15 minutos. Posso te mandar uma prévia sem compromisso?',
  },
  {
    title: 'Me manda o preço por aqui',
    body:
      'Mando sim! Só que o valor muda bastante conforme o que o site precisa ter. Posso te fazer 2 perguntas rápidas para te passar um valor certo, em vez de um chute?',
  },
  {
    title: 'Site não traz paciente',
    body:
      'Sozinho, sem estratégia, não traz mesmo. Mas quem pesquisa "{especialidade} em {cidade}" e cai numa página com {avaliacoes} avaliações, sua formação e um botão de WhatsApp tem muito mais chance de agendar do que quem só vê o Maps. ' +
      'O site é onde a decisão acontece.',
  },
  {
    title: 'Deixa para depois',
    body:
      'Sem problema! Só um ponto: quem pesquisa dentista no Google está fazendo isso agora, e hoje encontra quem já tem site. Se quiser, deixo a prévia pronta e você decide quando lançar. Posso te chamar em [data]?',
  },
]

/** IDs fixos: restaurar os modelos não duplica e backups antigos migram de forma previsível. */
export function buildDefaultScripts(now: IsoTimestamp = new Date().toISOString()): Script[] {
  const scripts: Script[] = []
  for (const [stage, seeds] of Object.entries(STAGE_SEEDS) as [LeadStatus, ScriptSeed[]][]) {
    seeds.forEach((seed, index) => {
      scripts.push({
        id: `default-${stage}-${index + 1}`,
        kind: 'stage',
        stage,
        title: seed.title,
        body: seed.body,
        order: index,
        createdAt: now,
        updatedAt: now,
      })
    })
  }
  OBJECTION_SEEDS.forEach((seed, index) => {
    scripts.push({
      id: `default-objection-${index + 1}`,
      kind: 'objection',
      title: seed.title,
      body: seed.body,
      order: index,
      createdAt: now,
      updatedAt: now,
    })
  })
  return scripts
}
