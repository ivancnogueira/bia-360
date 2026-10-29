import { Sparkles } from 'lucide-react';
import { roadmap } from '../data/product';
export function Roadmap() {
  return <section id="em-breve" className="sales-section roadmap-section" aria-labelledby="roadmap-title"><div className="section-inner roadmap-layout">
    <div className="roadmap-intro"><p className="section-kicker"><span>05</span> / EM EVOLUÇÃO</p><h2 id="roadmap-title">A próxima versão<br /><em>começa agora.</em></h2><p>A visão da BIA vai além do primeiro lançamento. Estas são possibilidades para o futuro do ecossistema.</p><div className="roadmap-orbit" aria-hidden="true"><div><Sparkles size={50} strokeWidth={1} /></div></div></div>
    <div className="roadmap-content"><div className="roadmap-list">{roadmap.map((item, index) => <article className="roadmap-item" key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><small>EM ESTUDO</small></article>)}</div><p className="section-note">Ideias em avaliação, sem datas ou condições de acesso definidas. A disponibilidade será informada quando cada recurso for lançado.</p></div>
  </div></section>;
}
