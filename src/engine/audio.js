// Synthesized retro sci-fi sound effects for Jet Laser (no external audio files needed)

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lastJetTick = 0;
  }

  _ensureContext() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone({ freq = 440, endFreq = null, duration = 0.12, type = "square", gain = 0.12 }) {
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playUiMove() {
    this.playTone({ freq: 520, endFreq: 660, duration: 0.06, type: "triangle", gain: 0.08 });
  }

  playUiConfirm() {
    this.playTone({ freq: 440, endFreq: 880, duration: 0.14, type: "triangle", gain: 0.11 });
  }

  playLaser() {
    this.playTone({ freq: 980, endFreq: 210, duration: 0.11, type: "sawtooth", gain: 0.09 });
  }

  playJetThrust(nowMs) {
    if (nowMs - this.lastJetTick < 55) return;
    this.lastJetTick = nowMs;
    this.playTone({ freq: 115 + Math.random() * 35, endFreq: 68, duration: 0.06, type: "sawtooth", gain: 0.045 });
  }

  playCrystal() {
    this.playTone({ freq: 660, endFreq: 1320, duration: 0.16, type: "sine", gain: 0.12 });
  }

  playFuel() {
    this.playTone({ freq: 380, endFreq: 760, duration: 0.18, type: "triangle", gain: 0.1 });
  }

  playEnemyHit() {
    this.playTone({ freq: 240, endFreq: 80, duration: 0.13, type: "square", gain: 0.11 });
  }

  playPlayerHurt() {
    this.playTone({ freq: 190, endFreq: 65, duration: 0.25, type: "sawtooth", gain: 0.14 });
  }

  playPortalWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => {
        this.playTone({ freq: n, endFreq: n * 1.03, duration: 0.18, type: "triangle", gain: 0.11 });
      }, idx * 90);
    });
  }

  playCommentSaved() {
    this.playTone({ freq: 587.33, endFreq: 880, duration: 0.15, type: "sine", gain: 0.11 });
  }

  playBoing() {
    this.playTone({ freq: 220, endFreq: 860, duration: 0.26, type: "sine", gain: 0.14 });
  }

  playLavaBoom() {
    this.playTone({ freq: 110, endFreq: 38, duration: 0.38, type: "sawtooth", gain: 0.12 });
  }

  playPlatformCollapse() {
    this.playTone({ freq: 180, endFreq: 55, duration: 0.24, type: "square", gain: 0.1 });
  }

  playRocketLaunch() {
    // Ignition rumble + rising liftoff roar!
    this.playTone({ freq: 85, endFreq: 210, duration: 0.65, type: "sawtooth", gain: 0.13 });
    setTimeout(() => {
      this.playTone({ freq: 140, endFreq: 620, duration: 1.35, type: "sawtooth", gain: 0.12 });
    }, 450);
  }

  playRoverDrive() {
    // Mars Rover starter rev + turbo electric drive-off vroom!
    this.playTone({ freq: 95, endFreq: 165, duration: 0.45, type: "triangle", gain: 0.13 });
    setTimeout(() => {
      this.playTone({ freq: 130, endFreq: 340, duration: 1.15, type: "sawtooth", gain: 0.1 });
    }, 420);
  }

  playRoverArrive() {
    // Mars Rover rolling onto the course & braking smoothly!
    this.playTone({ freq: 210, endFreq: 105, duration: 0.55, type: "triangle", gain: 0.1 });
  }

  playRoverHopOut() {
    // Cheerful cab hatch pop + pilot hop onto the course!
    this.playTone({ freq: 360, endFreq: 720, duration: 0.18, type: "sine", gain: 0.11 });
  }

  playWormholeWarp() {
    // Cosmic spiral suction into the pit wormhole, then bright pop-out back at the start!
    this.playTone({ freq: 780, endFreq: 155, duration: 0.26, type: "sine", gain: 0.13 });
    this.playTone({ freq: 520, endFreq: 120, duration: 0.24, type: "triangle", gain: 0.08 });
    setTimeout(() => {
      this.playTone({ freq: 195, endFreq: 880, duration: 0.26, type: "sine", gain: 0.13 });
    }, 250);
  }

  playIceBucketTip() {
    // Clanking frosty bucket dump!
    this.playTone({ freq: 520, endFreq: 280, duration: 0.16, type: "triangle", gain: 0.1 });
  }

  playIceFreeze() {
    // Crystalline freeze encasement sound!
    this.playTone({ freq: 980, endFreq: 420, duration: 0.24, type: "sine", gain: 0.13 });
    this.playTone({ freq: 1320, endFreq: 660, duration: 0.2, type: "triangle", gain: 0.08 });
  }

  playIceCrack(hitsLeft) {
    if (hitsLeft <= 0) {
      // 5th hit — joyous shattering ice chime!
      this.playTone({ freq: 580, endFreq: 1240, duration: 0.2, type: "sine", gain: 0.14 });
      this.playTone({ freq: 820, endFreq: 1560, duration: 0.18, type: "triangle", gain: 0.1 });
    } else {
      const pitch = 460 + (5 - hitsLeft) * 110;
      this.playTone({ freq: pitch, endFreq: pitch + 180, duration: 0.09, type: "square", gain: 0.09 });
    }
  }

  playBossJump() {
    this.playTone({ freq: 140, endFreq: 360, duration: 0.22, type: "sawtooth", gain: 0.11 });
  }

  playBossSlam() {
    this.playTone({ freq: 150, endFreq: 48, duration: 0.28, type: "sawtooth", gain: 0.14 });
  }

  playCatapultFling() {
    // Twanging wooden torsion release + high-flying cartoon whoosh!
    this.playTone({ freq: 135, endFreq: 420, duration: 0.18, type: "triangle", gain: 0.14 });
    setTimeout(() => {
      this.playTone({ freq: 290, endFreq: 760, duration: 0.24, type: "sine", gain: 0.11 });
    }, 55);
  }

  playSpikesPop() {
    // Crisp metallic shing! as ground spikes shoot up!
    this.playTone({ freq: 440, endFreq: 1180, duration: 0.11, type: "sawtooth", gain: 0.09 });
    this.playTone({ freq: 780, endFreq: 1520, duration: 0.09, type: "triangle", gain: 0.08 });
  }
}
