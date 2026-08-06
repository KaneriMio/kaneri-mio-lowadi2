const promoContainer = document.getElementById("promotionContainer");
let loadedPromotions = [];

// УМНЫЙ ПОИСК КЛЮЧА КОРЗИНЫ ИЗ INDEX.HTML
function getCartKeyFromStorage() {
    // Перебираем все ключи в LocalStorage, чтобы найти тот, который использует главная страница
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            const val = JSON.parse(localStorage.getItem(key));
            // Если внутри лежит массив, скорее всего это и есть наша корзина с главной страницы
            if (Array.isArray(val)) {
                console.log("Успешно найден ключ корзины с главной страницы:", key);
                return key;
            }
        } catch (e) {
            // Игнорируем ошибки парсинга не-JSON строк
        }
    }
    // Если главная страница ещё не создавала корзину, используем стандартное имя
    return "cart"; 
}

// Записываем имя ключа, который использует ваш сайт
const CART_STORAGE_KEY = getCartKeyFromStorage();

// Подгружаем массив корзины
let globalCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

// Переменная для отслеживания текущего открытого товара в шторке
let currentActiveItem = null;

// Загружаем данные из JSON
fetch("promotion.json")
    .then(r => r.json())
    .then(data => {
        loadedPromotions = data;
        renderPromotions(data);
        updateCartUI(); // Синхронизируем интерфейс корзины при загрузке
    })
    .catch(error => {
        console.error("Не удалось загрузить акции из JSON:", error);
    });

function renderPromotions(items) {
    if (!promoContainer) return;
    promoContainer.innerHTML = "";
    if (items.length === 0) {
        promoContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Наборы не найдены</p>";
        return;
    }
    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "promotion-card";
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <div>🐴 ${item.horses} лошадей</div>
            <p>${item.description}</p>
            <div class="promotion-price">${item.price} ₽</div>
            <button class="promo-more-btn" onclick="openPromoDrawer('${item.id}')">Подробнее</button>
        `;
        promoContainer.appendChild(card);
    });
}

// УПРАВЛЕНИЕ ШТОРКОЙ ТОВАРА
function openPromoDrawer(id) {
    const item = loadedPromotions.find(p => String(p.id) === String(id));
    if (!item) return;

    currentActiveItem = item; // Запоминаем текущий товар для кнопки покупки

    let serversString = "Нет доступных серверов";
    if (item.stocks && typeof item.stocks === 'object') {
        const availableFlags = Object.keys(item.stocks).filter(flag => Number(item.stocks[flag]) > 0);
        if (availableFlags.length > 0) serversString = availableFlags.join(", ");
    }

    document.getElementById("drawerImage").src = item.image || '';
    document.getElementById("drawerName").innerText = item.name || '';
    document.getElementById("drawerServers").innerText = serversString; 
    document.getElementById("drawerHorses").innerText = item.horses ? `${item.horses} шт.` : '0 шт.';
    document.getElementById("drawerDescription").innerText = item.description || '';
    document.getElementById("drawerPrice").innerText = item.price ? `${item.price} ₽` : '0 ₽';

    document.getElementById("promoDrawer").classList.add("active");
}

function closePromoDrawer() {
    document.getElementById("promoDrawer").classList.remove("active");
    currentActiveItem = null;
}

// ЛОГИКА ЕДИНОЙ КОРЗИНЫ (LOCALSTORAGE)
function updateCartUI() {
    const cartBadge = document.getElementById("cartBadge");
    const container = document.getElementById("cartItemsContainer");
    const totalPriceEl = document.getElementById("cartTotalPrice");

    // Обновляем счетчик в шапке
    if (cartBadge) cartBadge.innerText = globalCart.length;

    if (!container) return;
    container.innerHTML = "";

    let total = 0;

    globalCart.forEach((item, index) => {
        // Проверяем цену: у акций это item.price, у обычных товаров из index.html это может быть item.priceNum или item.price
        const itemPrice = item.priceNum || item.price || 0;
        total += Number(itemPrice);

        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        itemEl.innerHTML = `
            <img src="${item.image}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${itemPrice} ₽</div>
            </div>
            <button class="remove-cart-item" onclick="removeFromCart(${index})">&times;</button>
        `;
        container.appendChild(itemEl);
    });

    if (totalPriceEl) totalPriceEl.innerText = `${total} ₽`;
    
    // Сохраняем строго в тот ключ, который использует index.html
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(globalCart));
}


// Функция добавления товара (вызывается из шторки)
function addToCartFromDrawer() {
    if (!currentActiveItem) return;
    
    // Добавляем элемент в массив корзины
    globalCart.push({
        id: currentActiveItem.id,
        name: currentActiveItem.name,
        price: currentActiveItem.price,
        image: currentActiveItem.image
    });

    updateCartUI(); // Обновляем интерфейс
    closePromoDrawer(); // Закрываем шторку товара
    document.getElementById("cartDrawer").classList.add("active"); // Показываем корзину
}

// Привязываем клик к зеленой кнопке "В корзину" в шторке
const drawerBuyBtn = document.querySelector(".drawer-buy-btn");
if (drawerBuyBtn) {
    drawerBuyBtn.onclick = addToCartFromDrawer;
}

function removeFromCart(index) {
    globalCart.splice(index, 1);
    updateCartUI();
}

// Слушатели для открытия/закрытия шторки корзины в шапке
document.getElementById("openCartBtn").onclick = () => {
    document.getElementById("cartDrawer").classList.add("active");
};
document.getElementById("closeCartDrawer").onclick = () => {
    document.getElementById("cartDrawer").classList.remove("active");
};
document.getElementById("clearCartBtn").onclick = () => {
    globalCart = [];
    updateCartUI();
};

// ОФОРМЛЕНИЕ ЗАКАЗА (КОПИРОВАНИЕ В БУФЕР И ОКНО СОЦСЕТЕЙ)
document.getElementById("checkoutBtn").onclick = () => {
    if (globalCart.length === 0) return alert("Корзина пуста!");

    let text = "Здравствуйте! Хочу приобрести следующие товары:\n\n";
    let total = 0;
    globalCart.forEach((item, i) => {
        text += `${i + 1}. ${item.name} — ${item.price} ₽\n`;
        total += Number(item.price);
    });
    text += `\nИтого к оплате: ${total} ₽`;

    navigator.clipboard.writeText(text).then(() => {
        document.getElementById("socialModal").classList.add("active");
    }).catch(err => {
        console.error("Не удалось скопировать текст: ", err);
    });
};

document.getElementById("closeSocialModal").onclick = () => {
    document.getElementById("socialModal").classList.remove("active");
};
document.getElementById("goTelegram").onclick = () => window.open("https://t.me", "_blank");
document.getElementById("goVk").onclick = () => window.open("https://vk.com", "_blank");

// ЖИВОЙ ПОИСК
const searchInput = document.getElementById("promoSearchInput");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = loadedPromotions.filter(item => {
            return (item.name && item.name.toLowerCase().includes(query)) || 
                   (item.description && item.description.toLowerCase().includes(query));
        });
        renderPromotions(filtered);
    });
}
