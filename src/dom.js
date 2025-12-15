export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function setTone(el, tone) {
  if (!el) return;
  if (!tone) {
    el.removeAttribute("data-tone");
    return;
  }
  el.setAttribute("data-tone", tone);
}

export function setText(el, text) {
  if (!el) return;
  el.textContent = text || "";
}

export function fillSelect(select, options, { placeholder = "Select…" } = {}) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = "";

  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.appendChild(first);

  for (const value of options) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  }

  if (options.includes(current)) select.value = current;
}

export function fillSelectTerms(select, terms, { placeholder = "Select…" } = {}) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = "";

  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.appendChild(first);

  for (const term of terms || []) {
    if (!term?.value) continue;
    const opt = document.createElement("option");
    opt.value = term.value;
    opt.textContent = term.label || term.value;
    if (term.description) opt.title = term.description;
    select.appendChild(opt);
  }

  const values = (terms || []).map((t) => t?.value).filter(Boolean);
  if (values.includes(current)) select.value = current;
}
