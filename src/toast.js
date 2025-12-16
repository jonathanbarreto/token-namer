import { $ } from "./dom.js";

export function showToast(message) {
  const root = $("#toastRoot");
  if (!root) return;

  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = String(message || "");
  root.appendChild(el);

  window.setTimeout(() => {
    el.remove();
  }, 2200);
}

