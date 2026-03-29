import { boxItemsData } from "./data.js";

const BOX_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;

/**
 * Управление списком предметов: состояние, рендер строк, синхронизация Summary.
 * @param {object} deps - DOM-зависимости
 * @returns {{ getState, onSummaryUpdate }}
 */
export function initItems({
  boxesItemsList,
  summaryItems,
  summarySubtotal,
  summaryTotal,
  boxesContinueBtn,
  mobileSummaryTotal,
  mobileContinueBtn,
}) {
  const state = {};

  function updateQty(id, change) {
    state[id] = Math.max(0, (state[id] ?? 0) + change);
    const input = document.getElementById(`qty_${id}`);
    if (input) input.value = state[id];
    updateSummary();
  }

  function updateSummary() {
    let subtotal = 0;
    let hasItems = false;
    summaryItems.innerHTML = "";

    boxItemsData.forEach((item) => {
      const qty = state[item.id] ?? 0;
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
      summaryItems.innerHTML = '<div class="summary-empty">Please select items to store.</div>';
      boxesContinueBtn.disabled = true;
    } else {
      boxesContinueBtn.disabled = false;
    }

    summarySubtotal.textContent = `£${subtotal.toFixed(2)}`;
    summaryTotal.textContent = `£${subtotal.toFixed(2)}`;

    // Синхронизация мобильного хедера
    if (mobileSummaryTotal) mobileSummaryTotal.textContent = summaryTotal.textContent;
    if (mobileContinueBtn) mobileContinueBtn.disabled = boxesContinueBtn.disabled;
  }

  function render() {
    boxesItemsList.innerHTML = "";
    boxItemsData.forEach((item) => {
      state[item.id] = 0;
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <div class="item-icon">${BOX_SVG}</div>
        <div class="item-info">
          <div class="item-title">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn calc-minus" data-id="${item.id}">−</button>
          <input type="number" class="qty-input item-qty-val" id="qty_${item.id}" value="0" readonly>
          <button type="button" class="qty-btn calc-plus" data-id="${item.id}">+</button>
        </div>`;
      boxesItemsList.appendChild(row);
    });

    boxesItemsList.querySelectorAll(".calc-minus").forEach((btn) =>
      btn.addEventListener("click", (e) => updateQty(e.target.dataset.id, -1))
    );
    boxesItemsList.querySelectorAll(".calc-plus").forEach((btn) =>
      btn.addEventListener("click", (e) => updateQty(e.target.dataset.id, 1))
    );
  }

  render();

  return { getState: () => state };
}
