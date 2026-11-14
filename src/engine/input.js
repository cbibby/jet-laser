// Keyboard input manager with text-input safety & AI test injection support

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]);

export class InputManager {
  constructor() {
    this.down = new Set();
    this.justPressed = new Set();
    this.virtualDown = new Set();
    this.suppressed = false;

    window.addEventListener("keydown", (e) => this._onKeyDown(e));
    window.addEventListener("keyup", (e) => this._onKeyUp(e));
    window.addEventListener("blur", () => this.clearAll());
  }

  _isTypingInForm() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "TEXTAREA" || tag === "INPUT" || el.isContentEditable;
  }

  _onKeyDown(e) {
    if (this._isTypingInForm() || this.suppressed) {
      return;
    }
    if (SCROLL_KEYS.has(e.code)) {
      e.preventDefault();
    }
    if (!this.down.has(e.code)) {
      this.justPressed.add(e.code);
    }
    this.down.add(e.code);
  }

  _onKeyUp(e) {
    this.down.delete(e.code);
  }

  clearAll() {
    this.down.clear();
    this.justPressed.clear();
    this.virtualDown.clear();
  }

  endFrame() {
    this.justPressed.clear();
  }

  isDown(...codes) {
    return codes.some((c) => this.down.has(c) || this.virtualDown.has(c));
  }

  wasPressed(...codes) {
    return codes.some((c) => this.justPressed.has(c));
  }

  // Action helpers for keyboard-only play
  get moveLeft() {
    return this.isDown("ArrowLeft", "KeyA");
  }

  get moveRight() {
    return this.isDown("ArrowRight", "KeyD");
  }

  get jetpackUp() {
    return this.isDown("ArrowUp", "KeyW");
  }

  get jetpackJustTapped() {
    return this.wasPressed("ArrowUp", "KeyW");
  }

  get fireLaser() {
    return this.isDown("Space", "KeyZ", "KeyJ");
  }

  get fireJustPressed() {
    return this.wasPressed("Space", "KeyZ", "KeyJ");
  }

  // Programmatic control for AI simulation / playtest
  setVirtualInputs({ left = false, right = false, up = false, fire = false } = {}) {
    this.virtualDown.clear();
    if (left) this.virtualDown.add("ArrowLeft");
    if (right) this.virtualDown.add("ArrowRight");
    if (up) {
      if (!this.down.has("ArrowUp")) this.justPressed.add("ArrowUp");
      this.virtualDown.add("ArrowUp");
    }
    if (fire) {
      this.justPressed.add("Space");
      this.virtualDown.add("Space");
    }
  }
}
