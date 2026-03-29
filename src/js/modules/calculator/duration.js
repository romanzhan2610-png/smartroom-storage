/**
 * Управление сроком хранения: ввод кол-ва месяцев и переключатель rolling-плана.
 */
export function initDuration() {
  const durationMinus = document.getElementById("durationMinus");
  const durationPlus = document.getElementById("durationPlus");
  const durationInput = document.getElementById("durationInput");
  const rollingPlanToggle = document.getElementById("rollingPlanToggle");
  const durationPromo = document.getElementById("durationPromo");
  const rollingText = document.getElementById("rollingText");
  const qtyControlWrap = document.querySelector(".duration-qty");

  let isRolling = false;

  durationMinus.addEventListener("click", () => {
    const val = parseInt(durationInput.value);
    if (val > 1) durationInput.value = val - 1;
  });

  durationPlus.addEventListener("click", () => {
    const val = parseInt(durationInput.value);
    if (val < 36) durationInput.value = val + 1;
  });

  rollingPlanToggle.addEventListener("click", () => {
    isRolling = !isRolling;
    qtyControlWrap.classList.toggle("is-disabled", isRolling);
    durationPromo.style.display = isRolling ? "none" : "";
    rollingText.style.display = isRolling ? "block" : "none";
    rollingPlanToggle.textContent = isRolling ? "I know my duration" : "Not sure how long?";
  });

  return {
    getDuration: () => parseInt(durationInput.value),
    isRollingPlan: () => isRolling,
  };
}
