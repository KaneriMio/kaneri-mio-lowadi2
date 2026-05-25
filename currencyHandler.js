/**
 * Currency Handler — рабочая версия БЕЗ modules
 * (совместима с обычным <script src="...">)
 */

// -------------------------
// ТЕКУЩИЙ ТОВАР
// -------------------------
let currentCurrencyItem = null;

// -------------------------
// ЭКЮ
// -------------------------
function openEcuCalculatorModal(item) {
  currentCurrencyItem = item;

  const ecuModal = document.getElementById('ecuCalculatorModal');
  const overlay = document.getElementById('overlay');

  if (!ecuModal || !overlay) return;

  const amountInput = document.getElementById('ecuAmountInput');
  const instructionText = document.getElementById('ecuInstructionText');

  if (amountInput) amountInput.value = '';
  if (instructionText) instructionText.innerHTML = '';

  overlay.classList.add('active');
  ecuModal.classList.add('active');
}

function handleEcuCalculation() {
  const amountInput = document.getElementById('ecuAmountInput');
  const instructionText = document.getElementById('ecuInstructionText');

  if (!amountInput || !instructionText) return false;

  const amount = parseInt(amountInput.value, 10);

  if (isNaN(amount) || amount <= 0) {
    instructionText.innerText = "Введите корректное количество";
    return false;
  }

  const finalPriceWithCommission = Math.floor(amount * 1.1);

  instructionText.innerHTML =
    `Поставьте X коней на продажу за <strong>${finalPriceWithCommission.toLocaleString()}</strong> экю`;

  return finalPriceWithCommission;
}

function submitEcuToCart() {
  const finalEcu = handleEcuCalculation();
  const amountInput = document.getElementById('ecuAmountInput');

  if (!finalEcu || !amountInput) {
    alert('Проверьте введенные данные');
    return;
  }

  const amount = parseInt(amountInput.value, 10);

  const item = {
    ...currentCurrencyItem,
    quantity: amount,
    customAmount: amount,
    totalEcuToSet: finalEcu,
    price: currentCurrencyItem.price * amount,
    isEcuCurrency: true
  };

  pushToCartAndClose(item);
}

// -------------------------
// ПРОПУСКИ
// -------------------------
function openPassesCalculatorModal(item) {
  currentCurrencyItem = item;

  const modal = document.getElementById('passesCalculatorModal');
  const overlay = document.getElementById('overlay');

  if (!modal || !overlay) return;

  const qty = document.getElementById('passesQuantityInput');
  const nick = document.getElementById('passesNicknameInput');
  const block = document.getElementById('passesNicknameBlock');

  if (qty) qty.value = '';
  if (nick) nick.value = '';
  if (block) block.style.display = 'block';

  overlay.classList.add('active');
  modal.classList.add('active');
}

function handlePassesInputChange() {
  const qtyInput = document.getElementById('passesQuantityInput');
  const nickBlock = document.getElementById('passesNicknameBlock');

  if (!qtyInput || !nickBlock) return;

  const qty = parseInt(qtyInput.value, 10);

  if (!isNaN(qty) && qty >= 10) {
    nickBlock.style.display = 'none';
  } else {
    nickBlock.style.display = 'block';
  }
}

function submitPassesToCart() {
  const qty = parseInt(document.getElementById('passesQuantityInput').value, 10);
  const nickname = document.getElementById('passesNicknameInput').value.trim();
  const isUrgent = document.getElementById('passesUrgentCheckbox').checked;

  if (isNaN(qty) || qty <= 0) {
    alert('Укажите корректное количество');
    return;
  }

  if (qty < 10 && !nickname) {
    alert('Для заказа менее 10 пропусков обязательно введите игровой ник!');
    return;
  }

  const pricePerUnit = isUrgent ? 150 : 75;

  const item = {
    ...currentCurrencyItem,
    quantity: qty,
    price: qty * pricePerUnit,
    urgency: isUrgent
      ? 'Срочно'
      : 'Не срочно (выдача после 21:00 МСК)',
    playerNick: qty < 10 ? nickname : null,
    isPassesCurrency: true
  };

  pushToCartAndClose(item);
}

// -------------------------
// ОБЩАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ
// -------------------------
function pushToCartAndClose(item) {
  if (typeof cart !== 'undefined') {
    cart.push(item);
    localStorage.setItem('lowadi_cart', JSON.stringify(cart));
  }

  document.getElementById('ecuCalculatorModal')?.classList.remove('active');
  document.getElementById('passesCalculatorModal')?.classList.remove('active');
  document.getElementById('overlay')?.classList.remove('active');

  if (typeof updateCartUI === 'function') {
    updateCartUI();
  }

  if (typeof showToast === 'function') {
    showToast('Товар добавлен в корзину!');
  }
}

// -------------------------
// ПРИВЯЗКА В WINDOW (КРИТИЧНО)
// -------------------------
window.openEcuCalculatorModal = openEcuCalculatorModal;
window.handleEcuCalculation = handleEcuCalculation;
window.submitEcuToCart = submitEcuToCart;

window.openPassesCalculatorModal = openPassesCalculatorModal;
window.handlePassesInputChange = handlePassesInputChange;
window.submitPassesToCart = submitPassesToCart;