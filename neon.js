(() => {
  let audio, enabled = true, ready = false, lastBuzz = 0;
  const toggle = document.createElement('button');
  toggle.className = 'sound-toggle'; toggle.type = 'button'; toggle.textContent = 'Son : prêt à activer';
  toggle.setAttribute('aria-label', 'Activer ou couper le grésillement des néons');
  toggle.setAttribute('aria-pressed', 'false'); document.body.append(toggle);
  function activate() {
    if (!enabled) return;
    try { const Audio = window.AudioContext || window.webkitAudioContext; if(!Audio) { toggle.textContent='Son indisponible'; return; }
      audio ||= new Audio(); audio.resume().then(()=>{ready=true;toggle.textContent='Son : activé';toggle.setAttribute('aria-pressed','true');}).catch(()=>{});
    } catch(e) {toggle.textContent='Son indisponible';}
  }
  function buzz() {
    if(!enabled || !ready || !audio || audio.state!=='running' || performance.now()-lastBuzz<300) return;
    lastBuzz=performance.now();
    const time=audio.currentTime, oscillator=audio.createOscillator(), gain=audio.createGain(), filter=audio.createBiquadFilter();
    oscillator.type='sawtooth';oscillator.frequency.value=100; filter.type='lowpass';filter.frequency.value=900;
    oscillator.connect(filter);filter.connect(gain);gain.connect(audio.destination);
    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.018,time+.012);
    gain.gain.setValueAtTime(.018,time+.06);gain.gain.linearRampToValueAtTime(0,time+.08);
    gain.gain.setValueAtTime(0,time+.115);gain.gain.linearRampToValueAtTime(.013,time+.13);gain.gain.linearRampToValueAtTime(0,time+.23);
    oscillator.start(time);oscillator.stop(time+.25);oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();gain.disconnect();};
  }
  document.addEventListener('click',event=>{ if(event.target===toggle)return; activate(); },{once:true});
  toggle.addEventListener('click',()=>{if(!ready){enabled=true;activate();return;}enabled=!enabled;toggle.textContent=enabled?'Son : activé':'Son : coupé';toggle.setAttribute('aria-pressed',String(enabled));if(enabled)activate();});
  document.querySelectorAll('.bottom-buttons .neon-btn,.main-nav a').forEach(link=>{
    link.addEventListener('pointerenter',buzz);link.addEventListener('focus',buzz);
  });
})();