'use strict';

(() => {
  const doc = document;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...doc.querySelectorAll('.presentation-section')];
  const header = doc.querySelector('.site-header');
  const progress = doc.getElementById('reading-progress');
  let currentSection = 0;
  let presentationMode = false;
  let scrollFrame = false;

  if ('IntersectionObserver' in window) {
    doc.documentElement.classList.add('js');
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -25px 0px' });
    doc.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  }

  function updateScroll() {
    const available = doc.documentElement.scrollHeight - window.innerHeight;
    const fraction = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
    progress.style.width = `${fraction * 100}%`;
    header.classList.toggle('scrolled', window.scrollY > 35);
    const probe = window.scrollY + Math.min(window.innerHeight * 0.35, 330);
    let next = 0;
    sections.forEach((section, index) => { if (section.offsetTop <= probe) next = index; });
    currentSection = next;
    doc.getElementById('presentation-position').textContent = `${String(next + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
    doc.getElementById('presentation-prev').disabled = next === 0;
    doc.getElementById('presentation-next').disabled = next === sections.length - 1;
    doc.querySelectorAll('.desktop-nav a').forEach(anchor => anchor.classList.toggle('current', anchor.hash === `#${sections[next].id}`));
    scrollFrame = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollFrame) { window.requestAnimationFrame(updateScroll); scrollFrame = true; }
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  const menuToggle = doc.getElementById('menu-toggle');
  const mobileMenu = doc.getElementById('mobile-menu');
  function closeMenu() { mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
  menuToggle.addEventListener('click', () => {
    mobileMenu.hidden = !mobileMenu.hidden;
    menuToggle.setAttribute('aria-expanded', String(!mobileMenu.hidden));
  });
  mobileMenu.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', closeMenu));
  doc.addEventListener('click', event => {
    if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  const scenarios = {
    barbearia: {
      description: 'Corte com João e barba com Pedro no mesmo pedido. A BIA consulta uma combinação de horários e apresenta o resumo antes de confirmar.',
      messages: [
        ['user', 'Quero um corte com João e barba com Pedro amanhã depois das 15h.'],
        ['bia', 'Encontrei uma opção: <strong>corte às 15h com João</strong> e <strong>barba às 15h35 com Pedro</strong>. Posso confirmar os dois serviços?'],
        ['user', 'Pode confirmar.'],
        ['bia', 'Pedido confirmado no exemplo. O resumo reúne os serviços, os profissionais e os horários.']
      ]
    },
    escola: {
      description: 'O interessado recebe as informações do curso, avança pelo funil e chega ao pagamento. No MVP, o responsável confirma a venda e a vaga.',
      messages: [
        ['user', 'Quero saber sobre o próximo curso presencial de corte.'],
        ['bia', 'Posso te ajudar. Você busca <strong>formação inicial</strong> ou um <strong>aperfeiçoamento</strong> para quem já atende?'],
        ['user', 'Aperfeiçoamento. Já trabalho na área.'],
        ['bia', 'Vou apresentar a próxima turma do catálogo e o link de inscrição. O responsável confirma o pagamento e a sua vaga.']
      ]
    },
    gestor: {
      description: 'O responsável autorizado consulta a agenda e os interessados pelo WhatsApp. Alterações seguem as permissões e a confirmação necessária.',
      messages: [
        ['user', 'BIA, como está a agenda do João amanhã?'],
        ['bia', 'No exemplo, João tem <strong>4 reservas</strong>. Há espaço às <strong>10h</strong> e às <strong>14h30</strong> para um corte de 30 minutos.'],
        ['user', 'E os interessados na próxima turma?'],
        ['bia', 'No exemplo, há <strong>6 interessados aguardando retorno</strong>. Posso mostrar a lista para você acompanhar.']
      ]
    }
  };
  let activeScenario = 'barbearia';
  let replayTimers = [];
  const chatPanel = doc.getElementById('chat-panel');
  const replayButton = doc.getElementById('replay-chat');
  function clearReplay() { replayTimers.forEach(window.clearTimeout); replayTimers = []; replayButton.disabled = false; }
  function addMessage(message, index) {
    const bubble = doc.createElement('div');
    bubble.className = `chat-bubble ${message[0] === 'user' ? 'from-user' : 'from-bia'}`;
    bubble.innerHTML = `${message[1]}<time>9:${String(41 + index).padStart(2, '0')}</time>`;
    chatPanel.appendChild(bubble);
    chatPanel.scrollTop = chatPanel.scrollHeight;
  }
  function showScenario(name, animate = false) {
    if (!Object.hasOwn(scenarios, name)) return;
    clearReplay(); activeScenario = name;
    doc.getElementById('scenario-description').textContent = scenarios[name].description;
    doc.querySelectorAll('[data-scenario]').forEach(tab => {
      const selected = tab.dataset.scenario === name;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    chatPanel.setAttribute('aria-labelledby', `tab-${name}`);
    chatPanel.replaceChildren();
    if (animate && !reducedMotion.matches) {
      replayButton.disabled = true;
      scenarios[name].messages.forEach((message, index) => replayTimers.push(window.setTimeout(() => {
        addMessage(message, index);
        if (index === scenarios[name].messages.length - 1) replayButton.disabled = false;
      }, index * 1100)));
    } else {
      scenarios[name].messages.forEach(addMessage);
      chatPanel.scrollTop = 0;
    }
  }
  const tabs = [...doc.querySelectorAll('[data-scenario]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showScenario(tab.dataset.scenario));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      showScenario(next.dataset.scenario); next.focus();
    });
  });
  replayButton.addEventListener('click', () => showScenario(activeScenario, true));
  showScenario('barbearia');

  const prices = { beta: { barbearia: 199, escola: 299, hibrido: 449 }, regular: { barbearia: 299, escola: 399, hibrido: 599 } };
  doc.querySelectorAll('[data-price-mode]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.priceMode;
    doc.querySelectorAll('[data-price-mode]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected));
    });
    doc.querySelectorAll('[data-plan-price]').forEach(item => { item.textContent = prices[mode][item.dataset.planPrice]; });
    doc.querySelectorAll('[data-price-context]').forEach(item => { item.textContent = mode === 'beta' ? 'Condição por 12 meses desde a ativação.' : 'Referência para novas adesões após a campanha.'; });
  }));

  function formatMoney(value) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 }).format(value); }
  const quantityInputs = [...doc.querySelectorAll('.quantity-row input')];
  const audienceInput = doc.getElementById('event-audience');
  const conversionSlider = doc.getElementById('conversion-slider');
  const additionalCosts = doc.getElementById('other-costs');
  const percent = value => `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)}%`;
  const countFormat = value => new Intl.NumberFormat('pt-BR').format(value);
  function currentCounts() { return Object.fromEntries(quantityInputs.map(input => [input.dataset.plan, Number(input.value || 0)])); }
  function updateSimulation() {
    const note = doc.getElementById('simulation-input-note');
    try {
      const result = window.BiaModel.calculate(currentCounts(), { audience: Number(audienceInput.value), otherCosts: Number(additionalCosts.value || 0) });
      doc.getElementById('client-count').textContent = `${countFormat(result.clients)} assinaturas`;
      doc.getElementById('conversion-value').textContent = percent(result.conversionPercent);
      conversionSlider.value = Math.min(100, result.conversionPercent);
      doc.getElementById('sim-revenue').textContent = formatMoney(result.revenue);
      doc.getElementById('sim-a').textContent = formatMoney(result.launchA);
      doc.getElementById('sim-b').textContent = formatMoney(result.launchB);
      doc.getElementById('sim-recurring').textContent = formatMoney(result.recurring);
      doc.getElementById('sim-cash-b').textContent = formatMoney(result.baroneCashB);
      doc.getElementById('sim-ticket').textContent = `${formatMoney(result.averageTicket)} no ${result.ticketBasis}`;
      doc.getElementById('payback-setup').textContent = countFormat(result.setupClients);
      doc.getElementById('payback-base').textContent = countFormat(result.setupAndBaseClients);
      doc.getElementById('payback-setup-conversion').textContent = `${percent(result.setupConversion)} do público informado`;
      doc.getElementById('payback-base-conversion').textContent = `${percent(result.setupAndBaseConversion)} do público informado`;
      const saving = doc.getElementById('sim-saving');
      const savingCaption = doc.getElementById('sim-saving-caption');
      if (result.savingB > 0) {
        saving.textContent = formatMoney(result.savingB);
        savingCaption.textContent = 'a mais no caixa dos Barone ao escolher a proposta B, frente à A.';
      } else if (result.savingB < 0) {
        saving.textContent = formatMoney(-result.savingB);
        savingCaption.textContent = 'de investimento adicional na B frente à A, neste cenário de vendas. O aporte garante a estruturação inicial.';
      } else {
        saving.textContent = 'Mesmo valor';
        savingCaption.textContent = 'para o lançamento nas duas propostas, neste cenário.';
      }
      doc.getElementById('saving-result').classList.toggle('investment-case', result.savingB < 0);
      note.textContent = result.conversionPercent > 100 ? 'Este cenário supera o público informado. Considere outros públicos ou revise as quantidades.' : 'Quantidades livres. Conversão é uma hipótese, não uma previsão de vendas.';
      note.classList.remove('input-error');
      doc.querySelectorAll('[data-conversion]').forEach(button => {
        const active = Math.abs(Number(button.dataset.conversion) - result.conversionPercent) < .01;
        button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
      });
    } catch (error) {
      note.textContent = error.message;
      note.classList.add('input-error');
    }
  }
  function applyConversion(value) {
    const audience = Number(audienceInput.value);
    if (!Number.isSafeInteger(audience) || audience < 1) { updateSimulation(); return; }
    const total = Math.round(audience * value / 100);
    const distribution = window.BiaModel.distribute(total, currentCounts());
    quantityInputs.forEach(input => { input.value = distribution[input.dataset.plan]; });
    updateSimulation();
  }
  quantityInputs.forEach(input => input.addEventListener('input', updateSimulation));
  additionalCosts.addEventListener('input', updateSimulation);
  audienceInput.addEventListener('input', updateSimulation);
  conversionSlider.addEventListener('input', () => applyConversion(Number(conversionSlider.value)));
  doc.querySelectorAll('[data-conversion]').forEach(button => button.addEventListener('click', () => applyConversion(Number(button.dataset.conversion))));
  doc.getElementById('reset-simulation').addEventListener('click', () => {
    audienceInput.value = 2000; additionalCosts.value = 0;
    const distribution = { barbearia: 40, escola: 40, hibrido: 20 };
    quantityInputs.forEach(input => { input.value = distribution[input.dataset.plan]; }); updateSimulation();
  });
  updateSimulation();

  doc.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
    const dialog = doc.getElementById(button.dataset.open);
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
  }));
  doc.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });

  function moveSection(direction) {
    const next = Math.max(0, Math.min(sections.length - 1, currentSection + direction));
    sections[next].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }
  function leavePresentation() {
    presentationMode = false;
    doc.body.classList.remove('presentation-mode');
    doc.getElementById('presentation-controls').hidden = true;
    doc.getElementById('present-button').setAttribute('aria-pressed', 'false');
    if (doc.fullscreenElement && doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
  }
  doc.getElementById('present-button').addEventListener('click', () => {
    if (presentationMode) { leavePresentation(); return; }
    presentationMode = true;
    closeMenu();
    doc.body.classList.add('presentation-mode');
    doc.getElementById('presentation-controls').hidden = false;
    doc.getElementById('present-button').setAttribute('aria-pressed', 'true');
    if (doc.documentElement.requestFullscreen) doc.documentElement.requestFullscreen().catch(() => {});
    updateScroll();
  });
  doc.getElementById('presentation-prev').addEventListener('click', () => moveSection(-1));
  doc.getElementById('presentation-next').addEventListener('click', () => moveSection(1));
  doc.getElementById('presentation-close').addEventListener('click', leavePresentation);
  doc.addEventListener('fullscreenchange', () => { if (!doc.fullscreenElement && presentationMode) leavePresentation(); });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); if (presentationMode) leavePresentation(); }
    if (!presentationMode || doc.querySelector('dialog[open]') || event.target.closest('input,textarea,[role="tab"],select')) return;
    if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault(); moveSection(['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1);
    }
  });
  doc.getElementById('print-button').addEventListener('click', () => {
    doc.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    window.print();
  });
})();
