// Lightweight in-game toast notification overlay

export class ToastOverlay {
  constructor() {
    this.mode = "IDLE";
    this.isActive = false;
    this.toastEl = document.getElementById("toast");
    this.toastTimer = null;
  }

  showToast(message, durationMs = 3000) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.remove("hidden");
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.add("hidden");
    }, durationMs);
  }

  update() {}
  renderWorldPins() {}
  renderOverlay() {}
  closeInspector() {}
}
