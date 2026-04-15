window.GlobalAudio = {
  isMuted: false,
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (window.BGMManager) window.BGMManager.setMute(this.isMuted);
    
    if (window.AudioManager && window.AudioManager.getCtx) {
      const c = window.AudioManager.getCtx(true); // pass true to just get it without resuming if muted
      if (c) {
        if (this.isMuted && c.state === 'running') c.suspend();
        else if (!this.isMuted && c.state === 'suspended') c.resume();
      }
    }
    return this.isMuted;
  }
};

// audio.js - Web Audio API synthesized sound effects
window.AudioManager = (() => {
  let ctx = null;

  function getCtx(ignoreResume = false) {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended' && !ignoreResume && (!window.GlobalAudio || !window.GlobalAudio.isMuted)) {
      ctx.resume();
    }
    return ctx;
  }

  function playTone(frequency, type, duration, volume = 0.4, decay = true) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    if (decay) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  }

  function playNoise(duration, volume = 0.3) {
    const c = getCtx();
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = c.createBufferSource();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    source.start(c.currentTime);
  }

  return {
    slash() {
      const c = getCtx();
      // High-freq whoosh
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.2);
      playNoise(0.1, 0.15);
    },

    hit() {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.12);
      gain.gain.setValueAtTime(0.5, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.25);
      playNoise(0.08, 0.25);
    },

    heavyHit() {
      const c = getCtx();
      [120, 80, 55].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, c.currentTime + i * 0.02);
        gain.gain.setValueAtTime(0.4, c.currentTime + i * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3 + i * 0.05);
        osc.start(c.currentTime + i * 0.02);
        osc.stop(c.currentTime + 0.4);
      });
      playNoise(0.15, 0.35);
    },

    block() {
      playTone(600, 'triangle', 0.1, 0.3);
      playTone(400, 'triangle', 0.08, 0.2);
    },

    kick() {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.15);
      gain.gain.setValueAtTime(0.6, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
      osc.start(); osc.stop(c.currentTime + 0.25);
    },

    projectile() {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, c.currentTime);
      osc.frequency.linearRampToValueAtTime(100, c.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
      osc.start(); osc.stop(c.currentTime + 0.35);
    },

    energyCharge() {
      const c = getCtx();
      const osc = c.createOscillator();
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      const gain = c.createGain();
      lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
      osc.connect(gain); gain.connect(c.destination);
      lfo.frequency.value = 8;
      lfoGain.gain.value = 30;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, c.currentTime);
      osc.frequency.linearRampToValueAtTime(600, c.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
      lfo.start(); osc.start(); lfo.stop(c.currentTime + 0.4); osc.stop(c.currentTime + 0.45);
    },

    ultimate() {
      const c = getCtx();
      // Epic rising chord
      [100, 150, 200, 250].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, c.currentTime + i * 0.05);
        osc.frequency.linearRampToValueAtTime(freq * 3, c.currentTime + 0.6);
        gain.gain.setValueAtTime(0.15, c.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.15, c.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
        osc.start(c.currentTime + i * 0.05);
        osc.stop(c.currentTime + 1.0);
      });
      // Big impact boom after delay
      setTimeout(() => {
        playNoise(0.4, 0.5);
        playTone(60, 'sine', 0.5, 0.6);
      }, 700);
    },

    dodge() {
      playNoise(0.06, 0.1);
      playTone(500, 'sine', 0.08, 0.15);
    },

    jump() {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, c.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
      osc.start(); osc.stop(c.currentTime + 0.25);
    },

    victory() {
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'sine', 0.3, 0.4), i * 150);
      });
    },

    defeat() {
      [440, 349, 294, 220].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'sawtooth', 0.4, 0.3), i * 200);
      });
    }
  };
})();

window.BGMManager = (() => {
  let currentAudio = null;
  let bgms = {};
  
  const bgmConfigs = {
    'bgm_main menu': {
      src: 'assets/bgm/bgm_main menu.mp3',
      startOffset: 226, 
      loopStart: 226 
    },
    'bgm_tanjiro': {
      src: 'assets/bgm/bgm_tanjiro.mp3',
      startOffset: 167, 
      loopStart: 167
    },
    'bgm_mode': { src: 'assets/bgm/bgm_mode.mp3' },
    'bgm_nezuko': { src: 'assets/bgm/bgm_nezuko.mp3' },
    'bgm_zenitsu': { src: 'assets/bgm/bgm_zenitsu.mp3' },
    'bgm_inosuke': { src: 'assets/bgm/bgm_inosuke.mp3' }
  };

  let fadeInterval = null;

  function play(bgmId) {
    if (currentAudio && currentAudio.bgmId === bgmId && !currentAudio.paused) return;
    
    // Fallback BGM 
    if (!bgmConfigs[bgmId]) {
      bgmId = 'bgm_mode';
    }
    
    const config = bgmConfigs[bgmId];
    if (!config) return;

    if (!bgms[bgmId]) {
      const a = new Audio(config.src);
      a.loop = false;
      a.addEventListener('ended', function() {
        this.currentTime = config.loopStart || 0;
        this.play().catch(()=>{});
      });
      bgms[bgmId] = a;
    }

    // fade out current
    if (currentAudio && currentAudio !== bgms[bgmId]) {
      const oldAudio = currentAudio;
      let targetVol = oldAudio.volume;
      const fadeOutInt = setInterval(() => {
        targetVol -= 0.1;
        if (targetVol <= 0) {
          targetVol = 0;
          clearInterval(fadeOutInt);
          oldAudio.pause();
          oldAudio.currentTime = 0;
        }
        oldAudio.volume = targetVol;
      }, 50);
    }

    const audio = bgms[bgmId];
    currentAudio = audio;
    currentAudio.bgmId = bgmId;
    
    // reset position to startOffset only if it was stopped/not started
    if (currentAudio.currentTime === 0 || currentAudio.paused) {
        currentAudio.currentTime = config.startOffset || 0;
    }

    // Prepare fade in
    currentAudio.volume = 0;
    const playPromise = currentAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.warn("BGM autoplay warning:", e));
    }

    clearInterval(fadeInterval);
    let vol = 0;
    fadeInterval = setInterval(() => {
      vol += 0.05;
      if (vol >= 0.5) { // max volume 0.5 for BGM
        vol = 0.5;
        clearInterval(fadeInterval);
      }
      currentAudio.volume = vol;
    }, 100);
  }

  function pause() {
    if (currentAudio) {
      clearInterval(fadeInterval);
      currentAudio.pause();
    }
  }

  function resumeAutoplay() {
    if (currentAudio && currentAudio.paused) {
      currentAudio.play().catch(()=>{});
      return true;
    }
    return false;
  }

  function setMute(muted) {
    Object.values(bgms).forEach(a => {
      a.muted = muted;
    });
  }

  return { play, pause, resumeAutoplay, setMute };
})();
