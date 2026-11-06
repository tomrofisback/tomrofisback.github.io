(() => {
  const key = 'tomrof-neon-sound';
  let enabled = true, audio, lastBuzz = -1000;
  try { enabled = localStorage.getItem(key) !== 'off'; } catch (_) {}
  const toggle = document.createElement('button');
  toggle.className = 'sound-toggle'; toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Activer ou couper le grésillement des néons');
  document.body.append(toggle);
  function render() { toggle.textContent = enabled ? 'Son : activé' : 'Son : coupé'; toggle.setAttribute('aria-pressed', String(enabled)); }
  function activate() {
    if (!enabled) return Promise.resolve(false);
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) { toggle.textContent = 'Son indisponible'; return Promise.resolve(false); }
    try { audio ||= new Audio(); if (audio.state === 'running') return Promise.resolve(true);
      return audio.resume().then(() => enabled && audio.state === 'running').catch(() => false);
    } catch (_) { return Promise.resolve(false); }
  }
  function playBuzz() {
    if (!enabled || !audio || audio.state !== 'running' || performance.now() - lastBuzz < 280) return;
    lastBuzz = performance.now();
    const time = audio.currentTime, oscillator = audio.createOscillator(), gain = audio.createGain(), filter = audio.createBiquadFilter();
    oscillator.type = 'sawtooth'; oscillator.frequency.value = 100; filter.type = 'lowpass'; filter.frequency.value = 1100;
    oscillator.connect(filter); filter.connect(gain); gain.connect(audio.destination);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.04, time + .012);
    gain.gain.setValueAtTime(.04, time + .06); gain.gain.linearRampToValueAtTime(0, time + .08);
    gain.gain.setValueAtTime(0, time + .115); gain.gain.linearRampToValueAtTime(.03, time + .13); gain.gain.linearRampToValueAtTime(0, time + .23);
    oscillator.start(time); oscillator.stop(time + .25); oscillator.onended = () => { oscillator.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
  function buzz() { activate().then(ok => { if (ok) playBuzz(); }); }
  toggle.addEventListener('click', () => { enabled = !enabled; try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch (_) {} render(); if (enabled) buzz(); else if (audio) audio.suspend().catch(() => {}); });
  document.addEventListener('pointerdown', event => { if (!toggle.contains(event.target)) activate(); });
  document.addEventListener('keydown', event => { if (event.isTrusted && !toggle.contains(event.target)) activate(); });
  document.querySelectorAll('.neon-btn,.main-nav a').forEach(link => {
    link.addEventListener('pointerenter', buzz); link.addEventListener('focus', buzz); link.addEventListener('pointerdown', buzz);
    link.addEventListener('click', event => {
      if (!enabled || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
      if (!audio || audio.state !== 'running') { buzz(); return; }
      event.preventDefault(); playBuzz(); setTimeout(() => { location.href = link.href; }, 260);
    });
  });
  render(); activate();
})();
