import { initPostcode } from "./postcode.js";
import { initItems } from "./items.js";
import { initUnits } from "./units.js";
import { initDuration } from "./duration.js";
import { animateExpand, animateCollapse } from "./animations.js";
import { store } from "./state.js";
import { initSidebar } from "./sidebar.js";

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

  // --- Субмодули (данные) ---
  const postcode = initPostcode({
    form, errorText, currentPostcodeInput, mainAutocomplete,
    postcodePill, postcodeSearchMode, postcodeText,
    editInput, editAutocomplete,
  });

  store.modules.items = initItems({
    container: document.getElementById("boxesItemsList"),
    onChange: () => store.notify(),
  });

  store.modules.units = initUnits({
    container: document.getElementById("unitsListContainer"),
    onChange: () => store.notify(),
  });

  store.modules.durationBoxes = initDuration({
    minusBtn: document.getElementById("durationMinus"),
    plusBtn: document.getElementById("durationPlus"),
    input: document.getElementById("durationInput"),
    toggleBtn: document.getElementById("rollingPlanToggle"),
    promoText: document.getElementById("durationPromo"),
    rollingText: document.getElementById("rollingText"),
    qtyWrap: document.querySelector("#calcBoxesView .duration-qty"),
  });

  store.modules.durationFurn = initDuration({
    minusBtn: document.getElementById("durationMinusFurn"),
    plusBtn: document.getElementById("durationPlusFurn"),
    input: document.getElementById("durationInputFurn"),
    toggleBtn: document.getElementById("rollingPlanToggleFurn"),
    promoText: document.getElementById("durationPromoFurn"),
    rollingText: document.getElementById("rollingTextFurn"),
    qtyWrap: document.getElementById("qtyWrapFurn"),
  });

  // --- UI Сайдбара (подписывается на стор и рендерит) ---
  initSidebar({
    store,
    summaryItems: document.getElementById("summaryItems"),
    summarySubtotal: document.getElementById("summarySubtotal"),
    summaryTotal: document.getElementById("summaryTotal"),
    continueBtn: document.getElementById("continueBtn"),
    mobileSummaryTotal: document.getElementById("mobileSummaryTotal"),
    mobileContinueBtn: document.getElementById("mobileContinueBtn"),
    summaryCard: document.getElementById("summaryCard"),
    summaryMobileToggle: document.getElementById("summaryMobileToggle"),
  });

  // --- Переключатель типа хранения (Boxes / Furniture) ---
  function switchCalculator(targetValue) {
    const viewToHide =
      targetValue === "boxes" ? calcFurnitureView : calcBoxesView;
    const viewToShow =
      targetValue === "boxes" ? calcBoxesView : calcFurnitureView;

    store.currentTab = targetValue;
    store.notify();

    if (panel.classList.contains("is-expanded")) {
      gsap.to(viewToHide, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          viewToHide.style.display = "none";
          viewToShow.style.display = "block"; // Changed to block, not flex, as it's a wrapper now
          gsap.to(viewToShow, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        },
      });
    } else {
      viewToHide.style.display = "none";
      viewToHide.style.opacity = "0";
      viewToShow.style.display = "block";
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

  // --- Сабмит формы ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = currentPostcodeInput ? currentPostcodeInput.value.trim() : "";
    if (!value || !postcode.validate(value)) {
      gsap.to(form.querySelector(".storage-form__helper"), {
        opacity: 0,
        duration: 0.2,
      });
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
      animateExpand({
        panel,
        initialView,
        expandedView,
        sharedToggle,
        toggleExpandedSlot,
        messages,
      });
    }, 800);
  });

  // --- Кнопка Назад ---
  backBtn.addEventListener("click", () => {
    animateCollapse({
      panel,
      initialView,
      expandedView,
      sharedToggle,
      messages,
      currentPostcodeInput,
      revertToPill: postcode.revertToPill,
      postcodeSearchMode,
    });
  });
}
