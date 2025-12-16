import { setTone } from "./dom.js";

export function createCombobox({ id, label, description, placeholder, required, options, onInput, onBlur }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";

  const labelEl = document.createElement("label");
  labelEl.setAttribute("for", id);
  labelEl.innerHTML = required ? `${label} <span class="req" aria-hidden="true">*</span>` : label;
  wrapper.appendChild(labelEl);

  if (description) {
    const descEl = document.createElement("div");
    descEl.className = "field-description";
    descEl.textContent = description;
    wrapper.appendChild(descEl);
  }

  const box = document.createElement("div");
  box.className = "combobox";
  box.setAttribute("role", "combobox");
  box.setAttribute("aria-expanded", "false");
  box.setAttribute("aria-haspopup", "listbox");

  const input = document.createElement("input");
  input.className = "combobox-input";
  input.type = "text";
  input.id = id;
  input.name = id;
  input.placeholder = placeholder || "";
  input.autocomplete = "off";
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", `${id}-listbox`);
  box.appendChild(input);

  const listbox = document.createElement("ul");
  listbox.className = "combobox-listbox";
  listbox.id = `${id}-listbox`;
  listbox.setAttribute("role", "listbox");
  listbox.hidden = true;
  box.appendChild(listbox);

  const msg = document.createElement("div");
  msg.className = "field-msg";
  msg.id = `msg-${id}`;

  wrapper.appendChild(box);
  wrapper.appendChild(msg);

  let allOptions = options || [];
  let filtered = allOptions;
  let activeIndex = -1;

  function open() {
    listbox.hidden = false;
    box.setAttribute("aria-expanded", "true");
  }

  function close() {
    listbox.hidden = true;
    box.setAttribute("aria-expanded", "false");
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");
  }

  function render() {
    listbox.innerHTML = "";
    if (!filtered.length) {
      const empty = document.createElement("li");
      empty.className = "combobox-empty";
      empty.textContent = "No options";
      empty.setAttribute("role", "option");
      listbox.appendChild(empty);
      return;
    }

    filtered.forEach((opt, idx) => {
      const li = document.createElement("li");
      li.className = "combobox-option";
      li.id = `${id}-opt-${idx}`;
      li.setAttribute("role", "option");
      li.setAttribute("data-value", opt.value);
      li.textContent = opt.label || opt.value;
      if (opt.description) li.title = opt.description;
      li.setAttribute("aria-selected", String(idx === activeIndex));
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        select(idx);
      });
      listbox.appendChild(li);
    });
  }

  function filter() {
    const q = input.value.trim().toLowerCase();
    if (!q) filtered = allOptions;
    else {
      filtered = allOptions.filter((opt) => {
        const v = String(opt.value || "").toLowerCase();
        const l = String(opt.label || opt.value || "").toLowerCase();
        return v.includes(q) || l.includes(q);
      });
    }
    activeIndex = filtered.length ? 0 : -1;
    render();
  }

  function highlight(index) {
    if (!filtered.length) return;
    activeIndex = Math.max(0, Math.min(index, filtered.length - 1));
    for (let i = 0; i < listbox.children.length; i++) {
      const li = listbox.children[i];
      if (!(li instanceof HTMLElement)) continue;
      li.setAttribute("aria-selected", String(i === activeIndex));
    }
    const active = listbox.querySelector(`#${id}-opt-${activeIndex}`);
    if (active) input.setAttribute("aria-activedescendant", active.id);
  }

  function select(index) {
    const opt = filtered[index];
    if (!opt) return;
    input.value = opt.value;
    close();
    onInput?.(input.value);
  }

  function updateOptions(next) {
    allOptions = next || [];
    filtered = allOptions;
    activeIndex = filtered.length ? 0 : -1;
    render();
  }

  input.addEventListener("focus", () => {
    filter();
    open();
  });

  input.addEventListener("input", () => {
    filter();
    open();
    onInput?.(input.value);
  });

  input.addEventListener("blur", () => {
    window.setTimeout(() => close(), 80);
    onBlur?.(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      if (listbox.hidden) open();
      highlight(activeIndex + 1);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp") {
      if (listbox.hidden) open();
      highlight(activeIndex - 1);
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") {
      if (!listbox.hidden && filtered.length && activeIndex >= 0) {
        select(activeIndex);
        e.preventDefault();
      }
    }
  });

  function setError(text) {
    msg.textContent = text || "";
    setTone(msg, text ? "danger" : "");
    input.setAttribute("aria-invalid", text ? "true" : "false");
  }

  render();

  return {
    el: wrapper,
    input,
    updateOptions,
    setError,
    setValue(value) {
      input.value = value || "";
    },
  };
}

