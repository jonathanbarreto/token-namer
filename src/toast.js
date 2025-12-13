function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function showToast(message, { title } = {}) {
  const root = document.getElementById("toastRoot");
  if (!root) return;

  const el = document.createElement("div");
  el.className = "toast";
  const text = document.createElement("div");
  text.innerHTML = title ? `<strong>${escapeHtml(title)}</strong> ${escapeHtml(message)}` : escapeHtml(message);
  el.appendChild(text);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "icon-btn";
  close.setAttribute("aria-label", "Dismiss");
  close.textContent = "×";
  close.addEventListener("click", () => el.remove());
  el.appendChild(close);

  root.appendChild(el);
  await sleep(2200);
  el.remove();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return c;
    }
  });
}

