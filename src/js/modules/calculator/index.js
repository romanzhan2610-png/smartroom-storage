import { initPostcode } from "./postcode.js";
import { initItems } from "./items.js";
import { initDuration } from "./duration.js";
import { animateExpand, animateCollapse } from "./animations.js";

/**
 * Точка входа калькулятора. Собирает DOM-узлы и инициализирует субмодули.
 */
export function initCalculator() {
  gsap.registerPlugin(ScrollToPlugin);

  // --- DOM-узлы ---
  const toggleButtons = document.querySelectorAll(".storage-toggle-btn");
  const hiddenInput = document.getElementById("storageType");
  const form = document.getElementById("storageForm");
  const errorText = form.querySelector(".storage-form__error-text");
  const panel = document.getElementById("formPanel");
  const messages = document.querySelector(".storage-form__messages");

  const initialView = document.getElementById("initialView");
  const expandedView = document.getElementById("expandedView");
  const sharedToggle = document.getElementById("sharedToggle");
  const toggleExpandedSlot = document.getElementById("toggleExpandedSlot");
  const backBtn = document.querySelector(".calc-back-btn");

  const currentPostcodeInput = document.getElementById("postcode");
  const mainAutocomplete = document.querySelector(".main-autocomplete");
  const postcodePill = document.getElementById("postcodePill");
  const postcodeSearchMode = document.getElementById("postcodeSearchMode");
  const postcodeText = document.querySelector(".calc-postcode-text");
  const editInput = document.querySelector(".calc-edit-input");
  const editAutocomplete = document.querySelector(".edit-autocomplete");

  const calcBoxesView = document.getElementById("calcBoxesView");
  const calcFurnitureView = document.getElementById("calcFurnitureView");

  // --- Субмодули ---
  const postcode = initPostcode({
    form, errorText, currentPostcodeInput, mainAutocomplete,
    postcodePill, postcodeSearchMode, postcodeText,
    editInput, editAutocomplete,
  });

  initItems({
    boxesItemsList: document.getElementById("boxesItemsList"),
    summaryItems: document.getElementById("summaryItems"),
    summarySubtotal: document.getElementById("summarySubtotal"),
    summaryTotal: document.getElementById("summaryTotal"),
    boxesContinueBtn: document.getElementById("boxesContinueBtn"),
    mobileSummaryTotal: document.getElementById("mobileSummaryTotal"),
    mobileContinueBtn: document.getElementById("mobileContinueBtn"),
  });

  initDuration();

  // --- Мобильный аккордеон корзины ---
  const summaryCard = document.getElementById("summaryCard");
  const summaryMobileToggle = document.getElementById("summaryMobileToggle");
  if (summaryMobileToggle) {
    summaryMobileToggle.addEventListener("click", () =>
      summaryCard.classList.toggle("is-expanded")
    );
  }

  // --- Переключатель типа хранения (Boxes / Furniture) ---
  function switchCalculator(targetValue) {
    const viewToHide = targetValue === "boxes" ? calcFurnitureView : calcBoxesView;
    const viewToShow = targetValue === "boxes" ? calcBoxesView : calcFurnitureView;

    if (panel.classList.contains("is-expanded")) {
      gsap.to(viewToHide, {
        opacity: 0, duration: 0.2,
        onComplete: () => {
          viewToHide.style.display = "none";
          viewToShow.style.display = "flex";
          gsap.to(viewToShow, { opacity: 1, duration: 0.3, ease: "power2.out" });
        },
      });
    } else {
      viewToHide.style.display = "none";
      viewToHide.style.opacity = "0";
      viewToShow.style.display = "flex";
      viewToShow.style.opacity = "1";
    }
  }

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.classList.contains("is-active")) return;
      toggleButtons.forEach((btn) => btn.classList.remove("is-active"));
      this.classList.add("is-active");
      hiddenInput.value = this.getAttribute("data-value");
      switchCalculator(this.getAttribute("data-value"));
    });
  });

  // --- Сабмит формы → анимация раскрытия ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = currentPostcodeInput ? currentPostcodeInput.value.trim() : "";
    if (!value || !postcode.validate(value)) {
      gsap.to(form.querySelector(".storage-form__helper"), { opacity: 0, duration: 0.2 });
      gsap.to(errorText, { opacity: 1, duration: 0.2 });
      errorText.textContent = !value
        ? "Please enter your Postcode to continue"
        : "We currently do not serve this area.";
      form.classList.add("is-invalid");
      if (currentPostcodeInput) currentPostcodeInput.focus();
      return;
    }

    postcode.setSaved(value.toUpperCase());
    postcodeText.textContent = postcode.getSaved();
    form.classList.remove("is-invalid");

    const submitBtn = form.querySelector(".storage-form__submit");
    if (submitBtn) submitBtn.classList.add("is-loading");
    if (currentPostcodeInput) currentPostcodeInput.disabled = true;

    setTimeout(() => {
      if (submitBtn) submitBtn.classList.remove("is-loading");
      messages.style.display = "none";

      animateExpand({ panel, initialView, expandedView, sharedToggle, toggleExpandedSlot, messages });
    }, 800);
  });

  // --- Кнопка Назад → анимация схлопывания ---
  backBtn.addEventListener("click", () => {
    animateCollapse({
      panel, initialView, expandedView, sharedToggle, messages,
      currentPostcodeInput,
      revertToPill: postcode.revertToPill,
      postcodeSearchMode,
    });
  });
}
