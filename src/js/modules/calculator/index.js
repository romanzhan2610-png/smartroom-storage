import { mockPostcodes, boxItemsData } from "./data.js";

export function initCalculator() {
  gsap.registerPlugin(ScrollToPlugin);

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
  const heroTitle = document.querySelector(".storage-hero__title");

  const currentPostcodeInput = document.getElementById("postcode");
  const mainAutocomplete = document.querySelector(".main-autocomplete");

  const postcodePill = document.getElementById("postcodePill");
  const postcodeSearchMode = document.getElementById("postcodeSearchMode");
  const postcodeText = document.querySelector(".calc-postcode-text");
  const editInput = document.querySelector(".calc-edit-input");
  const editAutocomplete = document.querySelector(".edit-autocomplete");

  const calcBoxesView = document.getElementById("calcBoxesView");
  const calcFurnitureView = document.getElementById("calcFurnitureView");

  let savedPostcode = "";

  function getRelativePos(element, container) {
    const elRect = element.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const compStyle = window.getComputedStyle(container);
    const borderTop = parseFloat(compStyle.borderTopWidth) || 0;
    const borderLeft = parseFloat(compStyle.borderLeftWidth) || 0;

    return {
      top: elRect.top - contRect.top - borderTop,
      left: elRect.left - contRect.left - borderLeft,
      width: elRect.width,
      height: elRect.height,
    };
  }

  function validatePostcodeAgainstMock(value) {
    const cleanVal = value.replace(/\s+/g, "").toUpperCase();
    return mockPostcodes.some(
      (p) => p.replace(/\s+/g, "").toUpperCase() === cleanVal,
    );
  }

  function setupAutocomplete(inputEl, listEl, onSelectCallback) {
    inputEl.addEventListener("input", () => {
      const val = inputEl.value.trim().toLowerCase();
      listEl.innerHTML = "";

      if (
        inputEl === currentPostcodeInput &&
        form.classList.contains("is-invalid")
      ) {
        form.classList.remove("is-invalid");
        gsap.to(errorText, { opacity: 0, duration: 0.2 });
        gsap.to(form.querySelector(".storage-form__helper"), {
          opacity: 1,
          duration: 0.2,
        });
      }

      if (
        inputEl === editInput &&
        postcodeSearchMode.classList.contains("is-error")
      ) {
        postcodeSearchMode.classList.remove("is-error");
      }

      if (!val) {
        listEl.style.display = "none";
        return;
      }

      const matches = mockPostcodes.filter((p) =>
        p.toLowerCase().includes(val.replace(/\s+/g, "")),
      );
      if (matches.length > 0) {
        listEl.style.display = "block";
        matches.forEach((match) => {
          const li = document.createElement("li");
          li.className = "autocomplete-item";
          li.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: bottom; margin-right: 8px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${match}`;
          li.addEventListener("click", () => {
            inputEl.value = match;
            listEl.style.display = "none";
            if (onSelectCallback) onSelectCallback(match);
          });
          listEl.appendChild(li);
        });
      } else {
        listEl.style.display = "none";
      }
    });

    document.addEventListener("click", (e) => {
      if (!inputEl.contains(e.target) && !listEl.contains(e.target)) {
        listEl.style.display = "none";
        if (
          inputEl === editInput &&
          postcodeSearchMode.style.display !== "none"
        ) {
          revertToPill();
        }
      }
    });
  }

  setupAutocomplete(currentPostcodeInput, mainAutocomplete);

  setupAutocomplete(editInput, editAutocomplete, (selected) => {
    saveEditedPostcode(selected);
  });

  function saveEditedPostcode(val) {
    if (!validatePostcodeAgainstMock(val)) {
      postcodeSearchMode.classList.add("is-error");
      gsap.fromTo(
        postcodeSearchMode,
        { x: -5 },
        { x: 5, duration: 0.1, yoyo: true, repeat: 3 },
      );
      return;
    }

    postcodeSearchMode.classList.remove("is-error");
    postcodeText.textContent = val.toUpperCase();
    savedPostcode = val.toUpperCase();
    currentPostcodeInput.value = savedPostcode;
    revertToPill();
  }

  function revertToPill() {
    postcodeSearchMode.style.display = "none";
    postcodePill.style.display = "flex";
    editAutocomplete.style.display = "none";
  }

  postcodePill.addEventListener("click", (e) => {
    e.stopPropagation();
    postcodePill.style.display = "none";
    postcodeSearchMode.style.display = "flex";
    editInput.value = "";
    editInput.focus();
  });

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEditedPostcode(editInput.value);
    } else if (e.key === "Escape") {
      revertToPill();
    }
  });

  function switchCalculator(targetValue) {
    const isExpanded = panel.classList.contains("is-expanded");

    const viewToHide =
      targetValue === "boxes" ? calcFurnitureView : calcBoxesView;
    const viewToShow =
      targetValue === "boxes" ? calcBoxesView : calcFurnitureView;

    if (isExpanded) {
      gsap.to(viewToHide, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          viewToHide.style.display = "none";
          viewToShow.style.display = "flex";
          gsap.to(viewToShow, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        },
      });
    } else {
      viewToHide.style.display = "none";
      viewToHide.style.opacity = 0;
      viewToShow.style.display = "flex";
      viewToShow.style.opacity = 1;
    }
  }

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.classList.contains("is-active")) return;
      toggleButtons.forEach((btn) => btn.classList.remove("is-active"));
      this.classList.add("is-active");

      const selectedValue = this.getAttribute("data-value");
      hiddenInput.value = selectedValue;
      switchCalculator(selectedValue);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const postcode = currentPostcodeInput
      ? currentPostcodeInput.value.trim()
      : "";

    if (!postcode || !validatePostcodeAgainstMock(postcode)) {
      gsap.to(form.querySelector(".storage-form__helper"), {
        opacity: 0,
        duration: 0.2,
      });
      gsap.to(errorText, { opacity: 1, duration: 0.2 });
      errorText.textContent = !postcode
        ? "Please enter your Postcode to continue"
        : "We currently do not serve this area.";
      form.classList.add("is-invalid");
      if (currentPostcodeInput) currentPostcodeInput.focus();
      return;
    }

    savedPostcode = postcode.toUpperCase();
    postcodeText.textContent = savedPostcode;
    form.classList.remove("is-invalid");
    const currentSubmitBtn = form.querySelector(".storage-form__submit");

    if (currentSubmitBtn) currentSubmitBtn.classList.add("is-loading");
    if (currentPostcodeInput) currentPostcodeInput.disabled = true;

    setTimeout(() => {
      if (currentSubmitBtn) currentSubmitBtn.classList.remove("is-loading");
      messages.style.display = "none";

      const startPos = getRelativePos(sharedToggle, panel);

      const startSpacer = document.createElement("div");
      startSpacer.style.cssText = `width: ${startPos.width}px; height: ${startPos.height}px; flex-shrink: 0; box-sizing: border-box;`;
      sharedToggle.parentNode.replaceChild(startSpacer, sharedToggle);

      const origPanelCss = panel.style.cssText;
      panel.classList.add("is-expanded");
      initialView.style.display = "none";
      expandedView.style.display = "block";
      expandedView.style.opacity = "1";
      panel.style.cssText =
        "max-width: 100%; width: 100%; min-height: 75vh; padding: 20px; height: auto; border-radius: 0px;";

      toggleExpandedSlot.appendChild(sharedToggle);
      const _forceLayout = panel.offsetHeight;

      const endPos = getRelativePos(sharedToggle, panel);

      const endSpacer = document.createElement("div");
      endSpacer.style.cssText = `width: ${endPos.width}px; height: ${endPos.height}px; flex-shrink: 0; box-sizing: border-box;`;
      sharedToggle.parentNode.replaceChild(endSpacer, sharedToggle);

      panel.appendChild(sharedToggle);
      gsap.set(sharedToggle, {
        position: "absolute",
        top: 0,
        left: 0,
        x: startPos.left,
        y: startPos.top,
        width: startPos.width,
        height: startPos.height,
        margin: 0,
        boxSizing: "border-box",
        zIndex: 50,
      });

      panel.classList.remove("is-expanded");
      panel.style.cssText = origPanelCss;
      initialView.style.display = "flex";
      expandedView.style.display = "none";

      const initialElementsToHide = initialView.querySelectorAll(
        ".storage-form__divider, .storage-form__action-group",
      );

      gsap.to(initialElementsToHide, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          initialView.style.display = "none";
          expandedView.style.display = "block";
          expandedView.style.opacity = "1";

          const expandedElementsToFadeIn = expandedView.querySelectorAll(
            ".calc-back-btn, .calc-postcode-display, .calc-content",
          );
          gsap.set(expandedElementsToFadeIn, { opacity: 0 });

          gsap.to(sharedToggle, {
            x: endPos.left,
            y: endPos.top,
            width: endPos.width,
            height: endPos.height,
            duration: 0.8,
            ease: "expo.inOut",
            onComplete: () => {
              gsap.set(sharedToggle, { clearProps: "all" });
              endSpacer.parentNode.replaceChild(sharedToggle, endSpacer);
              if (startSpacer.parentNode) startSpacer.remove();
            },
          });

      );

    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 0.8,
      ease: "power2.inOut",
    });
  });

let selectedBoxesState = {};

const boxesItemsList = document.getElementById("boxesItemsList");
const summaryItems = document.getElementById("summaryItems");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");
const boxesContinueBtn = document.getElementById("boxesContinueBtn");

function renderBoxesItems() {
  boxesItemsList.innerHTML = "";
  boxItemsData.forEach((item) => {
    selectedBoxesState[item.id] = 0;

    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
            <div class="item-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div class="item-info">
                <div class="item-title">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
            </div>
            <div class="qty-control">
                <button type="button" class="qty-btn calc-minus" data-id="${item.id}">−</button>
                <input type="number" class="qty-input item-qty-val" id="qty_${item.id}" value="0" readonly>
                <button type="button" class="qty-btn calc-plus" data-id="${item.id}">+</button>
            </div>
        `;
    boxesItemsList.appendChild(row);
  });

  document.querySelectorAll("#boxesItemsList .calc-minus").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      updateItemQty(e.target.dataset.id, -1),
    );
  });
  document.querySelectorAll("#boxesItemsList .calc-plus").forEach((btn) => {
    btn.addEventListener("click", (e) => updateItemQty(e.target.dataset.id, 1));
  });
}

function updateItemQty(id, change) {
  let currentQty = selectedBoxesState[id];
  let newQty = currentQty + change;
  if (newQty < 0) newQty = 0;

  selectedBoxesState[id] = newQty;
  document.getElementById(`qty_${id}`).value = newQty;

  updateSummary();
}

function updateSummary() {
  let subtotal = 0;
  let hasItems = false;
  summaryItems.innerHTML = "";

  boxItemsData.forEach((item) => {
    const qty = selectedBoxesState[item.id];
    if (qty > 0) {
      hasItems = true;
      const itemTotal = qty * item.price;
      subtotal += itemTotal;

      const line = document.createElement("div");
      line.className = "summary-item-line";
      line.innerHTML = `<span>${qty}x ${item.name}</span> <span>£${itemTotal.toFixed(2)}</span>`;
      summaryItems.appendChild(line);
    }
  });

  if (!hasItems) {
    summaryItems.innerHTML =
      '<div class="summary-empty">Please select items to store.</div>';
    boxesContinueBtn.disabled = true;
  } else {
    boxesContinueBtn.disabled = false;
  }

  summarySubtotal.textContent = `£${subtotal.toFixed(2)}`;
  summaryTotal.textContent = `£${subtotal.toFixed(2)}`;
}

const durationMinus = document.getElementById("durationMinus");
const durationPlus = document.getElementById("durationPlus");
const durationInput = document.getElementById("durationInput");
const rollingPlanToggle = document.getElementById("rollingPlanToggle");
const durationPromo = document.getElementById("durationPromo");
const rollingText = document.getElementById("rollingText");
const qtyControlWrap = document.querySelector(".duration-qty");

let isRollingPlan = false;

durationMinus.addEventListener("click", () => {
  let val = parseInt(durationInput.value);
  if (val > 1) durationInput.value = val - 1;
});

durationPlus.addEventListener("click", () => {
  let val = parseInt(durationInput.value);
  if (val < 36) durationInput.value = val + 1;
});

rollingPlanToggle.addEventListener("click", () => {
  isRollingPlan = !isRollingPlan;
  if (isRollingPlan) {
    qtyControlWrap.classList.add("is-disabled");
    durationPromo.style.display = "none";
    rollingText.style.display = "block";
    rollingPlanToggle.textContent = "I know my duration";
  } else {
    qtyControlWrap.classList.remove("is-disabled");
    durationPromo.style.display = "block";
    rollingText.style.display = "none";
    rollingPlanToggle.textContent = "Not sure how long?";
  }
});

const summaryCard = document.getElementById("summaryCard");
const summaryMobileToggle = document.getElementById("summaryMobileToggle");
const mobileSummaryTotal = document.getElementById("mobileSummaryTotal");
const mobileContinueBtn = document.getElementById("mobileContinueBtn");

if (summaryMobileToggle) {
  summaryMobileToggle.addEventListener("click", () => {
    summaryCard.classList.toggle("is-expanded");
  });
}

const originalUpdateSummary = updateSummary;
updateSummary = function () {
  originalUpdateSummary();

  if (mobileSummaryTotal) {
    mobileSummaryTotal.textContent = summaryTotal.textContent;
  }

  if (mobileContinueBtn && boxesContinueBtn) {
    mobileContinueBtn.disabled = boxesContinueBtn.disabled;
  }
};

renderBoxesItems();
}
