import { BatteryFull, CalendarDays, Camera, CheckCheck, ChevronLeft, MessageCircle, Mic, MoreVertical, Paperclip, Phone, Signal, Smile, UserRound, Video, Wifi } from 'lucide-react';
import { asset } from '../data/product';

const steps = [
  { number: '01', icon: MessageCircle, title: 'A conversa começa', text: 'O cliente ou interessado entra em contato pelo WhatsApp da sua operação.' },
  { number: '02', icon: CalendarDays, title: 'A BIA organiza o próximo passo', text: 'A experiência conecta a conversa à agenda ou ao acompanhamento comercial.' },
  { number: '03', icon: UserRound, title: 'Você segue no controle', text: 'Sua equipe pode assumir o atendimento e o gestor consulta informações autorizadas.' },
] as const;

export function Experience() {
  return <section id="como-funciona" className="sales-section experience-section" aria-labelledby="experience-title">
    <div className="section-inner">
      <div className="section-intro experience-intro">
        <div><p className="section-kicker"><span>01</span> / COMO FUNCIONA</p><h2 id="experience-title">Uma conversa pode<br /><em>mudar o seu dia.</em></h2></div>
        <p>Do primeiro contato à rotina de gestão, a BIA ajuda a transformar mensagens em próximos passos claros.</p>
      </div>
      <div className="experience-layout">
        <div className="journey">{steps.map(({number, icon: Icon, title, text}) => <article className="journey-step" key={number}>
          <span className="journey-number">{number}</span><div className="journey-icon"><Icon size={21} aria-hidden="true" /></div><div><h3>{title}</h3><p>{text}</p></div>
        </article>)}</div>
        <figure className="phone-preview" aria-label="Prévia ilustrativa de uma conversa com a BIA pelo WhatsApp">
          <div className="phone-device">
            <div className="phone-screen" style={{ backgroundImage: `url('${asset('/preview-templates/bg-whatsapp-template.png')}')` }}>
              <div className="phone-status" aria-hidden="true"><span>11:54</span><div><Signal size={12} /><Wifi size={12} /><BatteryFull size={14} /></div></div>
              <div className="phone-header">
                <ChevronLeft size={19} aria-hidden="true" />
                <img className="phone-avatar" src={asset('/images/bia.png')} alt="" />
                <div className="phone-contact"><strong>BIA 360</strong><small>assistente virtual</small></div>
                <Video size={17} aria-hidden="true" /><Phone size={16} aria-hidden="true" /><MoreVertical size={17} aria-hidden="true" />
              </div>
              <div className="phone-conversation">
                <span className="phone-day">Hoje</span>
                <div className="phone-bubble phone-bubble-out"><p>BIA, quais são meus horários de amanhã?</p><span>11:54 <CheckCheck size={12} aria-hidden="true" /></span></div>
                <div className="phone-bubble phone-bubble-in"><p>Sua agenda de amanhã:</p><p>09h00 · Corte<br />10h30 · Corte e barba<br />14h00 · Barba</p><p>Quer ver mais detalhes?</p><span>11:54</span></div>
                <div className="phone-bubble phone-bubble-out"><p>E os interessados na próxima turma?</p><span>11:55 <CheckCheck size={12} aria-hidden="true" /></span></div>
                <div className="phone-bubble phone-bubble-in"><p>Você tem 3 interessados na próxima turma. Quer ver quem são?</p><span>11:55</span></div>
              </div>
              <div className="phone-compose" aria-hidden="true"><div><Smile size={17} /><span>Mensagem</span><Paperclip size={16} /><Camera size={16} /></div><span><Mic size={17} /></span></div>
            </div>
            <img className="phone-frame" src={asset('/preview-templates/mockup-celular-previa.png')} alt="" aria-hidden="true" />
          </div>
          <figcaption>Prévia ilustrativa com dados fictícios. Recursos sujeitos a permissões e disponibilidade.</figcaption>
        </figure>
      </div>
    </div>
  </section>;
}
