(function () {
  var menuToggle = document.getElementById('menuToggle');
  var mainMenu = document.getElementById('mainMenu');

  if (menuToggle && mainMenu) {
    var menuLinks = mainMenu.querySelectorAll('a');

    menuToggle.addEventListener('click', function () {
      var isOpen = mainMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    Array.prototype.forEach.call(menuLinks, function (link) {
      link.addEventListener('click', function () {
        mainMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var revealElements = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var forceShowReveal = function () {
    revealElements.forEach(function (element) {
      element.classList.add('show');
    });
  };

  if (revealElements.length) {
    if ('IntersectionObserver' in window) {
      try {
        document.documentElement.classList.add('reveal-animate');

        var revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('show');
              }
            });
          },
          { threshold: 0.14 }
        );

        revealElements.forEach(function (element) {
          revealObserver.observe(element);
        });

        // Hard fallback: keep sections visible even on inconsistent mobile browsers.
        window.setTimeout(forceShowReveal, 1400);
      } catch (error) {
        document.documentElement.classList.remove('reveal-animate');
        forceShowReveal();
      }
    } else {
      forceShowReveal();
    }
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));

  if (faqItems.length) {
    var closeFaqItem = function (item) {
      item.classList.remove('active');
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (answer) answer.style.maxHeight = '0px';
    };

    var openFaqItem = function (item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      item.classList.add('active');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
    };

    faqItems.forEach(function (item) {
      var button = item.querySelector('.faq-question');
      if (!button) return;

      button.addEventListener('click', function () {
        var isActive = item.classList.contains('active');
        faqItems.forEach(function (current) {
          closeFaqItem(current);
        });
        if (!isActive) openFaqItem(item);
      });
    });

    var initial = document.querySelector('.faq-item.active') || faqItems[0];
    faqItems.forEach(function (item) {
      closeFaqItem(item);
    });
    if (initial) openFaqItem(initial);
  }

  var whatsappFloat = document.querySelector('.whatsapp-float');
  var whatsappLinks = Array.prototype.slice.call(
    document.querySelectorAll('a[href*="wa.me/"], a[href*="api.whatsapp.com/send"]')
  );

  if (whatsappLinks.length) {
    var extractWhatsAppNumber = function (href) {
      var waMeMatch = href.match(/wa\.me\/(\d+)/i);
      if (waMeMatch && waMeMatch[1]) return waMeMatch[1];

      var apiMatch = href.match(/[?&]phone=(\d+)/i);
      if (apiMatch && apiMatch[1]) return apiMatch[1];

      return '';
    };

    var getWhatsAppNumber = function () {
      var i;
      for (i = 0; i < whatsappLinks.length; i += 1) {
        var href = whatsappLinks[i].getAttribute('href') || '';
        var number = extractWhatsAppNumber(href);
        if (number) return number;
      }
      return '5543988183867';
    };

    var getDefaultSolution = function () {
      var path = window.location.pathname.toLowerCase();
      if (path.indexOf('vr-gente') !== -1) return 'VR Gente';
      if (path.indexOf('vr-beneficios') !== -1) return 'VR Benefícios';
      return '';
    };

    var defaultSolution = getDefaultSolution();
    var whatsappNumber = getWhatsAppNumber();
    var activeTrigger = null;

    var modal = document.createElement('div');
    modal.className = 'wa-modal';
    modal.id = 'waModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="wa-modal-backdrop" data-wa-close="true"></div>',
      '<section class="wa-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="waModalTitle">',
      '<h2 class="wa-modal-title" id="waModalTitle">Fale com a WMSB</h2>',
      '<p class="wa-modal-subtitle">Preencha os dados para receber atendimento no WhatsApp.</p>',
      '<form class="wa-form" id="waLeadForm">',
      '<div class="wa-field"><label for="waNome">Nome</label><input id="waNome" name="nome" type="text" required autocomplete="name" /></div>',
      '<div class="wa-field"><label for="waEmpresa">Empresa</label><input id="waEmpresa" name="empresa" type="text" required autocomplete="organization" /></div>',
      '<div class="wa-field"><label for="waRamo">Ramo de atividade</label><input id="waRamo" name="ramo" type="text" required /></div>',
      '<div class="wa-field"><label for="waFuncionarios">Quantidade de funcionários</label><input id="waFuncionarios" name="funcionarios" type="number" min="1" inputmode="numeric" required /></div>',
      '<div class="wa-field"><label for="waSolucao">Solução de interesse</label><select id="waSolucao" name="solucao" required><option value="" disabled selected>Selecione</option><option value="VR Gente">VR Gente</option><option value="VR Benefícios">VR Benefícios</option></select></div>',
      '<div class="wa-field"><label for="waMensagem">Dúvidas ou mensagem</label><textarea id="waMensagem" name="mensagem" placeholder="Conte brevemente o que você precisa."></textarea></div>',
      '<div class="wa-form-actions"><button class="btn btn-outline wa-modal-close" type="button" data-wa-close="true">Cancelar</button><button class="btn btn-primary" type="submit">Enviar no WhatsApp</button></div>',
      '</form>',
      '</section>'
    ].join('');

    document.body.appendChild(modal);

    var leadForm = document.getElementById('waLeadForm');
    var nameInput = document.getElementById('waNome');
    var solutionSelect = document.getElementById('waSolucao');

    var getSolutionFromTrigger = function (trigger) {
      if (!trigger) return defaultSolution;

      var explicitSolution = trigger.getAttribute('data-solution');
      if (explicitSolution === 'VR Gente' || explicitSolution === 'VR Benefícios') {
        return explicitSolution;
      }

      var triggerText = ((trigger.textContent || '') + ' ' + (trigger.getAttribute('aria-label') || '')).toLowerCase();
      if (triggerText.indexOf('gente') !== -1) return 'VR Gente';
      if (triggerText.indexOf('benef') !== -1) return 'VR Benefícios';

      return defaultSolution;
    };

    var openModal = function (trigger) {
      activeTrigger = trigger || null;
      if (solutionSelect) {
        var suggestedSolution = getSolutionFromTrigger(activeTrigger);
        solutionSelect.value = suggestedSolution || '';
      }

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');

      if (whatsappFloat) {
        whatsappFloat.classList.add('wa-active');
        whatsappFloat.setAttribute('aria-expanded', 'true');
      }
      if (nameInput) setTimeout(function () { nameInput.focus(); }, 30);
    };

    var closeModal = function () {
      activeTrigger = null;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');

      if (whatsappFloat) {
        whatsappFloat.classList.remove('wa-active');
        whatsappFloat.setAttribute('aria-expanded', 'false');
      }
    };

    Array.prototype.forEach.call(whatsappLinks, function (link) {
      link.setAttribute('aria-controls', 'waModal');
      link.setAttribute('aria-expanded', 'false');

      link.addEventListener('click', function (event) {
        event.preventDefault();

        if (modal.classList.contains('open') && activeTrigger === link) {
          closeModal();
          return;
        }

        openModal(link);
      });
    });

    modal.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.getAttribute('data-wa-close') === 'true') {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if ((event.key === 'Escape' || event.key === 'Esc') && modal.classList.contains('open')) {
        closeModal();
      }
    });

    if (leadForm) {
      leadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var nome = document.getElementById('waNome').value.trim();
        var empresa = document.getElementById('waEmpresa').value.trim();
        var ramo = document.getElementById('waRamo').value.trim();
        var funcionarios = document.getElementById('waFuncionarios').value.trim();
        var solucao = document.getElementById('waSolucao').value.trim();
        var mensagem = document.getElementById('waMensagem').value.trim();
        var produtoFormatado = solucao.toUpperCase();

        var texto = [
          'nome: ' + nome,
          'nome da empresa: ' + empresa,
          'ramo: ' + ramo,
          'qt funcionario: ' + funcionarios,
          'produto: ' + produtoFormatado,
          'mensagem: ' + (mensagem || '-')
        ].join('\n');

        var whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(texto);
        var popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        if (!popup) {
          window.location.href = whatsappUrl;
        }

        closeModal();
        leadForm.reset();

        if (solutionSelect && defaultSolution) {
          solutionSelect.value = defaultSolution;
        }
      });
    }
  }
})();
