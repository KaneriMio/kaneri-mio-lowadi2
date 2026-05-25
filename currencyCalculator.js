/**
 * Currency Calculator — ПОЛНОСТЬЮ без module (совместим с index.html)
 */

// -------------------------
// 1. ПРОВЕРКА НАЛИЧИЯ
// -------------------------
function isProductAvailable(stocks, currentServer) {
  if (!stocks || !currentServer) return false;

  const stockValue = stocks[currentServer];

  if (stockValue === "Неограниченно") return true;

  const count = parseInt(stockValue, 10);
  return !isNaN(count) && count > 0;
}

// -------------------------
// 2. ЭКЮ
// -------------------------
function calculateEcuCommission(amount) {
  const parsedAmount = parseInt(amount, 10);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { error: "Введите корректное количество Экю" };
  }

  const finalPriceWithCommission = Math.floor(parsedAmount * 1.1);

  return {
    success: true,
    amount: parsedAmount,
    finalPriceWithCommission,
    instruction:
      `Поставьте X коней на продажу за ${finalPriceWithCommission.toLocaleString()} экю`
  };
}

// -------------------------
// 3. ПРОПУСКИ
// -------------------------
function calculatePasses(quantity, isUrgent, nickname) {
  const parsedQuantity = parseInt(quantity, 10);

  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return { error: "Укажите корректное количество пропусков" };
  }

  if (parsedQuantity < 10 && (!nickname || nickname.trim() === "")) {
    return { error: "Для заказа менее 10 пропусков обязательно введите игровой ник!" };
  }

  const pricePerUnit = isUrgent ? 150 : 75;
  const totalPrice = parsedQuantity * pricePerUnit;
  const deliveryTime = isUrgent ? "Срочно" : "После 21:00 МСК";

  return {
    success: true,
    quantity: parsedQuantity,
    totalPrice,
    deliveryTime,
    playerNickname: parsedQuantity < 10 ? nickname.trim() : null
  };
}

// -------------------------
// ПРИВЯЗКА В WINDOW (КРИТИЧНО)
// -------------------------
window.isProductAvailable = isProductAvailable;
window.calculateEcuCommission = calculateEcuCommission;
window.calculatePasses = calculatePasses;