import { sections } from '../data/navigation';
export function SectionPreview() {
  return <div className="section-previews"><p className="preview-caption">ESTRUTURA DA PÁGINA / PRÓXIMAS DOBRAS EM PREPARAÇÃO</p>{sections.map(section => <section id={section.id} className="section-preview" key={section.id}><span className="preview-status">PRÓXIMA ETAPA</span><h2>{section.label}</h2><p>{section.description}</p><a href="#inicio">Voltar à hero ↑</a></section>)}</div>;
}
