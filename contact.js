(() => {
  const dialog = document.getElementById('contact-dialog');
  const form = document.getElementById('contact-form');
  if (!dialog || !form || typeof dialog.showModal !== 'function') return;
  const triggers = document.querySelectorAll('a[href*="wa.me/"]');
  let trigger = null;
  const close = () => dialog.close();
  triggers.forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('click', event => {
      event.preventDefault();
      trigger = link;
      const solution = link.dataset.solution;
      if (solution) form.elements.solucao.value = solution;
      dialog.showModal();
      document.body.classList.add('contact-open');
      link.setAttribute('aria-expanded', 'true');
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', close);
  dialog.querySelector('.cancel-contact').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('contact-open');
    if (trigger) { trigger.setAttribute('aria-expanded', 'false'); trigger.focus({preventScroll:true}); }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    for (const key of ['nome', 'empresa', 'ramo']) {
      const input = form.elements[key];
      input.setCustomValidity(values[key].trim() ? '' : 'Preencha este campo.');
      if (!input.reportValidity()) { input.addEventListener('input', () => input.setCustomValidity(''), {once:true}); return; }
    }
    const message = ['Olá! Vim pelo site da WMSB.', '', `Nome: ${values.nome.trim()}`, `Empresa: ${values.empresa.trim()}`, `Ramo de atividade: ${values.ramo.trim()}`, `Quantidade de funcionários: ${values.funcionarios}`, `Solução: ${values.solucao}`, `Mensagem: ${values.mensagem.trim() || 'Gostaria de mais informações.'}`].join('\n');
    // Same-tab navigation works with mobile browsers and WhatsApp app handoff.
    window.location.assign(`https://wa.me/5543988183867?text=${encodeURIComponent(message)}`);
  });
})();
