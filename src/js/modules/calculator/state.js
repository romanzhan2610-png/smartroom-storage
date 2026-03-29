/**
 * Чистый Store данных калькулятора.
 * Хранит состояние и уведомляет подписчиков через simple pub/sub.
 * Не знает ничего о DOM.
 */
export const store = {
  currentTab: "boxes", // 'boxes' | 'furniture'

  modules: {
    items: null,    // { getData() }
    units: null,    // { getSelectedUnit() }
    durationBoxes: null,
    durationFurn: null,
  },

  // --- Pub/Sub ---
  _listeners: [],

  /**
   * Подписаться на изменения стора.
   * @param {function} fn - вызывается при каждом dispatch({ type, payload })
   */
  subscribe(fn) {
    this._listeners.push(fn);
  },

  /**
   * Оповестить всех подписчиков.
   * @param {object} event - { type: string, payload?: any }
   */
  dispatch(event) {
    this._listeners.forEach((fn) => fn(event, this.getSnapshot()));
  },

  /**
   * Снимок текущего состояния стора (чистые данные, без DOM).
   */
  getSnapshot() {
    const { currentTab, modules } = this;

    const itemsData = modules.items?.getData() ?? [];
    const selectedUnit = modules.units?.getSelectedUnit() ?? null;

    const durationModule =
      currentTab === "boxes" ? modules.durationBoxes : modules.durationFurn;
    const duration = durationModule?.getDuration() ?? null;
    const isRolling = durationModule?.isRollingPlan() ?? false;

    let subtotal = 0;
    let hasItems = false;
    const lines = [];

    if (currentTab === "boxes") {
      itemsData.forEach((item) => {
        if (item.qty > 0) {
          hasItems = true;
          const itemTotal = item.qty * item.price;
          subtotal += itemTotal;
          lines.push({ label: `${item.qty}x ${item.name}`, price: itemTotal, suffix: "" });
        }
      });
    } else {
      if (selectedUnit) {
        hasItems = true;
        subtotal = selectedUnit.price;
        lines.push({ label: `1x ${selectedUnit.name} (${selectedUnit.size})`, price: subtotal, suffix: "/wk" });
      }
    }

    return { currentTab, hasItems, subtotal, lines, duration, isRolling };
  },

  /** Вызывается из любого субмодуля при изменении данных */
  notify() {
    this.dispatch({ type: "UPDATE" });
  },
};
