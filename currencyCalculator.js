/**
 * Модуль для обработки валюты (Экю/Пропуски) и проверки наличия товаров
 */

// 1. ПРОВЕРКА НАЛИЧИЯ (для шторки товара)
// Принимает объект stocks из JSON и текущий выбранный сервер (например, "🇷🇺" или "🇪🇦")
export function isProductAvailable(stocks, currentServer) {
    if (!stocks || !currentServer) return false;
    
    const stockValue = stocks[currentServer];
    
    // Если "Неограниченно", то товар есть
    if (stockValue === "Неограниченно") return true;
    
    // Если это число, проверяем, что оно больше нуля
    const count = parseInt(stockValue, 10);
    return !isNaN(count) && count > 0;
}

// 2. ЛОГИКА ДЛЯ ЭКЮ
// Принимает введенное пользователем количество
export function calculateEcuCommission(amount) {
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return { error: "Введите корректное количество Экю" };
    }

    // Считаем комиссию Лошади +10% (округление вниз)
    const finalPriceWithCommission = Math.floor(parsedAmount * 1.1);
    
    return {
        success: true,
        amount: parsedAmount,
        finalPriceWithCommission,
        instruction: `Поставьте X коней на продажу за ${finalPriceWithCommission.toLocaleString()} экю`
    };
}

// 3. ЛОГИКА ДЛЯ ПРОПУСКОВ
// Принимает количество, флаг срочности (true/false) и ник игрока
export function calculatePasses(quantity, isUrgent, nickname) {
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return { error: "Укажите корректное количество пропусков" };
    }

    // Если меньше 10 товаров — ник обязателен
    if (parsedQuantity < 10 && (!nickname || nickname.trim() === "")) {
        return { error: "Для заказа менее 10 пропусков обязательно введите игровой ник!" };
    }

    // Считаем цену: срочно = 150р, не срочно = 75р за штуку
    const pricePerUnit = isUrgent ? 150 : 75;
    const totalPrice = parsedQuantity * pricePerUnit;
    const deliveryTime = isUrgent ? "Срочно" : "После 21:00 МСК";

    return {
        success: true,
        quantity: parsedQuantity,
        totalPrice,
        deliveryTime,
        // Передаем ник только если количество меньше 10
        playerNickname: parsedQuantity < 10 ? nickname.trim() : null
    };
}
