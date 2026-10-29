import { ArrowUpRight } from 'lucide-react';
import { faqs } from '../data/product';
export function FAQ() {
  return <section id="duvidas" className="sales-section faq-section" aria-labelledby="faq-title"><div className="section-inner faq-layout">
    <div className="faq-intro"><p className="section-kicker"><span>06</span> / PERGUNTAS FREQUENTES</p><h2 id="faq-title">Tudo mais<br /><em>claro por aqui.</em></h2><p>O próximo passo fica mais fácil quando você sabe o que esperar.</p><a className="inline-link" href="#suporte">Ainda tem dúvidas? Veja o suporte <ArrowUpRight size={17} aria-hidden="true" /></a></div>
    <div className="faq-list">{faqs.map(({question, answer}, index) => <details className="faq-item" key={question}><summary><span className="faq-index">0{index + 1}</span><span>{question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
  </div></section>;
}
