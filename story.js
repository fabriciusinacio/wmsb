(() => {
  const chapters = Array.from(document.querySelectorAll('[data-step]'));
  const tablet = document.querySelector('.tablet');
  if (!tablet || !chapters.length) return;
  const byId = id => document.getElementById(id);
  const scenes = [
    ['Bom dia, Ana.', 'Hora de começar', 'Entrada registrada', 'Tudo pronto para um novo dia.', '—', '—'],
    ['Uma pausa faz bem.', 'Hora de recarregar', 'Seu benefício acompanha você', 'Alimentação e refeição para o seu dia.', '12:00', '—'],
    ['Boa tarde, Ana.', 'De volta à rotina', 'Retorno registrado', 'Sua jornada segue organizada.', '12:00 / 13:00', '—'],
    ['Até amanhã, Ana.', 'Um dia bem cuidado', 'Saída registrada', 'Jornada encerrada. Boa volta para casa.', '12:00 / 13:00', '18:00']
  ];
  const hours = [480, 720, 780, 1080];
  const journey = document.getElementById('jornada');
  const tones = [
    { time: 480, sky: [233, 241, 222], screen: [252, 253, 247] },
    { time: 720, sky: [242, 237, 211], screen: [255, 253, 241] },
    { time: 900, sky: [232, 209, 164], screen: [255, 247, 227] },
    { time: 1020, sky: [117, 111, 85], screen: [246, 235, 215] },
    { time: 1080, sky: [18, 49, 42], screen: [226, 237, 224] }
  ];
  const mix = (a, b, amount) => a.map((value, i) => Math.round(value + (b[i] - value) * amount));
  const rgb = color => `rgb(${color.join(', ')})`;
  const luminance = color => color.map(value => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
  function paintDay(minutes) {
    if (!journey) return;
    const end = tones.findIndex(tone => tone.time >= minutes);
    const next = tones[Math.max(0, end)];
    const previous = tones[Math.max(0, end - 1)];
    const amount = next.time === previous.time ? 0 : (minutes - previous.time) / (next.time - previous.time);
    const sky = mix(previous.sky, next.sky, amount);
    const light = luminance(sky);
    const darkInk = [16, 46, 37];
    const paleInk = [246, 248, 239];
    const darkContrast = (light + .05) / (luminance(darkInk) + .05);
    const paleContrast = (luminance(paleInk) + .05) / (light + .05);
    const useDark = darkContrast >= paleContrast;
    journey.style.setProperty('--day-bg', rgb(sky));
    journey.style.setProperty('--day-ink', rgb(useDark ? darkInk : paleInk));
    journey.style.setProperty('--day-accent', useDark ? '#124b31' : '#d5f78c');
    journey.style.setProperty('--day-line', useDark ? '#173d2b55' : '#e6f2d666');
    journey.style.setProperty('--day-screen', rgb(mix(previous.screen, next.screen, amount)));
    journey.dataset.period = minutes < 720 ? 'morning' : minutes < 1020 ? 'afternoon' : 'evening';
    const label = byId('day-phase');
    if (label) label.textContent = minutes < 720 ? 'MANHÃ · UM NOVO COMEÇO' : minutes < 1020 ? 'TARDE · O DIA SEGUE' : 'ENTARDECER · ATÉ AMANHÃ';
  }
  let active = -1;
  let pending = false;
  function render() {
    pending = false;
    const mobile = window.matchMedia('(max-width: 600px)').matches;
    const deviceHeight = document.querySelector('.device-column').getBoundingClientRect().height;
    const anchor = mobile ? deviceHeight + (innerHeight - deviceHeight) * .48 : innerHeight * .5;
    const centers = chapters.map(chapter => { const box = chapter.getBoundingClientRect(); return box.top + box.height / 2; });
    let position = 0;
    if (anchor >= centers[3]) position = 3;
    else if (anchor > centers[0]) {
      for (let i = 0; i < 3; i++) {
        if (anchor >= centers[i] && anchor < centers[i + 1]) { position = i + (anchor - centers[i]) / (centers[i + 1] - centers[i]); break; }
      }
    }
    // Move between key hours, then pause at each registration.
    const lower = Math.floor(position);
    const fraction = Math.max(0, Math.min(1, (position - lower - .2) / .6));
    const minutes = Math.round(hours[lower] + (hours[Math.min(3, lower + 1)] - hours[lower]) * fraction);
    paintDay(minutes);
    const index = Math.min(3, lower + (fraction === 1 ? 1 : 0));
    byId('clock').textContent = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    if (byId('mobile-clock')) byId('mobile-clock').textContent = byId('clock').textContent;
    byId('progress').style.width = `${position / 3 * 100}%`;
    if (byId('mobile-progress')) byId('mobile-progress').style.width = `${position / 3 * 100}%`;
    if (index === active) return;
    active = index;
    const scene = scenes[index];
    if (byId('mobile-status')) byId('mobile-status').textContent = scene[2];
    tablet.dataset.scene = String(index);
    ['greeting', 'clock-label', 'screen-title', 'screen-description', 'record-break', 'record-exit'].forEach((id, i) => { byId(id).textContent = scene[i]; });
    byId('scene-number').textContent = `0${index + 1} / 04`;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(render); } }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  render();
})();
