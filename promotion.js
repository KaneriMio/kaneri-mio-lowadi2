// Защита от повторного объявления переменных в консоли
if (typeof loadedPromotions === 'undefined') {
    var loadedPromotions = [];
}
if (typeof currentActiveItem === 'undefined') {
    var currentActiveItem = null;
}

// Точный ключ корзины вашего сайта (заменили ошибочный lowadi_favorites)
const CART_STORAGE_KEY = "lowadi_cart";

// Подгружаем массив корзины из localStorage
let globalCart = [];
try {
    globalCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
} catch (e) {
    globalCart = [];
}

// Загружаем данные из JSON акций
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

// Отрисовка карточек акций
function renderPromotions(items) {
    const promoContainer = document.getElementById("promotionContainer");
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

    currentActiveItem = item; // Запоминаем открытый товар

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

// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА КОРЗИНЫ
function updateCartUI() {
    const cartBadge = document.getElementById("cartBadge");
    const container = document.getElementById("cartItemsContainer");
    const totalPriceEl = document.getElementById("cartTotalPrice");

    // Обновляем счетчик на иконке в шапке
    if (cartBadge) cartBadge.innerText = globalCart.length;

    if (!container) return;
    container.innerHTML = "";

    let total = 0;

    globalCart.forEach((item, index) => {
        // Поддерживаем разные форматы цены (item.priceNum с главной или item.price с акций)
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
    
    // Сохраняем в localStorage под правильным ключом корзины
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(globalCart));
}

// Добавление товара из шторки в корзину
function addToCartFromDrawer() {
    if (!currentActiveItem) return;
    
    // Добавляем структуру, которую ожидает главная страница (name, price, image)
    globalCart.push({
        id: currentActiveItem.id,
        name: currentActiveItem.name,
        price: currentActiveItem.price,
        image: currentActiveItem.image
    });

    updateCartUI(); 
    closePromoDrawer(); 
    
    const cartDrawer = document.getElementById("cartDrawer");
    if (cartDrawer) cartDrawer.classList.add("active");
}

// Привязываем клик к зеленой кнопке в шторке
const drawerBuyBtn = document.querySelector(".drawer-buy-btn");
if (drawerBuyBtn) {
    drawerBuyBtn.onclick = addToCartFromDrawer;
}

function removeFromCart(index) {
    globalCart.splice(index, 1);
    updateCartUI();
}

// Безопасное назначение кликов (с защитой от ошибок null, если кнопки нет в HTML)
const openCartBtn = document.getElementById("openCartBtn");
if (openCartBtn) {
    openCartBtn.onclick = () => {
        const cartDrawer = document.getElementById("cartDrawer");
        if (cartDrawer) cartDrawer.classList.add("active");
    };
}

const closeCartDrawerBtn = document.getElementById("closeCartDrawer");
if (closeCartDrawerBtn) {
    closeCartDrawerBtn.onclick = () => {
        const cartDrawer = document.getElementById("cartDrawer");
        if (cartDrawer) cartDrawer.classList.remove("active");
    };
}

const clearCartBtn = document.getElementById("clearCartBtn");
if (clearCartBtn) {
    clearCartBtn.onclick = () => {
        globalCart = [];
        updateCartUI();
    };
}

// ОФОРМЛЕНИЕ ЗАКАЗА
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
    checkoutBtn.onclick = () => {
        if (globalCart.length === 0) return alert("Your cart is empty!");

        let text = "Здравствуйте! Хочу приобрести следующие товары:\n\n";
        let total = 0;
        globalCart.forEach((item, i) => {
            const pr = item.priceNum || item.price || 0;
            text += `${i + 1}. ${item.name} — ${pr} ₽\n`;
            total += Number(pr);
        });
        text += `\nИтого к оплате: ${total} ₽`;

        navigator.clipboard.writeText(text).then(() => {
            const socialModal = document.getElementById("socialModal");
            if (socialModal) socialModal.classList.add("active");
        }).catch(err => {
            console.error("Не удалось скопировать текст: ", err);
        });
    };
}

const closeSocialModalBtn = document.getElementById("closeSocialModal");
if (closeSocialModalBtn) {
    closeSocialModalBtn.onclick = () => {
        const socialModal = document.getElementById("socialModal");
        if (socialModal) socialModal.classList.remove("active");
    };
}

const goTelegram = document.getElementById("goTelegram");
if (goTelegram) goTelegram.onclick = () => window.open("https://t.me", "_blank");

const goVk = document.getElementById("goVk");
if (goVk) goVk.onclick = () => window.open("https://vk.com", "_blank");

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
