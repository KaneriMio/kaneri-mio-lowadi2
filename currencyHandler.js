/**
 * Изолированный модуль калькуляторов для Экю и Пропусков
 */

// Переменные для хранения текущего настраиваемого товара
let currentCurrencyItem = null;

// --- ЛОГИКА ДЛЯ ЭКЮ ---
export function openEcuCalculatorModal(item) {
  currentCurrencyItem = item;
  
  // Показываем вашу модалку для Экю (убедитесь, что ID совпадают с вашей версткой)
  const ecuModal = document.getElementById('ecuCalculatorModal');
  const overlay = document.getElementById('overlay'); // или ваш глобальный overlay
  
  if (ecuModal && overlay) {
    // Сбрасываем инпуты перед открытием
    document.getElementById('ecuAmountInput').value = '';
    document.getElementById('ecuInstructionText').innerHTML = '';
    
    overlay.classList.add('active');
    ecuModal.classList.add('active');
  }
}

// Вызывается при изменении количества пропусков (чтобы скрывать/показывать поле Никнейма)
export function handlePassesInputChange() {
  const quantity = parseInt(document.getElementById('passesQuantityInput').value, 10);
  const nicknameBlock = document.getElementById('passesNicknameBlock');
  
  if (nicknameBlock) {
    // Если 10 или больше товаров (пропусков) — блок ввода игрового ника скрывается
    if (!isNaN(quantity) && quantity >= 10) {
      nicknameBlock.style.style.display = 'none';
    } else {
      nicknameBlock.style.display = 'block';
    }
  }
}

// Клик на кнопку "Добавить в корзину" внутри модалки Пропусков
export function submitPassesToCart() {
  const quantity = parseInt(document.getElementById('passesQuantityInput').value, 10);
  const nickname = document.getElementById('passesNicknameInput').value.trim();
  const isUrgent = document.getElementById('passesUrgentCheckbox').checked; // Чекбокс: срочно / не срочно

  if (isNaN(quantity) || quantity <= 0) return alert('Укажите корректное количество');

  // Валидация: если меньше 10 товаров, обязательно ввести игровой ник
  if (quantity < 10 && !nickname) {
    return alert('Для заказа менее 10 пропусков обязательно введите игровой ник!');
  }

  // Расчет цены: срочно -> 150р/шт, не срочно -> 75р/шт
  const pricePerUnit = isUrgent ? 150 : 75;
  const totalPrice = quantity * pricePerUnit;
  const urgencyStatus = isUrgent ? 'Срочно' : 'Не срочно (выдача после 21:00 МСК)';

  const customPassItem = {
    ...currentCurrencyItem,
    quantity: quantity,
    price: totalPrice, // Перезаписываем итоговую стоимость в рублях
    urgency: urgencyStatus, // Сохраняем срочность для отображения в корзине
    playerNick: quantity < 10 ? nickname : null // Ник отображается только если < 10
  };

  pushToCartAndCloseModals(customPassItem);
}

// Вспомогательная функция закрытия окон и отправки в массив
function pushToCartAndCloseModals(finalItem) {
  // 1. Добавляем в ваш глобальный массив корзины
  cart.push(finalItem);
  
  // 2. Закрываем модалки
  const overlay = document.getElementById('overlay');
  document.getElementById('ecuCalculatorModal')?.classList.remove('active');
  document.getElementById('passesCalculatorModal')?.classList.remove('active');
  overlay?.classList.remove('active');
  
  // 3. Вызываем ваше обновление интерфейса корзины (подставьте ваше точное название функции)
  if (typeof updateCartUI === 'function') {
    updateCartUI();
  }
}
window.openEcuCalculatorModal = openEcuCalculatorModal;
window.handleEcuCalculation = handleEcuCalculation;
window.submitEcuToCart = submitEcuToCart;

window.openPassesCalculatorModal = openPassesCalculatorModal;
window.handlePassesInputChange = handlePassesInputChange;
window.submitPassesToCart = submitPassesToCart;