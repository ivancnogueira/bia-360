(() => {
  'use strict';
  const key = 'bia360-scp-draft-v2';
  const form = document.querySelector('#contractForm');
  const status = document.querySelector('#saveStatus');
  const printGuide = document.querySelector('#printGuide');
  const defaults = { startDate: '2026-10-28', paymentModel: 'coproducao', signatureDate: new Date().toISOString().slice(0, 10) };

  const format = (value, type) => {
    if (!value) return '';
    if (type === 'currency') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
    if (type === 'percent') return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(Number(value) || 0)}%`;
    if (type === 'date') { const [year, month, day] = value.split('-'); return year && month && day ? `${day}/${month}/${year}` : value; }
    return value;
  };
  const values = () => Object.fromEntries([...new FormData(form)].map(([name, value]) => [name, value.trim()]));
  const update = () => {
    const data = values();
    document.querySelectorAll('[data-field]').forEach((element) => {
      const value = data[element.dataset.field] || '';
      element.textContent = value ? format(value, element.dataset.format) : (element.classList.contains('blank') ? element.textContent : '[não preenchido]');
    });
    const split = data.paymentModel === 'coproducao';
    document.querySelector('.model-dividend').hidden = split;
    document.querySelectorAll('.model-split').forEach((element) => { element.hidden = !split; });
    status.textContent = 'Alterações não salvas';
  };
  const persist = () => {
    try { localStorage.setItem(key, JSON.stringify(values())); status.textContent = 'Rascunho salvo neste navegador'; setTimeout(() => { if (status.textContent.includes('salvo')) status.textContent = ''; }, 2600); }
    catch { status.textContent = 'Não foi possível salvar neste navegador'; }
  };
  const populate = (data) => Object.entries({ ...defaults, ...data }).forEach(([name, value]) => { const field = form.elements[name]; if (field) field.value = value; });
  try { populate(JSON.parse(localStorage.getItem(key) || '{}')); } catch { populate(defaults); }
  update();
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  document.querySelector('#saveDraft').addEventListener('click', persist);
  document.querySelector('#resetDraft').addEventListener('click', () => { if (!confirm('Limpar os dados preenchidos neste navegador?')) return; localStorage.removeItem(key); form.reset(); populate(defaults); update(); status.textContent = 'Campos limpos'; });
  document.querySelector('#printPdf').addEventListener('click', () => { persist(); printGuide.showModal(); });
  document.querySelector('#closeGuide').addEventListener('click', () => printGuide.close());
  document.querySelector('#continuePrint').addEventListener('click', () => { printGuide.close(); setTimeout(() => window.print(), 80); });
  document.querySelector('#generatedOn').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date());
})();
