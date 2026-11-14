// Jet Laser — Main Game Engine, Pilot Select, Side-Scrolling Jetpack & Laser Gameplay

import { SoundEngine } from "./engine/audio.js";
import { InputManager } from "./engine/input.js";
import { PILOTS, getPilotById, drawPilotSprite } from "./entities/pilots.js";
import {
  drawMoonChomper,
  drawSpikyChomper,
  drawStalkAlien,
  drawTriangleUfo,
  drawTwinJetBooster,
  drawMazeBarrier,
  drawBrickWall,
  drawDiamondWall,
  drawEscapeRocket,
  drawMarsRover,
  drawSkyStar,
  drawTrampoline,
  drawSolarWobbler,
  drawDiamondFang,
  drawPetalUrchin,
  drawTentacleJelly,
  drawSnooloBoss,
  drawWormhole,
  drawIceBucket,
  drawFallingIceCube,
  drawFrozenIceBlock,
  drawCatapult,
  drawMeteorPickup,
  drawPopupSpikes,
  drawMarsBike,
} from "./entities/cartoonArt.js";
import { PLANETS, LEVELS } from "./levels/levels.js";
import { ToastOverlay } from "./engine/toast.js";

class JetLaserGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;

    this.sound = new SoundEngine();
    this.input = new InputManager();
    this.planets = PLANETS;
    this.levels = LEVELS;
    this.selectedPlanetId = "zoola";
    this.currentLevelIndex = 0;
    this.currentLevel = this.levels[this.currentLevelIndex];

    this.selectedPilotIndex = 0; // 0 = Starlight Nova Pilot, 1 = Turbo Ion Commander
    this.activePilot = PILOTS[0];
    this.pilotPillEl = document.getElementById("active-pilot-pill");

    this.state = "SELECT_PILOT"; // "SELECT_PILOT" | "PLAYING" | "LEVEL_COMPLETE" | "GAME_OVER"
    this.cameraX = 0;
    this.score = 0;
    this.timeSec = 0;
    this.levelTimer = 0;

    // Stars backdrop
    this.stars = Array.from({ length: 85 }, (_, i) => ({
      x: (i * 173) % 1200,
      y: (i * 97) % 490,
      size: (i % 3) + 1,
      parallax: 0.12 + (i % 4) * 0.08,
    }));

    this.player = this._createDefaultPlayer();
    this.platforms = [];
    this.trampolines = [];
    this.movingPlatforms = [];
    this.hazards = [];
    this.destructibles = [];
    this.enemies = [];
    this.pickups = [];
    this.lasers = [];
    this.enemyProjectiles = [];
    this.particles = [];

    this.loadLevel(this.currentLevelIndex);
    this.ui = new ToastOverlay();

    this._bindCanvasSelectClick();
    this._applyUrlShortcuts();
  }

  _createDefaultPlayer() {
    return {
      x: 90,
      y: 400,
      w: 32,
      h: 44,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      jetting: false,
      walkPhase: 0,
      hp: 5,
      maxHp: 5,
      fuel: 100,
      maxFuel: 100,
      fireCooldown: 0,
      invulnTimer: 0,
      catapultVx: 0,
      frozenHitsLeft: 0,
      freezeShakeTimer: 0,
      freezeImmuneTimer: 0,
    };
  }

  _applyUrlShortcuts() {}

  _bindCanvasSelectClick() {
    this.canvas.addEventListener("click", (e) => {
      if (this.state === "PLAYING" && this.player && this.player.frozenHitsLeft > 0) {
        this._hitFrozenIceBlock();
        return;
      }
      if (this.state !== "SELECT_PILOT") return;
      const rect = this.canvas.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) * this.width) / rect.width;
      const sy = ((e.clientY - rect.top) * this.height) / rect.height;

      const planetTabs = this._getPlanetTabRects();
      for (const ptab of planetTabs) {
        if (sx >= ptab.x && sx <= ptab.x + ptab.w && sy >= ptab.y && sy <= ptab.y + ptab.h) {
          this.switchPlanet(ptab.planet.id);
          return;
        }
      }

      const levelTabs = this._getLevelTabRects();
      for (const tab of levelTabs) {
        if (sx >= tab.x && sx <= tab.x + tab.w && sy >= tab.y && sy <= tab.y + tab.h) {
          this.loadLevel(tab.globalIndex);
          this.sound.playUiMove();
          return;
        }
      }

      const cards = this._getPilotCardRects();
      cards.forEach((card, idx) => {
        if (sx >= card.x && sx <= card.x + card.w && sy >= card.y && sy <= card.y + card.h) {
          this.selectedPilotIndex = idx;
          this.activePilot = PILOTS[idx];
          this.startGame();
        }
      });
    });
  }

  getPlanetIdForLevel(lvl) {
    return lvl.planetId || (lvl.planet === "Planet Shelin" ? "shelin" : "zoola");
  }

  getPlanetLevelEntries(planetId = this.selectedPlanetId) {
    return this.levels
      .map((lvl, globalIndex) => ({ lvl, globalIndex }))
      .filter((entry) => this.getPlanetIdForLevel(entry.lvl) === planetId);
  }

  switchPlanet(planetId) {
    const entries = this.getPlanetLevelEntries(planetId);
    if (!entries.length) return;
    this.selectedPlanetId = planetId;
    const firstIdx = entries[0].globalIndex;
    if (this.state === "SELECT_PILOT") {
      this.loadLevel(firstIdx);
      this.sound.playUiMove();
    } else {
      this.sound.playUiConfirm();
      this.beginLevelWithRoverArrival(firstIdx);
      this.ui.showToast(`🪐 ${this.currentLevel.planet} — ${this.currentLevel.name}`, 2200);
    }
  }

  _getPilotCardRects() {
    return [
      { id: "card-nova", pilot: PILOTS[0], x: 185, y: 176, w: 260, h: 228 },
      { id: "card-ion", pilot: PILOTS[1], x: 515, y: 176, w: 260, h: 228 },
    ];
  }

  _getPlanetTabRects() {
    return [];
  }

  _getLevelTabRects() {
    return [];
  }

  selectPilotByName(name) {
    const pilot = getPilotById(name);
    this.activePilot = pilot;
    this.selectedPilotIndex = PILOTS.indexOf(pilot);
    this._updatePilotPill();
  }

  _updatePilotPill() {
    if (!this.pilotPillEl) return;
    if (this.state === "SELECT_PILOT") {
      this.pilotPillEl.classList.add("hidden");
      return;
    }
    this.pilotPillEl.classList.remove("hidden", "nova", "ion");
    this.pilotPillEl.classList.add(this.activePilot.id.toLowerCase());
    this.pilotPillEl.textContent = this.activePilot.name;
  }

  startGame() {
    this.activePilot = PILOTS[this.selectedPilotIndex];
    this.score = 0;
    this.sound.playUiConfirm();
    this.beginLevelWithRoverArrival(0);
    this._updatePilotPill();
  }

  beginLevelWithRoverArrival(index) {
    this.loadLevel(index);
    this.state = "ROVER_ARRIVAL";
    this.roverArrivalTimer = 0;
    if (this.arrivalRover) {
      this.arrivalRover.x = this.arrivalRover.startX;
      this.arrivalRover.wheelSpin = 0;
      this.arrivalRover.pilotInside = true;
      this.arrivalRover.isDriving = true;
      this.arrivalRover.hopTriggered = false;
    }
    this.sound.playRoverArrive();
  }

  loadLevel(index) {
    this.currentLevelIndex = Math.max(0, Math.min(this.levels.length - 1, index));
    const lvl = this.levels[this.currentLevelIndex];
    this.currentLevel = lvl;
    this.selectedPlanetId = this.getPlanetIdForLevel(lvl);
    this.levelTimer = 0;

    this.player = this._createDefaultPlayer();
    this.player.x = lvl.spawn.x;
    this.player.y = lvl.spawn.y;

    this.platforms = lvl.platforms.map((p) => ({
      ...p,
      baseY: p.y,
      collapseState: "IDLE", // "IDLE" | "SHAKING" | "FALLING" | "GONE"
      shakeTimer: 0,
      shakeOffsetX: 0,
      fallVy: 0,
      respawnTimer: 0,
    }));
    this.trampolines = (lvl.trampolines || []).map((t) => ({
      ...t,
      boingTimer: 0,
    }));
    this.movingPlatforms = (lvl.movingPlatforms || []).map((m) => ({
      ...m,
      startX: m.x,
      startY: m.y,
      t: 0,
      dx: 0,
      dy: 0,
    }));
    this.hazards = (lvl.hazards || []).map((h) => ({
      ...h,
      isRumbling: false,
      isErupting: false,
      eruptHeight: 0,
      isWarning: false,
      isExtended: false,
      extendRatio: 0,
    }));
    this.iceBuckets = (lvl.iceBuckets || []).map((b) => ({
      ...b,
      tipAngle: 0,
      isWarning: false,
      hasIceInside: true,
    }));
    this.fallingIce = [];
    this.destructibles = (lvl.destructibles || []).map((d) => ({ ...d, maxHp: d.hp }));

    this.enemies = (lvl.enemies || []).map((e) => {
      const isBoss = this._isBossType(e.type);
      const isChaser = this._isChaserType(e.type);
      const isShooter = this._isShooterType(e.type);
      let w = 46;
      let h = 44;
      if (e.type === "snoolo_boss") {
        w = 184;
        h = 166;
      } else if (e.type === "giant_stalk_boss") {
        w = 170;
        h = 178;
      } else if (e.type === "squid_floater") {
        w = 58;
        h = 68;
      } else if (e.type === "triangle_ufo") {
        w = 52;
        h = 48;
      } else if (e.type === "kite_biter" || e.type === "chaser_kite") {
        w = 48;
        h = 54;
      } else if (e.type === "sun_wobbler") {
        w = 48;
        h = 48;
      } else if (e.type === "petal_urchin") {
        w = 44;
        h = 44;
      } else if (e.type === "stalk_alien") {
        w = 46;
        h = 48;
      } else if (isChaser) {
        w = 54;
        h = 52;
      } else if (isShooter) {
        w = 34;
        h = 44;
      }
      return {
        ...e,
        origX: e.x,
        origY: e.y,
        groundY: e.y,
        maxHp: e.hp,
        vx: isShooter ? 0 : e.speed,
        vy: 0,
        fireTimer: e.fireInterval || 2.0,
        hurtTimer: 0,
        jumpState: "PATROL",
        jumpTimer: e.jumpInterval || 2.35,
        crouchTimer: 0,
        jumpCount: 0,
        w: isBoss && e.w ? e.w : w,
        h: isBoss && e.h ? e.h : h,
      };
    });

    this.pickups = (lvl.pickups || []).map((c) => ({
      ...c,
      w: c.kind === "fuel" ? 30 : 26,
      h: c.kind === "fuel" ? 32 : 26,
      collected: false,
      respawnTimer: 0,
    }));

    const startGroundY = lvl.platforms[0] ? lvl.platforms[0].y : 460;
    const isShelin = this.getPlanetIdForLevel(lvl) === "shelin";
    const arrivalW = isShelin ? 98 : 112;
    const arrivalH = isShelin ? 62 : 70;
    this.arrivalRover = {
      id: "arrival-mars-rover",
      vehicle: isShelin ? "mars_bike" : "mars_rover",
      label: isShelin ? "Arrival Mars Bike" : "Arrival Mars Rover",
      startX: -124,
      parkedX: 14,
      x: 14,
      y: startGroundY - arrivalH,
      w: arrivalW,
      h: arrivalH,
      wheelSpin: 138,
      pilotInside: false,
      isDriving: false,
      hopTriggered: false,
    };
    this.roverArrivalTimer = 0;
    this.rocketLaunchTimer = 0;
    this.rocketLaunchOffsetY = 0;
    this.roverDriveOffsetX = 0;
    this.wormholeWarp = null;
    this.exitWormhole = null;
    this.wormholeWarpCount = 0;
    this.lasers = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.cameraX = 0;
  }

  _isBossType(type) {
    return type === "giant_stalk_boss" || type === "snoolo_boss";
  }

  _isChaserType(type) {
    return type === "chaser_chomper" || type === "chaser_kite";
  }

  _isShooterType(type) {
    return type === "triangle_ufo" || type === "squid_floater" || type === "turret";
  }

  isBossAlive() {
    return this.enemies.some((e) => this._isBossType(e.type) && e.hp > 0);
  }

  getActiveBoss() {
    return this.enemies.find((e) => this._isBossType(e.type) && e.hp > 0) || null;
  }

  getAllPlatforms() {
    const activeStatic = this.platforms.filter(
      (p) => p.collapseState !== "FALLING" && p.collapseState !== "GONE"
    );
    const solidGates = this.destructibles
      .filter((d) => d.hp > 0)
      .map((d) => ({ id: d.id, label: d.label, x: d.x, y: d.y, w: d.w, h: d.h, dx: 0, dy: 0 }));
    return [...activeStatic, ...this.movingPlatforms, ...solidGates];
  }

  getSnapshotMetadata() {
    return {
      screenState: this.state,
      pilot: this.activePilot.name,
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      hp: this.player.hp,
      fuel: Math.round(this.player.fuel),
      score: this.score,
    };
  }

  getInspectableTargets() {
    if (this.state === "SELECT_PILOT") {
      const cards = this._getPilotCardRects();
      const planetTabs = this._getPlanetTabRects().map((pt) => ({
        id: `planet-tab-${pt.planet.id}`,
        type: "ui_planet_tab",
        label: `Planet Tab: ${pt.planet.name}`,
        screenX: pt.x,
        screenY: pt.y,
        w: pt.w,
        h: pt.h,
      }));
      const levelTabs = this._getLevelTabRects().map((t) => ({
        id: `level-tab-${t.localIdx + 1}`,
        type: "ui_level_tab",
        label: `Level Tab: ${t.lvl.name}`,
        screenX: t.x,
        screenY: t.y,
        w: t.w,
        h: t.h,
      }));
      return [
        {
          id: "pilot-card-nova",
          type: "ui_card",
          label: "Pilot Card: Starlight Nova Pilot",
          screenX: cards[0].x,
          screenY: cards[0].y,
          w: cards[0].w,
          h: cards[0].h,
        },
        {
          id: "pilot-card-ion",
          type: "ui_card",
          label: "Pilot Card: Turbo Ion Commander",
          screenX: cards[1].x,
          screenY: cards[1].y,
          w: cards[1].w,
          h: cards[1].h,
        },
        ...planetTabs,
        ...levelTabs,
        {
          id: "title-banner",
          type: "ui_header",
          label: "Jet Laser Title Logo",
          screenX: 270,
          screenY: 42,
          w: 420,
          h: 95,
        },
      ];
    }

    const targets = [];
    const camX = this.cameraX;
    const inView = (wx, wy, w, h) => wx + w > camX + 4 && wx < camX + this.width - 4 && wy + h > 0 && wy < this.height;

    targets.push({
      id: `pilot-${this.activePilot.id.toLowerCase()}`,
      type: "player",
      label: `Pilot: ${this.activePilot.name}`,
      screenX: this.player.x - camX,
      screenY: this.player.y,
      w: this.player.w,
      h: this.player.h,
      worldX: this.player.x + this.player.w / 2,
      worldY: this.player.y + this.player.h / 2,
    });

    this.enemies.forEach((e) => {
      if (e.hp > 0 && inView(e.x, e.y, e.w, e.h)) {
        targets.push({
          id: e.id,
          type: `enemy_${e.type}`,
          label: e.label,
          screenX: e.x - camX,
          screenY: e.y,
          w: e.w,
          h: e.h,
          worldX: e.x + e.w / 2,
          worldY: e.y + e.h / 2,
        });
      }
    });

    this.trampolines.forEach((t) => {
      const extraY = t.style === "catapult" ? 12 : 0;
      if (inView(t.x, t.y - extraY, t.w, t.h + extraY)) {
        targets.push({
          id: t.id,
          type: t.style === "catapult" ? "catapult" : "trampoline",
          label: t.label,
          screenX: t.x - camX,
          screenY: t.y - extraY,
          w: t.w,
          h: t.h + extraY,
          worldX: t.x + t.w / 2,
          worldY: t.y + t.h / 2,
        });
      }
    });

    this.destructibles.forEach((d) => {
      if (d.hp > 0 && inView(d.x, d.y, d.w, d.h)) {
        targets.push({
          id: d.id,
          type: "destructible",
          label: d.label,
          screenX: d.x - camX,
          screenY: d.y,
          w: d.w,
          h: d.h,
          worldX: d.x + d.w / 2,
          worldY: d.y + d.h / 2,
        });
      }
    });

    this.pickups.forEach((c) => {
      if (!c.collected && inView(c.x, c.y, c.w, c.h)) {
        targets.push({
          id: c.id,
          type: `pickup_${c.kind}`,
          label: c.label,
          screenX: c.x - camX,
          screenY: c.y,
          w: c.w,
          h: c.h,
          worldX: c.x + c.w / 2,
          worldY: c.y + c.h / 2,
        });
      }
    });

    const g = this.currentLevel.goal;
    if (g && inView(g.x, g.y, g.w, g.h)) {
      targets.push({
        id: g.id,
        type: "goal_portal",
        label: g.label,
        screenX: g.x - camX,
        screenY: g.y,
        w: g.w,
        h: g.h,
        worldX: g.x + g.w / 2,
        worldY: g.y + g.h / 2,
      });
    }

    const ar = this.arrivalRover;
    if (ar && inView(ar.x, ar.y, ar.w, ar.h)) {
      targets.push({
        id: ar.id,
        type: "arrival_rover",
        label: ar.label,
        screenX: ar.x - camX,
        screenY: ar.y,
        w: ar.w,
        h: ar.h,
        worldX: ar.x + ar.w / 2,
        worldY: ar.y + ar.h / 2,
      });
    }

    this.movingPlatforms.forEach((m) => {
      if (inView(m.x, m.y, m.w, m.h)) {
        targets.push({
          id: m.id,
          type: "moving_platform",
          label: m.label,
          screenX: m.x - camX,
          screenY: m.y,
          w: m.w,
          h: m.h,
          worldX: m.x + m.w / 2,
          worldY: m.y + m.h / 2,
        });
      }
    });

    this.hazards.forEach((h) => {
      if (inView(h.x, h.y, h.w, h.h)) {
        targets.push({
          id: h.id,
          type: "hazard",
          label: h.label,
          screenX: h.x - camX,
          screenY: h.y,
          w: h.w,
          h: h.h,
          worldX: h.x + h.w / 2,
          worldY: h.y,
        });
      }
    });

    this.iceBuckets.forEach((b) => {
      if (inView(b.x - 30, b.y - 34, 60, 66)) {
        targets.push({
          id: b.id,
          type: "ice_bucket",
          label: b.label,
          screenX: b.x - 30 - camX,
          screenY: b.y - 34,
          w: 60,
          h: 66,
          worldX: b.x,
          worldY: b.y,
        });
      }
    });

    this.platforms.forEach((p) => {
      if (p.collapseState !== "GONE" && inView(p.x, p.y, p.w, p.h)) {
        const clampedX = Math.max(0, p.x - camX);
        const clampedRight = Math.min(this.width, p.x + p.w - camX);
        targets.push({
          id: p.id,
          type: "platform",
          label: p.label,
          screenX: clampedX,
          screenY: p.y,
          w: Math.max(24, clampedRight - clampedX),
          h: Math.min(p.h, this.height - p.y),
          worldX: clampedX + (clampedRight - clampedX) / 2 + camX,
          worldY: p.y + 12,
        });
      }
    });

    targets.push({
      id: "hud-status",
      type: "hud",
      label: "HUD: Health & Jetpack Fuel Bar",
      screenX: 16,
      screenY: 14,
      w: 255,
      h: 58,
      worldX: camX + 140,
      worldY: 42,
    });

    return targets;
  }

  update(dt, nowMs) {
    this.timeSec += dt;

    if (this.input.wasPressed("KeyM")) {
      const muted = this.sound.toggleMute();
      this.ui.showToast(muted ? "Sound: Muted" : "Sound: On", 1400);
    }

    if (this.input.wasPressed("KeyO") && this.state !== "SELECT_PILOT") {
      this.state = "SELECT_PILOT";
      this._updatePilotPill();
      this.sound.playUiMove();
      return;
    }

    if (this.state === "SELECT_PILOT") {
      if (this.input.wasPressed("ArrowLeft", "KeyA")) {
        this.selectedPilotIndex = (this.selectedPilotIndex - 1 + PILOTS.length) % PILOTS.length;
        this.activePilot = PILOTS[this.selectedPilotIndex];
        this.sound.playUiMove();
      } else if (this.input.wasPressed("ArrowRight", "KeyD")) {
        this.selectedPilotIndex = (this.selectedPilotIndex + 1) % PILOTS.length;
        this.activePilot = PILOTS[this.selectedPilotIndex];
        this.sound.playUiMove();
      } else if (this.input.wasPressed("Enter", "Space")) {
        this.startGame();
      }
      return;
    }

    if (this.input.wasPressed("KeyR")) {
      this.beginLevelWithRoverArrival(this.currentLevelIndex);
      this.ui.showToast("Level Restarted!", 1300);
      return;
    }

    if (this.state === "LEVEL_COMPLETE") {
      if (this.input.wasPressed("Enter", "Space")) {
        const nextIdx =
          this.currentLevelIndex < this.levels.length - 1 ? this.currentLevelIndex + 1 : 0;
        this.sound.playUiConfirm();
        this.beginLevelWithRoverArrival(nextIdx);
        this.ui.showToast(`🪐 ${this.currentLevel.name}`, 2000);
      }
      return;
    }

    if (this.state === "GAME_OVER") {
      if (this.input.wasPressed("Enter", "Space")) {
        this.sound.playUiConfirm();
        this.beginLevelWithRoverArrival(this.currentLevelIndex);
      }
      return;
    }

    if (this.state === "ROVER_ARRIVAL") {
      this._updateRoverArrival(dt);
      return;
    }

    if (this.state === "ROCKET_LIFTOFF") {
      this._updateRocketLiftoff(dt);
      return;
    }

    if (this.state === "WORMHOLE_WARP") {
      this._updateWormholeWarp(dt);
      return;
    }

    // --- PLAYING STATE ---
    const prevLevelTimer = this.levelTimer;
    this.levelTimer += dt;
    if (this.exitWormhole) {
      this.exitWormhole.life -= dt;
      if (this.exitWormhole.life <= 0) {
        this.exitWormhole = null;
      }
    }

    this._updateCollapsingPlatforms(dt);
    this._updateMovingPlatforms(dt);
    this._updateHazards(dt, prevLevelTimer);
    this._updateIceBuckets(dt, prevLevelTimer);
    this._updateTrampolines(dt);
    this._updatePlayer(dt, nowMs);
    this._updateLasers(dt);
    this._updateEnemies(dt);
    this._updateEnemyProjectiles(dt);
    this._updatePickups(dt);
    this._updateParticles(dt);
    this._checkGoal();

    // Smooth lookahead camera
    const targetCam = this.player.x - this.width * 0.36 + this.player.facing * 55;
    const maxCam = Math.max(0, this.currentLevel.width - this.width);
    const clampedTarget = Math.max(0, Math.min(maxCam, targetCam));
    this.cameraX += (clampedTarget - this.cameraX) * Math.min(1, dt * 7.5);
  }

  _updateCollapsingPlatforms(dt) {
    this.platforms.forEach((p) => {
      if (!p.collapseAfterSec) return;

      if (p.collapseState === "SHAKING") {
        p.shakeTimer -= dt;
        const urgency = p.shakeTimer < 1.5 ? 4.5 : 2.5;
        p.shakeOffsetX = Math.sin(this.timeSec * 48) * urgency;

        if (Math.random() < 0.25) {
          this.particles.push({
            x: p.x + Math.random() * p.w,
            y: p.y + p.h,
            vx: (Math.random() - 0.5) * 25,
            vy: 45 + Math.random() * 55,
            life: 0.35,
            maxLife: 0.35,
            size: 2.5,
            color: "#f59e0b",
          });
        }

        if (p.shakeTimer <= 0) {
          p.collapseState = "FALLING";
          p.shakeOffsetX = 0;
          p.fallVy = 90;
          this.sound.playPlatformCollapse();
          this._spawnBurst(p.x + p.w / 2, p.y + p.h / 2, "#f59e0b", 14);
        }
      } else if (p.collapseState === "FALLING") {
        p.fallVy += 780 * dt;
        p.y += p.fallVy * dt;
        if (p.y > this.height + 90) {
          p.collapseState = "GONE";
          p.respawnTimer = 5.5;
        }
      } else if (p.collapseState === "GONE") {
        p.respawnTimer -= dt;
        if (p.respawnTimer <= 0) {
          p.y = p.baseY;
          p.fallVy = 0;
          p.collapseState = "IDLE";
          this._spawnBurst(p.x + p.w / 2, p.y + 10, "#fde047", 10);
        }
      }
    });
  }

  _updateMovingPlatforms(dt) {
    this.movingPlatforms.forEach((m) => {
      const prevX = m.x;
      const prevY = m.y;
      m.t += dt * m.speed;
      const alpha = 0.5 - 0.5 * Math.cos(m.t);
      m.x = m.startX + (m.endX - m.startX) * alpha;
      m.y = m.startY + (m.endY - m.startY) * alpha;
      m.dx = m.x - prevX;
      m.dy = m.y - prevY;
    });
  }

  _updateHazards(_dt, prevTimer) {
    let anyJustBoomedOnScreen = false;
    let anySpikesPoppedOnScreen = false;

    this.hazards.forEach((h) => {
      if (h.kind === "popup_spikes") {
        const period = h.period || 5;
        const prevCycle = prevTimer % period;
        const cycle = this.levelTimer % period;
        const warnStart = period - 2.15; // 2.85s
        const popStart = period - 1.4; // 3.60s
        const retractStart = period - 0.24; // 4.76s

        if (cycle < warnStart) {
          h.isWarning = false;
          h.isExtended = false;
          h.extendRatio = 0;
        } else if (cycle < popStart) {
          h.isWarning = true;
          h.isExtended = false;
          h.extendRatio = 0.22;
        } else {
          h.isWarning = false;
          h.isExtended = true;
          if (cycle < popStart + 0.14) {
            h.extendRatio = 0.22 + 0.78 * ((cycle - popStart) / 0.14);
          } else if (cycle < retractStart) {
            h.extendRatio = 1;
          } else {
            h.extendRatio = Math.max(0, 1 - (cycle - retractStart) / 0.24);
          }
          if (prevCycle < popStart && cycle >= popStart) {
            if (h.x + h.w > this.cameraX - 80 && h.x < this.cameraX + this.width + 80) {
              anySpikesPoppedOnScreen = true;
              this._spawnBurst(h.x + h.w / 2, h.y + h.h - 10, "#38bdf8", 10);
            }
          }
        }
        return;
      }

      if (h.kind === "wormhole" || h.kind === "hole" || !h.erupts) return;
      const period = h.eruptPeriod || 10;
      const prevCycle = prevTimer % period;
      const cycle = this.levelTimer % period;

      // Warning rumble from 7.6s..8.85s, BOOM eruption from 8.85s..10.0s!
      const boomStart = period - 1.15;
      const rumbleStart = period - 2.5;

      h.isRumbling = cycle >= rumbleStart && cycle < boomStart;
      h.isErupting = cycle >= boomStart;

      if (h.isErupting) {
        const progress = (cycle - boomStart) / 1.15; // 0..1
        const arch = Math.sin(progress * Math.PI);
        h.eruptHeight = 205 * Math.min(1, arch * 1.35);

        if (prevCycle < boomStart && cycle >= boomStart) {
          if (h.x + h.w > this.cameraX - 80 && h.x < this.cameraX + this.width + 80) {
            anyJustBoomedOnScreen = true;
            this._spawnBurst(h.x + h.w / 2, h.y - 40, "#f97316", 20);
          }
        }
      } else {
        h.eruptHeight = 0;
      }
    });

    if (anyJustBoomedOnScreen) {
      this.sound.playLavaBoom();
    }
    if (anySpikesPoppedOnScreen) {
      this.sound.playSpikesPop();
    }
  }

  _updateIceBuckets(dt, prevTimer) {
    const p = this.player;
    this.iceBuckets.forEach((b) => {
      const period = b.period || 5;
      const prevCycle = prevTimer % period;
      const cycle = this.levelTimer % period;
      const warnStart = period - 1.15;
      const tipStart = period - 0.55;
      const dumpMoment = period - 0.45;

      if (cycle < warnStart) {
        b.tipAngle = 0;
        b.isWarning = false;
        b.hasIceInside = true;
      } else if (cycle < tipStart) {
        b.tipAngle = Math.sin(this.timeSec * 38) * 0.11;
        b.isWarning = true;
        b.hasIceInside = true;
      } else {
        const u = Math.min(1, (cycle - tipStart) / 0.55);
        b.tipAngle = Math.sin(u * Math.PI) * 2.05;
        b.isWarning = false;
        b.hasIceInside = u < 0.24;

        if (prevCycle < dumpMoment && cycle >= dumpMoment) {
          [-22, -13, -4, 5, 14, 23].forEach((ox, idx) => {
            this.fallingIce.push({
              x: b.x + ox,
              y: b.y + 18 + (idx % 2) * 5,
              vx: ox * 0.35,
              vy: 85 + idx * 14,
              size: 16,
              rot: idx * 0.45,
              vrot: (idx % 2 === 0 ? 1 : -1) * 5.2,
            });
          });
          if (b.x > this.cameraX - 100 && b.x < this.cameraX + this.width + 100) {
            this.sound.playIceBucketTip();
            this._spawnBurst(b.x, b.y + 14, "#bae6fd", 12);
          }
        }
      }
    });

    const groundFloors = this.platforms.filter(
      (s) => s.h >= 60 && s.collapseState !== "FALLING" && s.collapseState !== "GONE"
    );

    for (let i = this.fallingIce.length - 1; i >= 0; i--) {
      const ic = this.fallingIce[i];
      ic.vy = Math.min(540, ic.vy + 560 * dt);
      ic.x += ic.vx * dt;
      ic.y += ic.vy * dt;
      ic.rot += ic.vrot * dt;

      if (
        rectsOverlap(
          p.x + 2,
          p.y + 2,
          p.w - 4,
          p.h - 4,
          ic.x - ic.size / 2,
          ic.y - ic.size / 2,
          ic.size,
          ic.size
        )
      ) {
        this.fallingIce.splice(i, 1);
        this._spawnBurst(ic.x, ic.y, "#67e8f9", 10);
        if (p.frozenHitsLeft === 0 && p.freezeImmuneTimer <= 0) {
          p.frozenHitsLeft = 5;
          p.freezeShakeTimer = 0.25;
          p.vx = 0;
          p.jetting = false;
          this.sound.playIceFreeze();
          this._spawnBurst(p.x + p.w / 2, p.y + p.h / 2, "#bae6fd", 18);
          this.ui.showToast("🥶 FROZEN IN ICE! Hit SPACE 5 times to break free!", 2400);
        }
        continue;
      }

      const hitMainGround = groundFloors.some((s) =>
        rectsOverlap(ic.x - ic.size / 2, ic.y - ic.size / 2, ic.size, ic.size, s.x, s.y, s.w, s.h)
      );
      if (hitMainGround || ic.y > this.height + 24) {
        this._spawnBurst(ic.x, ic.y, "#e0f2fe", 5);
        this.fallingIce.splice(i, 1);
      }
    }
  }

  _hitFrozenIceBlock() {
    const p = this.player;
    if (!p || p.frozenHitsLeft <= 0) return;
    p.frozenHitsLeft = Math.max(0, p.frozenHitsLeft - 1);
    p.freezeShakeTimer = 0.2;
    this.sound.playIceCrack(p.frozenHitsLeft);
    this._spawnBurst(p.x + p.w / 2, p.y + p.h / 2, "#bae6fd", p.frozenHitsLeft === 0 ? 24 : 9);
    if (p.frozenHitsLeft === 0) {
      p.freezeImmuneTimer = 1.6;
      p.vy = -175;
      p.onGround = false;
      this._spawnBurst(p.x + p.w / 2, p.y + p.h / 2, "#ffffff", 16);
      this.ui.showToast("💥 ICE SHATTERED! You're free!", 1400);
    }
  }

  _updateTrampolines(dt) {
    this.trampolines.forEach((t) => {
      if (t.boingTimer > 0) {
        t.boingTimer = Math.max(0, t.boingTimer - dt);
      }
    });
  }

  _updatePlayer(dt, nowMs) {
    const p = this.player;
    const moveSpeed = 248;
    const gravity = 820;
    const jetAccel = 1280;
    const maxFall = 480;
    const maxRise = -330;

    if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    if (p.fireCooldown > 0) p.fireCooldown = Math.max(0, p.fireCooldown - dt);
    if (p.freezeShakeTimer > 0) p.freezeShakeTimer = Math.max(0, p.freezeShakeTimer - dt);
    if (p.freezeImmuneTimer > 0) p.freezeImmuneTimer = Math.max(0, p.freezeImmuneTimer - dt);

    if (p.frozenHitsLeft > 0) {
      p.vx = 0;
      p.catapultVx = 0;
      p.jetting = false;
      p.walkPhase = 0;
      if (
        this.input.wasPressed(
          "Space",
          "KeyZ",
          "KeyJ",
          "Enter",
          "ArrowUp",
          "KeyW",
          "ArrowLeft",
          "KeyA",
          "ArrowRight",
          "KeyD"
        )
      ) {
        this._hitFrozenIceBlock();
      }
      if (p.frozenHitsLeft > 0) {
        p.vy = Math.min(maxFall, p.vy + gravity * dt);
        p.y += p.vy * dt;
        p.onGround = false;
        const solidsWhileFrozen = this.getAllPlatforms();
        for (const s of solidsWhileFrozen) {
          if (rectsOverlap(p.x, p.y, p.w, p.h, s.x, s.y, s.w, s.h) && p.vy >= 0) {
            p.y = s.y - p.h;
            p.vy = 0;
            p.onGround = true;
          }
        }
        return;
      }
    }

    if (this.input.moveLeft && !this.input.moveRight) {
      p.vx = -moveSpeed;
      p.facing = -1;
      if (p.onGround) p.walkPhase += dt * 14;
    } else if (this.input.moveRight && !this.input.moveLeft) {
      p.vx = moveSpeed;
      p.facing = 1;
      if (p.onGround) p.walkPhase += dt * 14;
    } else {
      p.vx *= Math.pow(0.001, dt);
      if (Math.abs(p.vx) < 6) p.vx = 0;
      p.walkPhase = 0;
    }

    p.jetting = false;
    if (this.input.jetpackJustTapped && p.onGround) {
      p.vy = -335;
      p.onGround = false;
    }

    if (this.input.jetpackUp && p.fuel > 0) {
      // Don't cap upward bounce speed if Super Trampoline launched pilot faster than maxRise!
      if (p.vy > maxRise) {
        p.vy = Math.max(maxRise, p.vy - jetAccel * dt);
      }
      p.fuel = Math.max(0, p.fuel - 19 * dt);
      p.jetting = true;
      p.onGround = false;
      this.sound.playJetThrust(nowMs);

      if (Math.random() < 0.75) {
        this.particles.push({
          x: p.x + (p.facing === 1 ? 4 : p.w - 4),
          y: p.y + p.h - 4,
          vx: -p.facing * (25 + Math.random() * 40) + (Math.random() - 0.5) * 30,
          vy: 90 + Math.random() * 90,
          life: 0.24 + Math.random() * 0.14,
          maxLife: 0.38,
          size: 3 + Math.random() * 3,
          color: Math.random() < 0.5 ? this.activePilot.jetOuter : this.activePilot.jetInner,
        });
      }
    }

    if (p.catapultVx > 0) {
      if (this.input.moveLeft && !this.input.moveRight) {
        p.catapultVx = Math.max(0, p.catapultVx - 560 * dt);
      } else if (!p.onGround) {
        p.catapultVx = Math.max(0, p.catapultVx - 32 * dt);
      } else {
        p.catapultVx = 0;
      }
    }

    p.vy = Math.min(maxFall, p.vy + gravity * dt);

    const solids = this.getAllPlatforms();

    // Horizontal move & collision (includes Crater Catapult forward fling!)
    const moveVx =
      p.catapultVx > 0
        ? Math.max(p.vx, p.catapultVx + (this.input.moveRight ? 42 : 0))
        : p.vx;
    p.x += moveVx * dt;
    p.x = Math.max(0, Math.min(this.currentLevel.width - p.w, p.x));
    for (const s of solids) {
      if (rectsOverlap(p.x, p.y, p.w, p.h, s.x, s.y, s.w, s.h)) {
        if (moveVx > 0) p.x = s.x - p.w;
        else if (moveVx < 0) p.x = s.x + s.w;
        p.vx = 0;
        p.catapultVx = 0;
      }
    }

    // Vertical move & collision
    p.y += p.vy * dt;
    p.onGround = false;
    if (p.y < 8) {
      p.y = 8;
      if (p.vy < 0) p.vy = 0;
    }

    for (const s of solids) {
      if (rectsOverlap(p.x, p.y, p.w, p.h, s.x, s.y, s.w, s.h)) {
        if (p.vy >= 0) {
          p.y = s.y - p.h;
          p.vy = 0;
          p.catapultVx = 0;
          p.onGround = true;
          if (s.dx) {
            p.x = Math.max(0, Math.min(this.currentLevel.width - p.w, p.x + s.dx));
          }
          // Trigger shaking countdown on collapsible platforms!
          if (s.collapseAfterSec && s.collapseState === "IDLE") {
            s.collapseState = "SHAKING";
            s.shakeTimer = s.collapseAfterSec;
          }
        } else {
          p.y = s.y + s.h;
          p.vy = 0;
        }
      }
    }

    // Super Trampoline & Crater Catapult check!
    for (const t of this.trampolines) {
      if (p.vy >= -60 && rectsOverlap(p.x + 2, p.y + p.h - 16, p.w - 4, 18, t.x, t.y, t.w, t.h)) {
        p.y = t.y - p.h;
        p.vy = t.bounceVy || -660;
        p.onGround = false;
        if (t.style === "catapult") {
          p.catapultVx = t.bounceVx || 285;
          p.facing = 1;
          t.boingTimer = 0.48;
          this.sound.playCatapultFling();
          this._spawnBurst(t.x + 26, t.y + 8, "#fde047", 18);
          this._spawnBurst(t.x + 36, t.y + 4, "#fb923c", 12);
        } else {
          t.boingTimer = 0.45;
          this.sound.playBoing();
          this._spawnBurst(t.x + t.w / 2, t.y, "#fde047", 16);
        }
      }
    }

    // Laser firing
    if (this.input.fireLaser && p.fireCooldown <= 0) {
      p.fireCooldown = 0.18;
      const boltX = p.facing === 1 ? p.x + p.w + 2 : p.x - 22;
      const boltY = p.y + 18;
      this.lasers.push({
        x: boltX,
        y: boltY,
        w: 22,
        h: 5,
        vx: p.facing * 690,
        color: this.activePilot.laserColor,
        core: this.activePilot.laserCore,
        life: 0.95,
      });
      this.sound.playLaser();
    }

    // Hazard pits, pop-up ground spikes, swirling wormholes & active 10-second erupting lava geysers!
    for (const h of this.hazards) {
      if (h.kind === "popup_spikes") {
        if ((h.extendRatio || 0) > 0.42) {
          const activeH = h.h * h.extendRatio;
          const spikeTopY = h.y + h.h - activeH;
          if (
            rectsOverlap(
              p.x + 4,
              p.y + 4,
              p.w - 8,
              p.h - 4,
              h.x + 6,
              spikeTopY + 4,
              Math.max(16, h.w - 12),
              Math.max(8, activeH - 4)
            )
          ) {
            p.catapultVx = 0;
            this._damagePlayer(1, true);
            return;
          }
        }
        continue;
      }

      if (h.kind === "hole") {
        continue;
      }

      if (h.kind === "wormhole") {
        if (
          rectsOverlap(
            p.x + 4,
            p.y + 6,
            p.w - 8,
            p.h - 6,
            h.x + 10,
            h.y + 16,
            Math.max(16, h.w - 20),
            Math.max(14, h.h - 16)
          )
        ) {
          this._triggerWormholeWarp(h);
          return;
        }
        continue;
      }

      const topY = h.isErupting ? h.y - h.eruptHeight : h.y;
      const hitH = h.isErupting ? h.h + h.eruptHeight : h.h;
      const padX = h.isErupting ? 8 : 0;
      if (rectsOverlap(p.x, p.y, p.w, p.h, h.x + padX, topY, Math.max(16, h.w - padX * 2), hitH)) {
        this._damagePlayer(1, true);
        return;
      }
    }
    if (p.y > this.height + 30) {
      this._damagePlayer(1, true);
    }
  }

  _triggerWormholeWarp(h) {
    const p = this.player;
    const destX = this.currentLevel.spawn.x;
    const destY = this.currentLevel.spawn.y;
    this.state = "WORMHOLE_WARP";
    this.wormholeWarpCount = (this.wormholeWarpCount || 0) + 1;
    this.wormholeWarp = {
      timer: 0,
      inDur: 0.28,
      totalDur: 0.58,
      fromX: p.x,
      fromY: p.y,
      holeCenterX: h.x + h.w / 2,
      holeCenterY: h.y + h.h / 2,
      destX,
      destY,
      pilotScale: 1,
      pilotSpin: 0,
      arrivedAtStart: false,
    };
    p.vx = 0;
    p.vy = 0;
    p.jetting = false;
    p.frozenHitsLeft = 0;
    this.sound.playWormholeWarp();
    this._spawnBurst(h.x + h.w / 2, h.y + 14, "#22d3ee", 18);
    this._spawnBurst(h.x + h.w / 2, h.y + 20, "#a855f7", 16);
  }

  _updateWormholeWarp(dt) {
    const w = this.wormholeWarp;
    if (!w) {
      this.state = "PLAYING";
      return;
    }
    w.timer += dt;
    this._updateParticles(dt);

    if (w.timer < w.inDur) {
      const u = Math.min(1, w.timer / w.inDur);
      this.player.x = w.fromX + (w.holeCenterX - this.player.w / 2 - w.fromX) * u;
      this.player.y = w.fromY + (w.holeCenterY - this.player.h / 2 - w.fromY) * u;
      w.pilotScale = Math.max(0.14, 1 - u * 0.86);
      w.pilotSpin = u * Math.PI * 3;
      return;
    }

    if (!w.arrivedAtStart) {
      w.arrivedAtStart = true;
      // Reset relentless chaser aliens back behind start so they don't spawn-camp the warped pilot!
      this.enemies.forEach((e) => {
        if (this._isChaserType(e.type) && typeof e.origX === "number") {
          e.x = e.origX;
          e.y = e.origY;
          e.vx = e.speed;
          e.vy = 0;
        }
      });
      this.enemyProjectiles = this.enemyProjectiles.filter((ep) => ep.x > w.holeCenterX);
      // Reset any shaking/fallen platforms before the pit & restore jetpack fuel so start is fresh!
      this.platforms.forEach((plat) => {
        if (plat.collapseAfterSec && plat.x < w.holeCenterX) {
          plat.y = plat.baseY;
          plat.collapseState = "IDLE";
          plat.shakeTimer = 0;
          plat.shakeOffsetX = 0;
          plat.fallVy = 0;
        }
      });
      this.player.fuel = this.player.maxFuel;
      this.exitWormhole = {
        x: w.destX + this.player.w / 2 - 36,
        y: w.destY - 48,
        w: 72,
        h: 48,
        life: 0.55,
        maxLife: 0.55,
      };
      this._spawnBurst(w.destX + this.player.w / 2, w.destY - 18, "#22d3ee", 18);
      this._spawnBurst(w.destX + this.player.w / 2, w.destY - 12, "#f472b6", 14);
      this.ui.showToast("🌀 WORMHOLE! Warped back to the start!", 2400);
    }

    const u2 = Math.min(1, (w.timer - w.inDur) / (w.totalDur - w.inDur));
    this.cameraX *= Math.pow(0.0002, dt);
    if (u2 > 0.65) this.cameraX = 0;

    this.player.x = w.destX;
    this.player.y = w.destY - 26 + 26 * u2 - Math.sin(u2 * Math.PI) * 14;
    this.player.facing = 1;
    w.pilotScale = 0.16 + 0.84 * u2;
    w.pilotSpin = (1 - u2) * Math.PI * 2.5;

    if (w.timer >= w.totalDur) {
      this.player.x = w.destX;
      this.player.y = w.destY;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.onGround = true;
      this.player.jetting = false;
      this.player.invulnTimer = Math.max(this.player.invulnTimer, 0.85);
      this.cameraX = 0;
      this.wormholeWarp = null;
      this.state = "PLAYING";
    }
  }

  _damagePlayer(amount, bounceUp = false) {
    const p = this.player;
    if (p.invulnTimer > 0) return;
    p.hp = Math.max(0, p.hp - amount);
    p.invulnTimer = 1.15;
    this.sound.playPlayerHurt();
    this._spawnBurst(p.x + p.w / 2, p.y + p.h / 2, "#fb7185", 14);

    if (bounceUp) {
      p.vy = -415;
      p.y = Math.min(p.y, this.height - 110);
    }

    if (p.hp <= 0) {
      this.state = "GAME_OVER";
    }
  }

  _updateLasers(dt) {
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const b = this.lasers[i];
      b.x += b.vx * dt;
      b.life -= dt;
      let hit = false;

      // Hit destructible barriers
      for (const d of this.destructibles) {
        if (d.hp > 0 && rectsOverlap(b.x, b.y, b.w, b.h, d.x, d.y, d.w, d.h)) {
          d.hp -= 1;
          hit = true;
          this.sound.playEnemyHit();
          this._spawnBurst(b.x, b.y, d.color, 10);
          if (d.hp <= 0) {
            this.score += 150;
            this._spawnBurst(d.x + d.w / 2, d.y + d.h / 2, "#fde047", 22);
          }
          break;
        }
      }

      // Hit enemies & Boss!
      if (!hit) {
        for (const e of this.enemies) {
          if (e.hp > 0 && rectsOverlap(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
            hit = true;
            this.sound.playEnemyHit();

            if (this._isChaserType(e.type)) {
              // Knock back the relentless Chaser Alien to buy breathing room!
              e.x -= 58;
              e.hurtTimer = 0.18;
              this._spawnBurst(b.x, b.y, "#ec4899", 12);
            } else {
              e.hp -= 1;
              e.hurtTimer = 0.14;
              this._spawnBurst(b.x, b.y, "#38bdf8", 10);
              if (e.hp <= 0) {
                if (this._isBossType(e.type)) {
                  this.score += 1500;
                  this.sound.playPortalWin();
                  this._spawnBurst(e.x + e.w / 2, e.y + e.h / 2, "#fde047", 42);
                  this._spawnBurst(e.x + e.w / 2, e.y + e.h / 2, "#a855f7", 30);
                  this.ui.showToast(`🎉 ${e.label.toUpperCase()} DEFEATED! Escape Rocket Unlocked!`, 3600);
                } else {
                  this.score += 200;
                  this._spawnBurst(e.x + e.w / 2, e.y + e.h / 2, "#facc15", 24);
                }
              }
            }
            break;
          }
        }
      }

      // Zap enemy plasma balls mid-air!
      if (!hit) {
        for (let j = this.enemyProjectiles.length - 1; j >= 0; j--) {
          const ep = this.enemyProjectiles[j];
          if (rectsOverlap(b.x, b.y - 4, b.w, b.h + 8, ep.x - 7, ep.y - 7, 14, 14)) {
            this.enemyProjectiles.splice(j, 1);
            hit = true;
            this._spawnBurst(ep.x, ep.y, "#c084fc", 8);
            break;
          }
        }
      }

      // Hit active walls
      if (!hit) {
        const activeWalls = [
          ...this.platforms.filter((p) => p.collapseState !== "FALLING" && p.collapseState !== "GONE"),
          ...this.movingPlatforms,
        ];
        for (const s of activeWalls) {
          if (rectsOverlap(b.x, b.y, b.w, b.h, s.x, s.y, s.w, s.h)) {
            hit = true;
            this._spawnBurst(b.x, b.y, b.color, 5);
            break;
          }
        }
      }

      if (hit || b.life <= 0 || b.x < -100 || b.x > this.currentLevel.width) {
        this.lasers.splice(i, 1);
      }
    }
  }

  _updateEnemies(dt) {
    const p = this.player;
    this.enemies.forEach((e) => {
      if (e.hp <= 0) return;
      if (e.hurtTimer > 0) e.hurtTimer = Math.max(0, e.hurtTimer - dt);

      if (this._isChaserType(e.type)) {
        // Relentlessly chases player from the start until Boss Arena or final vehicle depot!
        const hasBoss = this.enemies.some((x) => this._isBossType(x.type));
        const chaseStopX = hasBoss ? 2080 : this.currentLevel.goal.x - 160;
        if (this.levelTimer > 0.8 && p.x < chaseStopX) {
          const dx = p.x - (e.x + e.w / 2);
          const dy = p.y - 6 - (e.y + e.h / 2);
          const dist = Math.hypot(dx, dy) || 1;
          e.vx = (dx / dist) * e.speed;
          e.vy = (dy / dist) * (e.speed * 0.72);
          e.x += e.vx * dt;
          e.y += e.vy * dt;
        } else if (p.x >= chaseStopX && e.x > chaseStopX - 160) {
          e.x = chaseStopX - 160;
          e.vx = 0;
        }
      } else if (this._isBossType(e.type)) {
        // Giant Boss (Kaligater patrols; Snoolo actively chases AND pounces into the air to get you!)
        const bossCenterX = e.x + e.w / 2;
        const playerCenterX = p.x + p.w / 2;
        const dxToPlayer = playerCenterX - bossCenterX;
        const dist = Math.abs(dxToPlayer);

        if (e.jumps) {
          const inArena = p.x >= 2065 && dist < 820;
          if (e.jumpState === "CROUCH") {
            e.crouchTimer -= dt;
            if (e.crouchTimer <= 0) {
              e.jumpState = "AIR";
              e.jumpCount = (e.jumpCount || 0) + 1;
              e.vy = -505;
              const aimVx = dxToPlayer / 0.95;
              e.vx = Math.max(-245, Math.min(245, aimVx));
              this.sound.playBossJump();
              this._spawnBurst(e.x + e.w / 2, e.groundY + e.h - 6, "#fb7185", 14);
            }
          } else if (e.jumpState === "AIR") {
            e.vy += 980 * dt;
            e.x += e.vx * dt;
            e.y += e.vy * dt;
            if (e.x < e.patrolMinX) {
              e.x = e.patrolMinX;
              e.vx = Math.abs(e.vx) * 0.5;
            } else if (e.x + e.w > e.patrolMaxX) {
              e.x = e.patrolMaxX - e.w;
              e.vx = -Math.abs(e.vx) * 0.5;
            }
            if (e.y >= e.groundY) {
              e.y = e.groundY;
              e.vy = 0;
              e.jumpState = "PATROL";
              e.jumpTimer = e.jumpInterval || 2.35;
              this.sound.playBossSlam();
              this._spawnBurst(e.x + 36, e.groundY + e.h - 4, "#fde047", 14);
              this._spawnBurst(e.x + e.w - 36, e.groundY + e.h - 4, "#fb7185", 14);
            }
          } else {
            if (inArena) {
              const chaseDir =
                dxToPlayer < -14 ? -1 : dxToPlayer > 14 ? 1 : e.vx >= 0 ? 1 : -1;
              e.vx = chaseDir * Math.abs(e.speed) * 1.12;
              e.jumpTimer -= dt;
              if (e.jumpTimer <= 0 && dist < 680) {
                e.jumpState = "CROUCH";
                e.crouchTimer = 0.36;
                e.vx = 0;
              }
            }
            e.x += e.vx * dt;
            if (e.x <= e.patrolMinX) {
              e.x = e.patrolMinX;
              e.vx = Math.abs(e.speed);
            } else if (e.x + e.w >= e.patrolMaxX) {
              e.x = e.patrolMaxX - e.w;
              e.vx = -Math.abs(e.speed);
            }
          }
        } else {
          e.x += e.vx * dt;
          if (e.x <= e.patrolMinX) {
            e.x = e.patrolMinX;
            e.vx = Math.abs(e.speed);
          } else if (e.x + e.w >= e.patrolMaxX) {
            e.x = e.patrolMaxX - e.w;
            e.vx = -Math.abs(e.speed);
          }
        }

        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && dist < 760) {
          e.fireTimer = e.fireInterval;
          const dir = p.x < e.x + e.w / 2 ? -1 : 1;
          const originX = e.x + e.w / 2 + dir * 48;
          const originY = e.y + 42;
          const shotColor = e.type === "snoolo_boss" ? "#fb7185" : "#a855f7";
          [-38, 35].forEach((vy) => {
            this.enemyProjectiles.push({
              x: originX,
              y: originY,
              vx: dir * 238,
              vy,
              color: shotColor,
              life: 2.8,
            });
          });
        }
      } else if (this._isShooterType(e.type)) {
        e.fireTimer -= dt;
        const dist = Math.abs(p.x - e.x);
        if (e.fireTimer <= 0 && dist < 540) {
          e.fireTimer = e.fireInterval;
          const dir = p.x < e.x ? -1 : 1;
          const shotColor = e.type === "squid_floater" ? "#22d3ee" : "#fb923c";
          this.enemyProjectiles.push({
            x: dir < 0 ? e.x - 4 : e.x + e.w + 4,
            y: e.y + e.h * 0.55,
            vx: dir * 240,
            vy: 0,
            color: shotColor,
            life: 2.4,
          });
        }
      } else {
        e.x += e.vx * dt;
        if (e.x <= e.patrolMinX) {
          e.x = e.patrolMinX;
          e.vx = Math.abs(e.speed);
        } else if (e.x + e.w >= e.patrolMaxX) {
          e.x = e.patrolMaxX - e.w;
          e.vx = -Math.abs(e.speed);
        }
      }

      const inset = this._isBossType(e.type) ? 18 : 4;
      if (
        rectsOverlap(
          p.x + 3,
          p.y + 3,
          p.w - 6,
          p.h - 6,
          e.x + inset,
          e.y + inset,
          e.w - inset * 2,
          e.h - inset * 2
        )
      ) {
        const wasInvuln = p.invulnTimer > 0;
        this._damagePlayer(1, false);
        if (!wasInvuln && this._isBossType(e.type)) {
          const pushDir = p.x + p.w / 2 < e.x + e.w / 2 ? -1 : 1;
          p.vx = pushDir * 240;
          p.vy = -195;
          p.x = Math.max(0, Math.min(this.currentLevel.width - p.w, p.x + pushDir * 18));
        }
      }
    });
  }

  _updateEnemyProjectiles(dt) {
    const p = this.player;
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx * dt;
      ep.y += (ep.vy || 0) * dt;
      ep.life -= dt;

      if (rectsOverlap(p.x + 3, p.y + 3, p.w - 6, p.h - 6, ep.x - 6, ep.y - 6, 12, 12)) {
        this.enemyProjectiles.splice(i, 1);
        this._damagePlayer(1, false);
        continue;
      }

      const blocked = this.platforms.some(
        (s) =>
          s.collapseState !== "FALLING" &&
          s.collapseState !== "GONE" &&
          rectsOverlap(ep.x - 5, ep.y - 5, 10, 10, s.x, s.y, s.w, s.h)
      );
      if (blocked || ep.life <= 0) {
        this.enemyProjectiles.splice(i, 1);
      }
    }
  }

  _updatePickups(dt) {
    const p = this.player;
    this.pickups.forEach((c) => {
      if (c.collected) {
        if (c.kind === "fuel" && c.respawnSec) {
          c.respawnTimer -= dt;
          if (c.respawnTimer <= 0) {
            c.collected = false;
            this._spawnBurst(c.x + 14, c.y + 14, "#38bdf8", 10);
          }
        }
        return;
      }
      if (rectsOverlap(p.x, p.y, p.w, p.h, c.x, c.y, c.w, c.h)) {
        c.collected = true;
        if (c.kind === "crystal") {
          this.score += 100;
          this.sound.playCrystal();
          this._spawnBurst(c.x + 13, c.y + 13, "#fde047", 14);
        } else if (c.kind === "fuel") {
          p.fuel = p.maxFuel;
          c.respawnTimer = c.respawnSec || 7;
          this.score += 50;
          this.sound.playFuel();
          this._spawnBurst(c.x + 14, c.y + 14, "#34d399", 14);
        }
      }
    });
  }

  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  _spawnBurst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 50 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.25 + Math.random() * 0.22,
        maxLife: 0.47,
        size: 2.5 + Math.random() * 3,
        color,
      });
    }
  }

  _updateRoverArrival(dt) {
    this.roverArrivalTimer += dt;
    this._updateParticles(dt);

    const r = this.arrivalRover;
    if (!r) {
      this.state = "PLAYING";
      return;
    }

    const driveDur = 0.85;
    const totalDur = 1.35;

    if (this.roverArrivalTimer < driveDur) {
      const u = Math.min(1, this.roverArrivalTimer / driveDur);
      const eased = 1 - Math.pow(1 - u, 2.5);
      r.x = r.startX + (r.parkedX - r.startX) * eased;
      r.wheelSpin = r.x - r.startX;
      r.pilotInside = true;
      r.isDriving = true;

      if (r.x + 24 > -8) {
        this.particles.push({
          x: r.x + 18 + (Math.random() - 0.5) * 10,
          y: r.y + r.h - 4 - Math.random() * 8,
          vx: -35 - Math.random() * 65,
          vy: -10 - Math.random() * 28,
          life: 0.42,
          maxLife: 0.42,
          size: 4.5 + Math.random() * 4,
          color: Math.random() < 0.7 ? "#cbd5e1" : "#fde047",
        });
      }
      return;
    }

    // Rover is parked; Pilot hops out of the cab onto the course!
    r.x = r.parkedX;
    r.wheelSpin = r.parkedX - r.startX;
    r.pilotInside = false;
    r.isDriving = false;

    if (!r.hopTriggered) {
      r.hopTriggered = true;
      this.sound.playRoverHopOut();
      this._spawnBurst(r.parkedX + 74, r.y + 28, "#fde047", 14);
    }

    const fromX = r.parkedX + 64;
    const fromY = r.y + 16;
    const toX = this.currentLevel.spawn.x;
    const toY = r.y + r.h - this.player.h;
    const hopU = Math.min(1, (this.roverArrivalTimer - driveDur) / (totalDur - driveDur));

    this.player.x = fromX + (toX - fromX) * hopU;
    this.player.y = fromY + (toY - fromY) * hopU - Math.sin(hopU * Math.PI) * 34;
    this.player.facing = 1;
    this.player.jetting = hopU < 0.65;

    if (this.roverArrivalTimer >= totalDur) {
      this.player.x = toX;
      this.player.y = toY;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.onGround = true;
      this.player.jetting = false;
      this.state = "PLAYING";
    }
  }

  _checkGoal() {
    if (this.isBossAlive()) return;
    const g = this.currentLevel.goal;
    const p = this.player;
    if (g && rectsOverlap(p.x, p.y, p.w, p.h, g.x, g.y, g.w, g.h)) {
      this.state = "ROCKET_LIFTOFF";
      this.rocketLaunchTimer = 0;
      this.rocketLaunchOffsetY = 0;
      this.roverDriveOffsetX = 0;
      this.score += 500;
      if (g.vehicle === "mars_rover" || g.vehicle === "mars_bike") {
        this.sound.playRoverDrive();
      } else {
        this.sound.playRocketLaunch();
      }
      this._spawnBurst(g.x + g.w / 2, g.y + g.h - 20, "#fde047", 24);
    }
  }

  _updateRocketLiftoff(dt) {
    this.rocketLaunchTimer += dt;
    this._updateParticles(dt);

    const g = this.currentLevel.goal;
    const isMarsRover = Boolean(g && (g.vehicle === "mars_rover" || g.vehicle === "mars_bike"));

    if (g && isMarsRover) {
      const maxCam = Math.max(0, this.currentLevel.width - this.width);
      const targetCam = Math.max(0, Math.min(maxCam, g.x - this.width * 0.62));
      this.cameraX += (targetCam - this.cameraX) * Math.min(1, dt * 6);

      // 0.0s..0.55s: Pilot hops inside cab & waves while Rover revs; 0.55s+: DRIVE OFF to the right!
      if (this.rocketLaunchTimer > 0.55) {
        const t = this.rocketLaunchTimer - 0.55;
        this.roverDriveOffsetX = 115 * t + 260 * t * t;
      }

      const rearWheelX = g.x + this.roverDriveOffsetX + 16;
      const groundY = g.y + g.h - 4;
      if (rearWheelX < this.cameraX + this.width + 60) {
        for (let i = 0; i < 2; i++) {
          const isDust = i === 0 || this.rocketLaunchTimer <= 0.55;
          this.particles.push({
            x: rearWheelX + (Math.random() - 0.5) * 14,
            y: groundY - Math.random() * 10,
            vx: -45 - Math.random() * 95,
            vy: -12 - Math.random() * 38,
            life: isDust ? 0.48 : 0.28,
            maxLife: isDust ? 0.48 : 0.28,
            size: isDust ? 5 + Math.random() * 4.5 : 3 + Math.random() * 2.5,
            color: isDust ? "#cbd5e1" : Math.random() < 0.5 ? "#f97316" : "#fde047",
          });
        }
      }

      if (this.rocketLaunchTimer >= 2.55) {
        this.state = "LEVEL_COMPLETE";
        this.sound.playPortalWin();
      }
      return;
    }

    if (g) {
      // Smoothly frame the Escape Rocket so players clearly see themselves waving out the window!
      const maxCam = Math.max(0, this.currentLevel.width - this.width);
      const targetCam = Math.max(0, Math.min(maxCam, g.x - this.width * 0.62));
      this.cameraX += (targetCam - this.cameraX) * Math.min(1, dt * 6);

      // 0.0s..0.65s: Pilot climbs in & waves from window while engine ignites; 0.65s+: BLAST OFF into the sky!
      if (this.rocketLaunchTimer > 0.65) {
        const t = this.rocketLaunchTimer - 0.65;
        this.rocketLaunchOffsetY = 95 * t + 280 * t * t;
      }

      const nozzleX = g.x + g.w / 2;
      const nozzleY = g.y + g.h - 6 - this.rocketLaunchOffsetY;
      if (nozzleY > -60) {
        for (let i = 0; i < 3; i++) {
          const isSmoke = i === 0;
          this.particles.push({
            x: nozzleX + (Math.random() - 0.5) * 24,
            y: Math.min(g.y + g.h - 4, nozzleY + 6),
            vx: (Math.random() - 0.5) * (isSmoke ? 95 : 55),
            vy: isSmoke ? 35 + Math.random() * 55 : 130 + Math.random() * 110,
            life: isSmoke ? 0.55 : 0.32,
            maxLife: isSmoke ? 0.55 : 0.32,
            size: isSmoke ? 6 + Math.random() * 5 : 3.5 + Math.random() * 3.5,
            color: isSmoke ? "#e2e8f0" : Math.random() < 0.5 ? "#f97316" : "#fde047",
          });
        }
      }
    }

    if (this.rocketLaunchTimer >= 2.75) {
      this.state = "LEVEL_COMPLETE";
      this.sound.playPortalWin();
    }
  }

  renderSceneOnly(ctx) {
    if (this.state === "SELECT_PILOT") {
      this._renderPilotSelect(ctx);
      return;
    }

    this._renderBackdrop(ctx);
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    this._renderSigns(ctx);
    this._renderHazards(ctx);
    this._renderPlatforms(ctx);
    this._renderTrampolines(ctx);
    this._renderDestructibles(ctx);
    this._renderIceBuckets(ctx);
    this._renderArrivalRover(ctx);
    this._renderExitWormhole(ctx);
    this._renderGoalPortal(ctx);
    this._renderPickups(ctx);
    this._renderEnemies(ctx);
    this._renderLasers(ctx);
    this._renderParticles(ctx);

    // Draw Pilot on ground/air (hidden while inside Arrival Mars Rover or Escape Vehicle!)
    const hiddenInArrivalRover =
      this.state === "ROVER_ARRIVAL" && this.arrivalRover && this.arrivalRover.pilotInside;
    if (
      !hiddenInArrivalRover &&
      this.state !== "ROCKET_LIFTOFF" &&
      this.state !== "LEVEL_COMPLETE"
    ) {
      const hurtFlash = this.player.invulnTimer > 0 && Math.floor(this.timeSec * 16) % 2 === 0;
      if (this.state === "WORMHOLE_WARP" && this.wormholeWarp) {
        const sc = this.wormholeWarp.pilotScale || 1;
        const pcx = this.player.x + this.player.w / 2;
        const pcy = this.player.y + this.player.h / 2;
        ctx.save();
        ctx.translate(pcx, pcy);
        ctx.rotate(this.wormholeWarp.pilotSpin || 0);
        drawPilotSprite(ctx, {
          x: -(this.player.w * sc) / 2,
          y: -(this.player.h * sc) / 2,
          w: this.player.w,
          h: this.player.h,
          facing: this.player.facing,
          pilot: this.activePilot,
          jetting: false,
          walkPhase: 0,
          hurtFlash: false,
          scale: sc,
        });
        ctx.restore();
      } else {
        drawPilotSprite(ctx, {
          x: this.player.x,
          y: this.player.y,
          w: this.player.w,
          h: this.player.h,
          facing: this.player.facing,
          pilot: this.activePilot,
          jetting: this.player.jetting,
          walkPhase: this.player.walkPhase,
          hurtFlash,
        });
        if (this.player.frozenHitsLeft > 0) {
          drawFrozenIceBlock(ctx, {
            x: this.player.x,
            y: this.player.y,
            w: this.player.w,
            h: this.player.h,
            hitsLeft: this.player.frozenHitsLeft,
            shakeTimer: this.player.freezeShakeTimer,
            timeSec: this.timeSec,
          });
        }
      }
    }

    ctx.restore();

    this._renderHud(ctx);

    if (this.state === "LEVEL_COMPLETE") {
      this._renderEndBanner(ctx, true);
    } else if (this.state === "GAME_OVER") {
      this._renderEndBanner(ctx, false);
    }
  }

  render() {
    this.renderSceneOnly(this.ctx);
  }

  _renderPilotSelect(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, "#070c1f");
    grad.addColorStop(1, "#162447");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    this.stars.forEach((s, idx) => {
      const alpha = 0.4 + 0.5 * Math.sin(this.timeSec * 2.5 + idx);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect((s.x + this.timeSec * 12 * s.parallax) % this.width, s.y, s.size, s.size);
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "900 54px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#facc15";
    ctx.shadowColor = "rgba(56, 189, 248, 0.7)";
    ctx.shadowBlur = 18;
    ctx.fillText("⚡ JET LASER ⚡", this.width / 2, 102);
    ctx.shadowBlur = 0;

    ctx.font = "600 20px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("Choose Your Pilot & Launch!", this.width / 2, 148);

    const cards = this._getPilotCardRects();
    cards.forEach((card, idx) => {
      const selected = idx === this.selectedPilotIndex;
      const p = card.pilot;
      const hoverBob = selected ? Math.sin(this.timeSec * 5) * 6 : 0;

      ctx.save();
      ctx.fillStyle = selected ? "rgba(30, 41, 59, 0.95)" : "rgba(15, 23, 42, 0.78)";
      ctx.strokeStyle = selected ? p.suitPrimary : "#334155";
      ctx.lineWidth = selected ? 4 : 2;
      if (selected) {
        ctx.shadowColor = p.cardGlow;
        ctx.shadowBlur = 24;
      }
      ctx.beginPath();
      ctx.roundRect(card.x, card.y, card.w, card.h, 18);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      drawPilotSprite(ctx, {
        x: card.x + card.w / 2 - 28,
        y: card.y + 34 + hoverBob,
        facing: 1,
        pilot: p,
        jetting: selected,
        walkPhase: selected ? this.timeSec * 6 : 0,
        scale: 1.7,
      });

      ctx.fillStyle = selected ? "#ffffff" : "#cbd5e1";
      ctx.font = "800 18.5px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(p.name.toUpperCase(), card.x + card.w / 2, card.y + 174, card.w - 22);

      ctx.fillStyle = p.visorColor;
      ctx.font = "600 13.5px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(p.tagline, card.x + card.w / 2, card.y + 198);

      if (selected) {
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 12.5px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText("★ SELECTED ★", card.x + card.w / 2, card.y + 219);
      }
      ctx.restore();
    });

    // Planet Selector Pills (Planet 1: Zoola  |  Planet 2: Shelin ✨)
    const planetTabs = this._getPlanetTabRects();
    planetTabs.forEach((ptab) => {
      const active = ptab.planet.id === this.selectedPlanetId;
      ctx.save();
      ctx.fillStyle = active
        ? ptab.planet.id === "shelin"
          ? "rgba(244, 114, 182, 0.28)"
          : "rgba(56, 189, 248, 0.25)"
        : "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = active ? "#facc15" : "#475569";
      ctx.lineWidth = active ? 2.6 : 1.5;
      ctx.beginPath();
      ctx.roundRect(ptab.x, ptab.y, ptab.w, ptab.h, 17);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#fde047" : "#cbd5e1";
      ctx.font = "800 13.5px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ptab.planet.badge, ptab.x + ptab.w / 2, ptab.y + 22);
      ctx.restore();
    });

    // 5-Level Selector Row for Active Planet
    const levelTabs = this._getLevelTabRects();
    levelTabs.forEach((tab) => {
      const active = tab.globalIndex === this.currentLevelIndex;
      ctx.save();
      ctx.fillStyle = active ? "rgba(56, 189, 248, 0.25)" : "rgba(15, 23, 42, 0.82)";
      ctx.strokeStyle = active ? "#facc15" : "#334155";
      ctx.lineWidth = active ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(tab.x, tab.y, tab.w, tab.h, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#fde047" : "#cbd5e1";
      ctx.font = "800 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      const shortTitle = tab.lvl.name.replace(/^(Zoola|Shelin)\s+\d+:\s*/, "");
      ctx.fillText(`${tab.localIdx + 1}. ${shortTitle}`, tab.x + tab.w / 2, tab.y + 23);
      ctx.restore();
    });

    ctx.fillStyle = "#bae6fd";
    ctx.font = "bold 14.5px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      `◀ / ▶  Choose Pilot   ·   SPACE / ENTER  Launch Campaign!`,
      this.width / 2,
      452
    );

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12.5px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      "10-Level Campaign: Battle across Planet Zoola & Planet Shelin to defeat Big Boss SNOOLO!",
      this.width / 2,
      486
    );
    ctx.restore();
  }

  _renderBackdrop(ctx) {
    const lvl = this.currentLevel;
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, lvl.skyTop);
    grad.addColorStop(1, lvl.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    this.stars.forEach((s) => {
      const sx = ((s.x - this.cameraX * s.parallax) % this.width + this.width) % this.width;
      ctx.fillRect(sx, s.y, s.size, s.size);
    });

    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    for (let i = 0; i < 16; i++) {
      const bx = ((i * 210 - this.cameraX * 0.25) % (this.width + 260) + (this.width + 260)) % (this.width + 260) - 130;
      const bh = 90 + ((i * 53) % 130);
      ctx.fillRect(bx, this.height - bh, 110, bh);
    }
  }

  _renderSigns(ctx) {
    const signs = this.currentLevel.signs || [];
    ctx.save();
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "left";
    signs.forEach((s) => {
      const tw = ctx.measureText(s.text).width + 20;
      ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(s.x, s.y - 24, tw, 28, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e0f2fe";
      ctx.fillText(s.text, s.x + 10, s.y - 6);
    });
    ctx.restore();
  }

  _renderPlatforms(ctx) {
    const visibleStatic = this.platforms.filter((p) => p.collapseState !== "GONE");
    const all = [...visibleStatic, ...this.movingPlatforms];

    all.forEach((p) => {
      const drawX = p.x + (p.shakeOffsetX || 0);
      ctx.save();

      ctx.fillStyle = p.color || "#1e293b";
      ctx.fillRect(drawX, p.y, p.w, p.h);

      ctx.fillStyle = p.collapseState === "SHAKING" ? "#ef4444" : p.topColor || "#38bdf8";
      ctx.fillRect(drawX, p.y, p.w, 5);

      ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
      ctx.lineWidth = 1;
      for (let gx = drawX + 32; gx < drawX + p.w; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, p.y + 5);
        ctx.lineTo(gx, p.y + p.h);
        ctx.stroke();
      }

      // Shaking cracks & countdown badge!
      if (p.collapseState === "SHAKING") {
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawX + p.w * 0.3, p.y + 4);
        ctx.lineTo(drawX + p.w * 0.36, p.y + p.h * 0.6);
        ctx.lineTo(drawX + p.w * 0.32, p.y + p.h);
        ctx.moveTo(drawX + p.w * 0.68, p.y + 4);
        ctx.lineTo(drawX + p.w * 0.62, p.y + p.h * 0.7);
        ctx.stroke();

        const secsLeft = Math.max(1, Math.ceil(p.shakeTimer));
        ctx.fillStyle = "rgba(127, 29, 29, 0.92)";
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(drawX + p.w / 2 - 28, p.y + 6, 56, 18, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`⚠️ ${secsLeft}s!`, drawX + p.w / 2, p.y + 19);
      }

      ctx.restore();
    });
  }

  _renderTrampolines(ctx) {
    this.trampolines.forEach((t) => {
      if (t.style === "catapult") {
        drawCatapult(ctx, {
          x: t.x,
          y: t.y,
          w: t.w,
          h: t.h,
          boingTimer: t.boingTimer,
          timeSec: this.timeSec,
        });
      } else {
        drawTrampoline(ctx, { x: t.x, y: t.y, w: t.w, h: t.h, boingTimer: t.boingTimer });
      }
    });
  }

  _renderHazards(ctx) {
    this.hazards.forEach((h) => {
      if (h.kind === "popup_spikes") {
        drawPopupSpikes(ctx, {
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          extendRatio: h.extendRatio || 0,
          isWarning: Boolean(h.isWarning),
          timeSec: this.timeSec,
        });
        return;
      }

      if (h.kind === "hole") {
        ctx.save();
        const abyssGrad = ctx.createLinearGradient(0, h.y - 36, 0, h.y + h.h);
        abyssGrad.addColorStop(0, "rgba(2, 6, 23, 0)");
        abyssGrad.addColorStop(0.55, "rgba(2, 6, 23, 0.72)");
        abyssGrad.addColorStop(1, "rgba(2, 6, 23, 0.96)");
        ctx.fillStyle = abyssGrad;
        ctx.fillRect(h.x, h.y - 36, h.w, h.h + 36);
        ctx.restore();
        return;
      }

      if (h.kind === "wormhole") {
        drawWormhole(ctx, {
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          timeSec: this.timeSec,
          isExit: false,
        });
        return;
      }

      ctx.save();

      // 10-Second Explosive Lava Geyser Column!
      if (h.isErupting && h.eruptHeight > 4) {
        const topY = h.y - h.eruptHeight;
        const grad = ctx.createLinearGradient(0, topY, 0, h.y + h.h);
        grad.addColorStop(0, "#fef08a");
        grad.addColorStop(0.4, "#f97316");
        grad.addColorStop(1, "#e11d48");

        ctx.fillStyle = grad;
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(h.x + 6, topY, Math.max(20, h.w - 12), h.eruptHeight + 8, [18, 18, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // Inner bright magma core
        ctx.fillStyle = "rgba(254, 249, 195, 0.7)";
        ctx.beginPath();
        ctx.roundRect(h.x + h.w * 0.28, topY + 12, h.w * 0.44, h.eruptHeight - 8, 10);
        ctx.fill();

        // Cartoon BOOM callout!
        ctx.fillStyle = "#fde047";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;
        ctx.font = "900 16px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText("💥 BOOM!", h.x + h.w / 2, topY - 10);
        ctx.fillText("💥 BOOM!", h.x + h.w / 2, topY - 10);
      } else if (h.isRumbling) {
        // Pre-eruption warning bubbles & rumble alert!
        const jitter = Math.sin(this.timeSec * 40) * 3;
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌋 LAVA RUMBLING!", h.x + h.w / 2 + jitter, h.y - 10);
      }

      // Base bubbling cartoon lava pool
      const pulse = 0.8 + 0.2 * Math.sin(this.timeSec * 9);
      ctx.fillStyle = h.isRumbling ? "#fb923c" : `rgba(239, 68, 68, ${pulse})`;
      ctx.fillRect(h.x, h.y, h.w, h.h);

      // Cartoon molten waves / flames along top of lava
      ctx.fillStyle = "#fde047";
      for (let sx = h.x + 6; sx < h.x + h.w - 10; sx += 18) {
        const wave = Math.sin(this.timeSec * 10 + sx * 0.1) * 3;
        ctx.beginPath();
        ctx.arc(sx + 6, h.y + 4 + wave, 6, Math.PI, 0);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  _renderDestructibles(ctx) {
    this.destructibles.forEach((d) => {
      if (d.hp <= 0) return;
      if (d.style === "diamond_wall") {
        drawDiamondWall(ctx, {
          x: d.x,
          y: d.y,
          w: d.w,
          h: d.h,
          hp: d.hp,
          maxHp: d.maxHp,
          timeSec: this.timeSec,
        });
      } else if (d.style === "brick_wall") {
        drawBrickWall(ctx, {
          x: d.x,
          y: d.y,
          w: d.w,
          h: d.h,
          hp: d.hp,
          maxHp: d.maxHp,
        });
      } else {
        drawMazeBarrier(ctx, {
          x: d.x,
          y: d.y,
          w: d.w,
          h: d.h,
          hp: d.hp,
          maxHp: d.maxHp,
          timeSec: this.timeSec,
        });
      }
    });
  }

  _renderIceBuckets(ctx) {
    this.fallingIce.forEach((ic) => {
      drawFallingIceCube(ctx, { x: ic.x, y: ic.y, size: ic.size, rot: ic.rot });
    });
    this.iceBuckets.forEach((b) => {
      drawIceBucket(ctx, {
        x: b.x,
        y: b.y,
        tipAngle: b.tipAngle,
        isWarning: b.isWarning,
        hasIceInside: b.hasIceInside,
        timeSec: this.timeSec,
      });
    });
  }

  _renderExitWormhole(ctx) {
    const ew = this.exitWormhole;
    if (!ew) return;
    const scale =
      this.state === "WORMHOLE_WARP"
        ? 1
        : Math.max(0, Math.min(1, ew.life / (ew.maxLife || 0.55)));
    drawWormhole(ctx, {
      x: ew.x,
      y: ew.y,
      w: ew.w,
      h: ew.h,
      timeSec: this.timeSec,
      isExit: true,
      scale,
    });
  }

  _renderArrivalRover(ctx) {
    const r = this.arrivalRover;
    if (!r) return;
    const isBike = r.vehicle === "mars_bike";
    const bannerText =
      this.state === "ROVER_ARRIVAL"
        ? r.pilotInside
          ? isBike
            ? `🏍️ MARS BIKE!`
            : `🚙 ARRIVING!`
          : isBike
            ? `🏍️ LET'S RIDE!`
            : `🚙 LET'S GO!`
        : null;

    if (isBike) {
      drawMarsBike(ctx, {
        x: r.x,
        y: r.y,
        w: r.w,
        h: r.h,
        pilotInside: r.pilotInside ? this.activePilot : null,
        driveOffsetX: 0,
        wheelSpinOffset: r.wheelSpin,
        isDriving: r.isDriving,
        showParkingPad: false,
        bannerText,
        timeSec: this.timeSec,
      });
      return;
    }

    drawMarsRover(ctx, {
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      pilotInside: r.pilotInside ? this.activePilot : null,
      driveOffsetX: 0,
      wheelSpinOffset: r.wheelSpin,
      isDriving: r.isDriving,
      showParkingPad: false,
      bannerText,
      timeSec: this.timeSec,
    });
  }

  _renderGoalPortal(ctx) {
    const g = this.currentLevel.goal;
    if (!g) return;
    const boarded = this.state === "ROCKET_LIFTOFF" || this.state === "LEVEL_COMPLETE";
    if (g.vehicle === "mars_bike") {
      drawMarsBike(ctx, {
        x: g.x,
        y: g.y,
        w: g.w,
        h: g.h,
        pilotInside: boarded ? this.activePilot : null,
        driveOffsetX: boarded ? this.roverDriveOffsetX : 0,
        isDriving: this.state === "ROCKET_LIFTOFF",
        timeSec: this.timeSec,
      });
      return;
    }
    if (g.vehicle === "mars_rover") {
      drawMarsRover(ctx, {
        x: g.x,
        y: g.y,
        w: g.w,
        h: g.h,
        pilotInside: boarded ? this.activePilot : null,
        driveOffsetX: boarded ? this.roverDriveOffsetX : 0,
        isDriving: this.state === "ROCKET_LIFTOFF",
        timeSec: this.timeSec,
      });
      return;
    }
    const boss = this.getActiveBoss();
    drawEscapeRocket(ctx, {
      x: g.x,
      y: g.y,
      w: g.w,
      h: g.h,
      locked: Boolean(boss),
      bossName: boss ? boss.label : "BOSS",
      pilotInside: boarded ? this.activePilot : null,
      launchOffsetY: boarded ? this.rocketLaunchOffsetY : 0,
      isLaunching: this.state === "ROCKET_LIFTOFF",
      timeSec: this.timeSec,
    });
  }

  _renderPickups(ctx) {
    const isShelin = this.getPlanetIdForLevel(this.currentLevel) === "shelin";
    this.pickups.forEach((c) => {
      if (c.collected) {
        if (c.kind === "fuel" && c.respawnSec) {
          drawTwinJetBooster(ctx, { x: c.x, y: c.y, w: c.w, h: c.h, timeSec: this.timeSec, recharging: true });
        }
        return;
      }
      if (c.kind === "fuel") {
        drawTwinJetBooster(ctx, { x: c.x, y: c.y, w: c.w, h: c.h, timeSec: this.timeSec });
      } else if (isShelin) {
        drawMeteorPickup(ctx, { x: c.x, y: c.y, w: c.w, h: c.h, timeSec: this.timeSec });
      } else {
        drawSkyStar(ctx, { x: c.x, y: c.y, w: c.w, h: c.h, timeSec: this.timeSec });
      }
    });
  }

  _renderEnemies(ctx) {
    this.enemies.forEach((e) => {
      if (e.hp <= 0) return;
      const facing = e.vx !== 0 ? (e.vx >= 0 ? 1 : -1) : this.player.x < e.x ? -1 : 1;

      if (e.type === "moon_chomper") {
        drawMoonChomper(ctx, { x: e.x, y: e.y, w: e.w, h: e.h, facing, timeSec: this.timeSec });
      } else if (e.type === "spiky_chomper" || e.type === "chaser_chomper") {
        drawSpikyChomper(ctx, { x: e.x, y: e.y, w: e.w, h: e.h, facing, timeSec: this.timeSec });
      } else if (e.type === "sun_wobbler") {
        drawSolarWobbler(ctx, {
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
          facing,
          timeSec: this.timeSec,
          hurtFlash: e.hurtTimer > 0,
        });
      } else if (e.type === "kite_biter" || e.type === "chaser_kite") {
        drawDiamondFang(ctx, {
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
          facing,
          timeSec: this.timeSec,
          hurtFlash: e.hurtTimer > 0,
          isChaser: e.type === "chaser_kite",
        });
      } else if (e.type === "petal_urchin") {
        drawPetalUrchin(ctx, {
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
          facing,
          timeSec: this.timeSec,
          hurtFlash: e.hurtTimer > 0,
        });
      } else if (e.type === "squid_floater") {
        drawTentacleJelly(ctx, {
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
          facing,
          timeSec: this.timeSec,
          hurtFlash: e.hurtTimer > 0,
        });
      } else if (e.type === "snoolo_boss") {
        drawSnooloBoss(ctx, {
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
          facing: this.player.x < e.x + e.w / 2 ? -1 : 1,
          timeSec: this.timeSec,
          hurtFlash: e.hurtTimer > 0,
          jumpState: e.jumpState || "PATROL",
        });
      } else if (e.type === "giant_stalk_boss") {
        drawStalkAlien(ctx, {
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
          facing: this.player.x < e.x + e.w / 2 ? -1 : 1,
          timeSec: this.timeSec,
          isBoss: true,
          hurtFlash: e.hurtTimer > 0,
        });
      } else if (e.type === "stalk_alien") {
        drawStalkAlien(ctx, {
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
          facing,
          timeSec: this.timeSec,
          hurtFlash: e.hurtTimer > 0,
        });
      } else if (e.type === "triangle_ufo" || e.type === "turret") {
        drawTriangleUfo(ctx, { x: e.x, y: e.y, w: e.w, h: e.h, facing, timeSec: this.timeSec });
      } else {
        drawStalkAlien(ctx, { x: e.x, y: e.y, w: e.w, h: e.h, facing, timeSec: this.timeSec });
      }
    });

    this.enemyProjectiles.forEach((ep) => {
      ctx.fillStyle = ep.color || "#fb923c";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ep.x - 1.5, ep.y - 1.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _renderLasers(ctx) {
    this.lasers.forEach((b) => {
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 3);
      ctx.fill();

      ctx.fillStyle = b.core;
      ctx.fillRect(b.x + 3, b.y + 1.5, b.w - 6, 2);
      ctx.restore();
    });
  }

  _renderParticles(ctx) {
    this.particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  _renderHud(ctx) {
    ctx.save();

    // Left Status Panel
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(16, 14, 255, 58, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "left";
    ctx.fillText("SHIELD", 28, 34);
    for (let i = 0; i < this.player.maxHp; i++) {
      ctx.fillStyle = i < this.player.hp ? this.activePilot.suitPrimary : "#334155";
      ctx.beginPath();
      ctx.roundRect(88 + i * 24, 22, 18, 14, 4);
      ctx.fill();
    }

    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("JET FUEL", 28, 58);
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(96, 47, 160, 13, 6);
    ctx.fill();

    const fuelRatio = this.player.fuel / this.player.maxFuel;
    ctx.fillStyle = fuelRatio > 0.25 ? "#38bdf8" : "#f43f5e";
    if (fuelRatio > 0) {
      ctx.beginPath();
      ctx.roundRect(96, 47, Math.max(8, 160 * fuelRatio), 13, 6);
      ctx.fill();
    } else {
      ctx.fillStyle = Math.floor(this.timeSec * 6) % 2 === 0 ? "#fde047" : "#fda4af";
      ctx.font = "800 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EMPTY! GRAB FUEL TANK!", 176, 57);
    }

    // Center Boss Health Bar (when approaching or fighting the Giant Stalk-Eye Boss!)
    const boss = this.getActiveBoss();
    if (boss && this.cameraX > 1580) {
      const bx = 305;
      const bw = 350;
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, 14, bw, 54, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f5d0fe";
      ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`👑 ${boss.label.toUpperCase()} (${boss.hp}/${boss.maxHp})`, bx + bw / 2, 32);

      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(bx + 18, 42, bw - 36, 14, 7);
      ctx.fill();

      const bossRatio = Math.max(0, boss.hp / boss.maxHp);
      ctx.fillStyle = "#a855f7";
      ctx.beginPath();
      ctx.roundRect(bx + 18, 42, Math.max(10, (bw - 36) * bossRatio), 14, 7);
      ctx.fill();
    }

    // Top-Right Score & Sky Stars Panel
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(this.width - 296, 14, 280, 58, 10);
    ctx.fill();
    ctx.stroke();

    const totalStars = this.pickups.filter((c) => c.kind === "crystal").length;
    const gotStars = this.pickups.filter((c) => c.kind === "crystal" && c.collected).length;
    const pickupIcon = this.getPlanetIdForLevel(this.currentLevel) === "shelin" ? "☄️" : "⭐";

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(this.currentLevel.name, this.width - 282, 34);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`${pickupIcon} ${gotStars}/${totalStars}   ·   Score: ${this.score}`, this.width - 282, 57);

    ctx.restore();
  }

  _renderEndBanner(ctx, won) {
    ctx.save();
    ctx.fillStyle = "rgba(7, 11, 25, 0.72)";
    ctx.fillRect(0, 0, this.width, this.height);

    const isPlanetFinale = this.currentLevel.number === 5;
    const isCampaignFinale = this.currentLevelIndex >= this.levels.length - 1;
    const nextLvl = !isCampaignFinale ? this.levels[this.currentLevelIndex + 1] : null;
    const planetUpper = (this.currentLevel.planet || "Planet Zoola").toUpperCase();

    const bw = 560;
    const bh = 220;
    const bx = (this.width - bw) / 2;
    const by = (this.height - bh) / 2;

    ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
    ctx.strokeStyle = won ? (isPlanetFinale ? "#facc15" : "#34d399") : "#fb7185";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 18);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = won ? (isPlanetFinale ? "#fde047" : "#34d399") : "#fb7185";
    ctx.font = "900 28px -apple-system, BlinkMacSystemFont, sans-serif";
    const isMarsBike = this.currentLevel.goal && this.currentLevel.goal.vehicle === "mars_bike";
    const vehicleIcon = isMarsBike ? "🏍️" : "🚙";
    const vehicleName = isMarsBike ? "Mars Bike" : "Mars Rover";
    const headline = !won
      ? "JET SUIT DOWN!"
      : isPlanetFinale
        ? `🏆 ${planetUpper} SAVED!`
        : `${vehicleIcon} LEVEL ${this.currentLevel.number} COMPLETE!`;
    ctx.fillText(headline, this.width / 2, by + 54);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "600 16px -apple-system, BlinkMacSystemFont, sans-serif";
    const subline = !won
      ? `${this.currentLevel.name}   ·   Score: ${this.score}`
      : isCampaignFinale
        ? `Big Boss SNOOLO Defeated! Planet Zoola & Planet Shelin Conquered! · Score: ${this.score}`
        : isPlanetFinale
          ? `Escape Rocket En Route to ${nextLvl.planet}!  ·  Score: ${this.score}`
          : `${vehicleName} En Route -> ${nextLvl.name}   ·   Score: ${this.score}`;
    ctx.fillText(subline, this.width / 2, by + 94);

    ctx.fillStyle = "#fde047";
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
    const actionPrompt = !won
      ? "Press SPACE or ENTER to Try Again   ·   Press O to Switch Pilot"
      : isCampaignFinale
        ? "Press SPACE / ENTER to Play Again   ·   O : Switch Pilot"
        : isPlanetFinale
          ? `Press SPACE or ENTER to Fly to ${nextLvl.planet}!   ·   R : Replay`
          : `Press SPACE or ENTER to ${isMarsBike ? "Ride" : "Drive"} to Level ${this.currentLevel.number + 1}!   ·   R : Replay`;
    ctx.fillText(actionPrompt, this.width / 2, by + 142);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("R : Replay Current Level   ·   O : Switch Pilot   ·   M : Mute Sound", this.width / 2, by + 182);
    ctx.restore();
  }
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

const canvas = document.getElementById("game-canvas");
const game = new JetLaserGame(canvas);

let lastTime = performance.now();
let accumulator = 0;
const FIXED_DT = 1 / 60;

function frame(now) {
  if (game.autotestFrozen) {
    game.render();
    requestAnimationFrame(frame);
    return;
  }
  const frameDt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  accumulator += frameDt;

  while (accumulator >= FIXED_DT) {
    game.update(FIXED_DT, now);
    game.input.endFrame();
    accumulator -= FIXED_DT;
  }

  game.render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
