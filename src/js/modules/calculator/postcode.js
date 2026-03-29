import { mockPostcodes } from "./data.js";

/**
 * Управление постиндексом: автокомплит, валидация, пилюля/режим редактирования.
 * @param {object} deps - Зависимости из DOM
 * @returns {{ validate, getSaved, setSaved, revertToPill }}
 */
export function initPostcode({
  form,
  errorText,
  currentPostcodeInput,
  mainAutocomplete,
  postcodePill,
  postcodeSearchMode,
  postcodeText,
  editInput,
  editAutocomplete,
}) {
  let savedPostcode = "";

  function validate(value) {
    const clean = value.replace(/\s+/g, "").toUpperCase();
    return mockPostcodes.some((p) => p.replace(/\s+/g, "").toUpperCase() === clean);
  }

  function revertToPill() {
    postcodeSearchMode.style.display = "none";
    postcodePill.style.display = "flex";
    editAutocomplete.style.display = "none";
  }

  function renderDropdown(inputEl, listEl, matches, onSelect) {
    listEl.innerHTML = "";
    if (matches.length === 0) {
      listEl.style.display = "none";
      return;
    }
    listEl.style.display = "block";
    matches.forEach((match) => {
      const li = document.createElement("li");
      li.className = "autocomplete-item";
      li.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:bottom;margin-right:8px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${match}`;
      li.addEventListener("click", () => {
        inputEl.value = match;
        listEl.style.display = "none";
        if (onSelect) onSelect(match);
      });
      listEl.appendChild(li);
    });
  }

  function setupAutocomplete(inputEl, listEl, onSelectCallback) {
    inputEl.addEventListener("input", () => {
      const val = inputEl.value.trim().toLowerCase();

      if (inputEl === currentPostcodeInput && form.classList.contains("is-invalid")) {
        form.classList.remove("is-invalid");
        gsap.to(errorText, { opacity: 0, duration: 0.2 });
        gsap.to(form.querySelector(".storage-form__helper"), { opacity: 1, duration: 0.2 });
      }
      if (inputEl === editInput && postcodeSearchMode.classList.contains("is-error")) {
        postcodeSearchMode.classList.remove("is-error");
      }

      if (!val) { listEl.style.display = "none"; return; }

      const matches = mockPostcodes.filter((p) =>
        p.toLowerCase().includes(val.replace(/\s+/g, ""))
      );
      renderDropdown(inputEl, listEl, matches, onSelectCallback);
    });

    document.addEventListener("click", (e) => {
      if (!inputEl.contains(e.target) && !listEl.contains(e.target)) {
        listEl.style.display = "none";
        if (inputEl === editInput && postcodeSearchMode.style.display !== "none") {
          revertToPill();
        }
      }
    });
  }

  function saveEdited(val) {
    if (!validate(val)) {
      postcodeSearchMode.classList.add("is-error");
      gsap.fromTo(postcodeSearchMode, { x: -5 }, { x: 5, duration: 0.1, yoyo: true, repeat: 3 });
      return;
    }
    postcodeSearchMode.classList.remove("is-error");
    savedPostcode = val.toUpperCase();
    postcodeText.textContent = savedPostcode;
    currentPostcodeInput.value = savedPostcode;
    revertToPill();
  }

  // Назначаем слушателей
  setupAutocomplete(currentPostcodeInput, mainAutocomplete);
  setupAutocomplete(editInput, editAutocomplete, (selected) => saveEdited(selected));

  postcodePill.addEventListener("click", (e) => {
    e.stopPropagation();
    postcodePill.style.display = "none";
    postcodeSearchMode.style.display = "flex";
    editInput.value = "";
    editInput.focus();
  });

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); saveEdited(editInput.value); }
    else if (e.key === "Escape") { revertToPill(); }
  });

  return {
    validate,
    getSaved: () => savedPostcode,
    setSaved: (v) => { savedPostcode = v; },
    revertToPill,
  };
}
