// Milo's Garden — synthesized sound effects.
//
// No audio files: every sound is a short Web Audio oscillator phrase, built
// lazily on the first user gesture so headless renders stay silent.

export function makeSfx() {
  let ctx = null;
  let muted = false;

  function audio() {
    if (muted) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') void ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }

  function tone(freq, at, dur, type = 'sine', vol = 0.12) {
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ac.currentTime + at;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    get muted() { return muted; },
    toggleMuted() { muted = !muted; return muted; },
    click() { tone(660, 0, 0.07, 'triangle', 0.08); },
    // rising two-note chime when a difference is found
    found() { tone(523, 0, 0.12); tone(784, 0.1, 0.2); },
    // low buzz for a wrong click
    wrong() { tone(140, 0, 0.22, 'sawtooth', 0.1); },
    // short arpeggio for clearing a round
    clear() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.16)); },
    // short fanfare for winning the whole game
    fanfare() {
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.2, 'triangle', 0.13));
    },
    // soft descending pair for running out of time
    gameOver() { tone(392, 0, 0.2); tone(262, 0.18, 0.35); },
  };
}
