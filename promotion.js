// =====================================================
// АКЦИИ
// =====================================================

const promoContainer = document.getElementById("promotionContainer");
let loadedPromotions = [];
let currentPromoItem = null;


// =====================================================
// КОРЗИНА
// Используем ту же корзину, что и основной сайт
// =====================================================

let cart = JSON.parse(localStorage.getItem('lowadi_cart')) || [];


// =====================================================
// ЗАГРУЗКА АКЦИЙ
// =====================================================

fetch("promotion.json")
    .then(r => r.json())
    .then(data => {
        loadedPromotions = data;
        renderPromotions(data);
        updatePromoCartUI();
    })
    .catch(error => {
        console.error("Не удалось загрузить акции из JSON:", error);

        if (promoContainer) {
            promoContainer.innerHTML =
                "<p style='grid-column:1/-1;text-align:center;color:#666;'>Не удалось загрузить акции. Проверьте консоль.</p>";
        }
    });


// =====================================================
// ОТРИСОВКА КАРТОЧЕК АКЦИЙ
// =====================================================

function renderPromotions(items) {

    if (!promoContainer) return;

    promoContainer.innerHTML = "";

    if (!items || items.length === 0) {
        promoContainer.innerHTML =
            "<p style='grid-column:1/-1;text-align:center;color:#666;margin-top:20px;'>Наборы не найдены</p>";
        return;
    }

    items.forEach(item => {

        const card = document.createElement("div");
        card.className = "promotion-card";

        card.innerHTML = `
            <img src="${item.image || ''}" alt="${item.name || ''}">

            <h2>${item.name || ''}</h2>

            <div>🐴 ${item.horses || 0} лошадей</div>

            <p>${item.description || ''}</p>

            <div class="promotion-price">
                ${item.price || 0} ₽
            </div>

            <button class="promo-more-btn">
                Подробнее
            </button>
        `;

        const moreBtn = card.querySelector(".promo-more-btn");

        if (moreBtn) {
            moreBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                openPromoDrawer(item.id);
            });
        }

        promoContainer.appendChild(card);
    });
}


// =====================================================
// ОТКРЫТИЕ ШТОРКИ АКЦИИ
// =====================================================

function openPromoDrawer(id) {

    const item = loadedPromotions.find(
        p => String(p.id) === String(id)
    );

    if (!item) {
        console.error("Товар с ID " + id + " не найден.");
        return;
    }

    // Запоминаем открытую акцию
    currentPromoItem = item;

    let serversString = "Нет доступных серверов";

    if (item.stocks && typeof item.stocks === 'object') {

        const availableFlags = Object.keys(item.stocks).filter(flag => {
            return Number(item.stocks[flag]) > 0;
        });

        if (availableFlags.length > 0) {
            serversString = availableFlags.join(", ");
        }

    } else if (
        typeof item.stocks === 'string' &&
        item.stocks.trim() !== ''
    ) {
        serversString = item.stocks;
    }


    // Заполняем шторку

    const drawerImage = document.getElementById("drawerImage");
    const drawerName = document.getElementById("drawerName");
    const drawerServers = document.getElementById("drawerServers");
    const drawerHorses = document.getElementById("drawerHorses");
    const drawerDescription = document.getElementById("drawerDescription");
    const drawerPrice = document.getElementById("drawerPrice");

    if (drawerImage) {
        drawerImage.src = item.image || '';
    }

    if (drawerName) {
        drawerName.innerText = item.name || '';
    }

    if (drawerServers) {
        drawerServers.innerText = serversString;
    }

    if (drawerHorses) {
        drawerHorses.innerText =
            item.horses ? `${item.horses} шт.` : '0 шт.';
    }

    if (drawerDescription) {
        drawerDescription.innerText = item.description || '';
    }

    if (drawerPrice) {
        drawerPrice.innerText =
            item.price ? `${item.price} ₽` : '0 ₽';
    }


    // Проверяем наличие
    updatePromoDrawerButton();


    const drawer = document.getElementById("promoDrawer");

    if (drawer) {
        drawer.classList.add("active");
    }
}


// =====================================================
// КНОПКА В КОРЗИНУ В ШТОРКЕ
// =====================================================

const promoAddToCartBtn =
    document.getElementById("promoAddToCartBtn");


if (promoAddToCartBtn) {

    promoAddToCartBtn.addEventListener("click", () => {

        if (!currentPromoItem) return;

        addPromotionToCart(currentPromoItem);

    });

}


// =====================================================
// ДОБАВЛЕНИЕ АКЦИИ В КОРЗИНУ
// =====================================================

function addPromotionToCart(item) {

    // Проверяем наличие на выбранном сервере.
    // Если в promotion.json stocks пустой/не указан,
    // считаем набор доступным.

    const currentServer =
        localStorage.getItem('lowadi_server') || '🇷🇺';

    let stock = 1;

    if (
        item.stocks &&
        typeof item.stocks === 'object'
    ) {
        stock = Number(item.stocks[currentServer] || 0);
    }

    if (stock <= 0) {

        if (typeof showPromoToast === "function") {
            showPromoToast("Набор недоступен на выбранном сервере.");
        } else {
            alert("Набор недоступен на выбранном сервере.");
        }

        return;
    }


    // Ищем такой набор в корзине
    const existing = cart.find(
        c => String(c.id) === String(item.id)
    );


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: 1,

            // Помечаем, что это акция
            isPromotion: true,

            // Дополнительная информация
            horses: item.horses || 0,
            image: item.image || ''
        });

    }


    // Сохраняем общую корзину
    localStorage.setItem(
        'lowadi_cart',
        JSON.stringify(cart)
    );


    updatePromoCartUI();
    updatePromoDrawerButton();


    showPromoToast(
        existing
            ? "Количество набора увеличено."
            : "Набор добавлен в корзину."
    );
}


// =====================================================
// ОБНОВЛЕНИЕ СЧЁТЧИКА КОРЗИНЫ
// =====================================================

function updatePromoCartUI() {

    const cartBadge =
        document.getElementById("cartBadge");

    if (!cartBadge) return;


    const totalQuantity = cart.reduce(
        (sum, item) =>
            sum + (Number(item.quantity) || 1),
        0
    );

    cartBadge.innerText = totalQuantity;

    cartBadge.style.display =
        totalQuantity > 0 ? 'block' : 'none';
}


// =====================================================
// ОБНОВЛЕНИЕ КНОПКИ В ШТОРКЕ
// =====================================================

function updatePromoDrawerButton() {

    if (!promoAddToCartBtn || !currentPromoItem) return;


    const existing = cart.find(
        c => String(c.id) === String(currentPromoItem.id)
    );


    if (existing) {

        promoAddToCartBtn.querySelector("span").innerText =
            `В корзине: ${existing.quantity}`;

    } else {

        promoAddToCartBtn.querySelector("span").innerText =
            "В корзину";
    }
}


// =====================================================
// ЗАКРЫТИЕ ШТОРКИ
// =====================================================

function closePromoDrawer() {

    const drawer =
        document.getElementById("promoDrawer");

    if (drawer) {
        drawer.classList.remove("active");
    }
}


// =====================================================
// ОТКРЫТИЕ КОРЗИНЫ
// =====================================================

const openCartBtn =
    document.getElementById("openCartBtn");

const cartDrawer =
    document.getElementById("cartDrawer");

const closeCartDrawer =
    document.getElementById("closeCartDrawer");


if (openCartBtn) {

    openCartBtn.addEventListener("click", () => {

        renderPromoCart();

        if (cartDrawer) {
            cartDrawer.classList.add("active");
        }

    });

}


if (closeCartDrawer) {

    closeCartDrawer.addEventListener("click", () => {

        if (cartDrawer) {
            cartDrawer.classList.remove("active");
        }

    });

}


// =====================================================
// ОТРИСОВКА КОРЗИНЫ
// =====================================================

function renderPromoCart() {

    const container =
        document.getElementById("cartItemsContainer");

    const totalBox =
        document.getElementById("cartTotalPrice");


    if (!container) return;


    container.innerHTML = "";


    if (cart.length === 0) {

        container.innerHTML = `
            <div style="text-align:center; padding:30px;">
                Корзина пуста 🛒
            </div>
        `;

        if (totalBox) {
            totalBox.innerText = "0 ₽";
        }

        return;
    }


    let total = 0;


    cart.forEach((item, index) => {

        const quantity =
            Number(item.quantity) || 1;

        const itemTotal =
            (Number(item.price) || 0) * quantity;

        total += itemTotal;


        const row =
            document.createElement("div");

        row.className = "cart-item";


        row.innerHTML = `
            <div class="cart-item-info">

                <div class="cart-item-name">
                    ${item.name}
                </div>

                <div class="cart-item-price">
                    ${item.price} ₽ × ${quantity}
                </div>

            </div>

            <div class="cart-item-total">
                ${itemTotal} ₽
            </div>

            <button
                class="cart-item-remove"
                data-index="${index}">
                ×
            </button>
        `;


        const removeBtn =
            row.querySelector(".cart-item-remove");


        if (removeBtn) {

            removeBtn.addEventListener("click", () => {

                cart.splice(index, 1);

                savePromoCart();

                renderPromoCart();

            });

        }


        container.appendChild(row);

    });


    if (totalBox) {
        totalBox.innerText = `${total} ₽`;
    }
}


// =====================================================
// СОХРАНЕНИЕ КОРЗИНЫ
// =====================================================

function savePromoCart() {

    localStorage.setItem(
        'lowadi_cart',
        JSON.stringify(cart)
    );

    updatePromoCartUI();
}


// =====================================================
// ОЧИСТКА КОРЗИНЫ
// =====================================================

const clearCartBtn =
    document.getElementById("clearCartBtn");


if (clearCartBtn) {

    clearCartBtn.addEventListener("click", () => {

        if (cart.length === 0) return;

        cart = [];

        savePromoCart();

        renderPromoCart();

    });

}


// =====================================================
// ПОКУПКА
// =====================================================

const checkoutBtn =
    document.getElementById("checkoutBtn");


if (checkoutBtn) {

    checkoutBtn.addEventListener("click", async () => {

        if (cart.length === 0) {

            showPromoToast("Ваша корзина пуста!");

            return;
        }


        let orderText =
            "🛒 Заказ Lowadi | Kaneri Mio Company\n\n";


        cart.forEach(item => {

            const quantity =
                Number(item.quantity) || 1;

            const itemTotal =
                (Number(item.price) || 0) * quantity;


            orderText +=
                `• ${item.name}`;


            if (quantity > 1) {
                orderText += ` ×${quantity}`;
            }


            orderText +=
                ` — ${itemTotal} ₽\n`;

        });


        const total =
            cart.reduce((sum, item) => {

                return sum +
                    ((Number(item.price) || 0) *
                    (Number(item.quantity) || 1));

            }, 0);


        orderText +=
            `\n💰 Итого: ${total} ₽`;


        try {

            await navigator.clipboard.writeText(orderText);

            showPromoToast(
                "Содержимое корзины скопировано."
            );

        } catch (e) {

            console.error(e);

        }


        const socialModal =
            document.getElementById("socialModal");


        if (socialModal) {
            socialModal.classList.add("active");
        }

    });

}


// =====================================================
// ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
// =====================================================

const closeSocialModal =
    document.getElementById("closeSocialModal");


if (closeSocialModal) {

    closeSocialModal.addEventListener("click", () => {

        const socialModal =
            document.getElementById("socialModal");

        if (socialModal) {
            socialModal.classList.remove("active");
        }

    });

}


// =====================================================
// TOAST
// =====================================================

function showPromoToast(message) {

    let toast =
        document.getElementById("promoToast");


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "promoToast";

        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.background = "#2e7d32";
        toast.style.color = "#fff";
        toast.style.padding = "12px 20px";
        toast.style.borderRadius = "8px";
        toast.style.zIndex = "99999";
        toast.style.fontWeight = "bold";

        document.body.appendChild(toast);
    }


    toast.innerText = message;
    toast.style.display = "block";


    setTimeout(() => {

        toast.style.display = "none";

    }, 2500);

}


// =====================================================
// ПОИСК
// =====================================================

const searchInput =
    document.getElementById("promoSearchInput");


if (searchInput) {

    searchInput.addEventListener("input", (e) => {

        const query =
            e.target.value.toLowerCase().trim();


        const filtered =
            loadedPromotions.filter(item => {

                const nameMatch =
                    item.name &&
                    item.name.toLowerCase().includes(query);


                const descMatch =
                    item.description &&
                    item.description.toLowerCase().includes(query);


                return nameMatch || descMatch;

            });


        renderPromotions(filtered);

    });

}
