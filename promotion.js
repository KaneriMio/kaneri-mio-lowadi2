let loadedPromotions = [];
let selectedPromotionId = null;


/* =========================================
   ЭЛЕМЕНТЫ
   ========================================= */

const promoContainer = document.getElementById("promotionContainer");

const cartDrawer = document.getElementById("cartDrawer");
const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");
const closeCartDrawerBtn = document.getElementById("closeCartDrawer");

const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalPrice = document.getElementById("cartTotalPrice");

const openCartBtn = document.getElementById("openCartBtn");
const cartBadge = document.getElementById("cartBadge");

const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

const searchInput = document.getElementById("promoSearchInput");


/* =========================================
   КОРЗИНА
   ========================================= */

let cart = JSON.parse(
    localStorage.getItem("lowadi_cart") || "[]"
);


/* Сохраняем корзину */

function saveCart() {
    localStorage.setItem(
        "lowadi_cart",
        JSON.stringify(cart)
    );

    updateCartUI();
}


/* =========================================
   ОБНОВЛЕНИЕ СЧЁТЧИКА
   ========================================= */

function updateCartUI() {

    if (!cartBadge) return;

    const totalQuantity = cart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    cartBadge.textContent = totalQuantity;
}


/* =========================================
   ОТКРЫТИЕ / ЗАКРЫТИЕ КОРЗИНЫ
   ========================================= */

function openCartDrawer() {

    if (!cartDrawer) return;

    renderCart();

    cartDrawer.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeCartDrawer() {

    if (!cartDrawer) return;

    cartDrawer.classList.remove("active");

    document.body.style.overflow = "";
}


if (openCartBtn) {
    openCartBtn.addEventListener("click", openCartDrawer);
}

if (closeCartDrawerBtn) {
    closeCartDrawerBtn.addEventListener(
        "click",
        closeCartDrawer
    );
}

if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener(
        "click",
        closeCartDrawer
    );
}


/* =========================================
   ДОБАВЛЕНИЕ АКЦИИ В КОРЗИНУ
   ========================================= */

function addPromotionToCart(item) {

    if (!item) return;

    const existing = cart.find(
        cartItem => String(cartItem.id) === String(item.id)
    );

    if (existing) {

        existing.quantity =
            Number(existing.quantity || 0) + 1;

    } else {

        cart.push({
            id: item.id,
            name: item.name,
            image: item.image || "",
            price: Number(item.price || 0),
            quantity: 1,

            // Помечаем, что это акционный набор
            isPromotion: true,

            // Сохраняем дополнительные данные
            horses: item.horses || 0,
            description: item.description || ""
        });
    }

    saveCart();

    showPromoToast(
        `«${item.name}» добавлен в корзину`
    );
}


/* =========================================
   ИЗМЕНЕНИЕ КОЛИЧЕСТВА
   ========================================= */

function changePromotionCartQty(id, delta) {

    const item = cart.find(
        cartItem => String(cartItem.id) === String(id)
    );

    if (!item) return;

    item.quantity =
        Number(item.quantity || 0) + delta;

    if (item.quantity <= 0) {

        cart = cart.filter(
            cartItem =>
                String(cartItem.id) !== String(id)
        );
    }

    saveCart();

    renderCart();
}


/* =========================================
   УДАЛЕНИЕ ТОВАРА
   ========================================= */

function removePromotionFromCart(id) {

    cart = cart.filter(
        item =>
            String(item.id) !== String(id)
    );

    saveCart();

    renderCart();
}


/* =========================================
   ОТРИСОВКА КОРЗИНЫ
   ========================================= */

function renderCart() {

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (!cart.length) {

        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                🛒 Корзина пуста
            </div>
        `;

        if (cartTotalPrice) {
            cartTotalPrice.textContent = "0 ₽";
        }

        return;
    }

    let total = 0;

    cart.forEach(item => {

        const quantity =
            Number(item.quantity || 1);

        const price =
            Number(item.price || 0);

        const itemTotal =
            price * quantity;

        total += itemTotal;

        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <img
                class="cart-item-image"
                src="${item.image || ''}"
                alt="${item.name || ''}"
            >

            <div class="cart-item-info">

                <div class="cart-item-name">
                    ${item.name || "Товар"}
                </div>

                <div class="cart-item-price">
                    ${price} ₽ × ${quantity}
                </div>

                <div class="cart-item-controls">

                    <button
                        class="cart-qty-btn"
                        onclick="changePromotionCartQty('${item.id}', -1)"
                    >
                        −
                    </button>

                    <span class="cart-qty-value">
                        ${quantity}
                    </span>

                    <button
                        class="cart-qty-btn"
                        onclick="changePromotionCartQty('${item.id}', 1)"
                    >
                        +
                    </button>

                </div>

            </div>

            <div class="cart-item-total">
                ${itemTotal} ₽
            </div>

            <button
                class="cart-item-remove"
                title="Удалить"
                onclick="removePromotionFromCart('${item.id}')"
            >
                ×
            </button>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    if (cartTotalPrice) {
        cartTotalPrice.textContent =
            `${total} ₽`;
    }
}


/* =========================================
   ОЧИСТКА КОРЗИНЫ
   ========================================= */

if (clearCartBtn) {

    clearCartBtn.addEventListener(
        "click",
        () => {

            if (!cart.length) return;

            if (
                confirm(
                    "Очистить корзину?"
                )
            ) {

                cart = [];

                saveCart();

                renderCart();
            }
        }
    );
}


/* =========================================
   КНОПКА "ПРИОБРЕСТИ"
   ========================================= */

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        () => {

            if (!cart.length) {
                alert("Корзина пуста.");
                return;
            }

            const text = cart
                .map(item => {

                    const quantity =
                        Number(item.quantity || 1);

                    const total =
                        Number(item.price || 0) *
                        quantity;

                    return `${item.name} × ${quantity} — ${total} ₽`;
                })
                .join("\n");

            const total = cart.reduce(
                (sum, item) =>
                    sum +
                    Number(item.price || 0) *
                    Number(item.quantity || 1),
                0
            );

            const orderText =
                `Заказ:\n\n${text}\n\nИтого: ${total} ₽`;

            navigator.clipboard
                .writeText(orderText)
                .then(() => {

                    alert(
                        "Содержимое корзины скопировано в буфер обмена."
                    );

                })
                .catch(() => {

                    alert(orderText);

                });
        }
    );
}


/* =========================================
   АКЦИИ — ЗАГРУЗКА JSON
   ========================================= */

fetch("promotion.json")
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Ошибка загрузки promotion.json"
            );
        }

        return response.json();
    })
    .then(data => {

        loadedPromotions = Array.isArray(data)
            ? data
            : [];

        renderPromotions(
            loadedPromotions
        );

    })
    .catch(error => {

        console.error(
            "Не удалось загрузить акции:",
            error
        );

        if (promoContainer) {

            promoContainer.innerHTML = `
                <p style="
                    grid-column:1/-1;
                    text-align:center;
                    color:#666;
                ">
                    Не удалось загрузить акции.
                </p>
            `;
        }
    });


/* =========================================
   ОТРИСОВКА АКЦИЙ
   ========================================= */

function renderPromotions(items) {

    if (!promoContainer) return;

    promoContainer.innerHTML = "";

    if (!items.length) {

        promoContainer.innerHTML = `
            <p style="
                grid-column:1/-1;
                text-align:center;
                color:#666;
                margin-top:20px;
            ">
                Наборы не найдены
            </p>
        `;

        return;
    }

    items.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "promotion-card";

        card.innerHTML = `
            <img
                src="${item.image || ''}"
                alt="${item.name || ''}"
            >

            <h2>
                ${item.name || ''}
            </h2>

            <div class="promotion-horses">
                🐴 ${item.horses || 0} лошадей
            </div>

            <p>
                ${item.description || ''}
            </p>

            <div class="promotion-price">
                ${item.price || 0} ₽
            </div>

            <button
                class="promo-more-btn"
                onclick="openPromoDrawer('${item.id}')"
            >
                Подробнее
            </button>
        `;

        promoContainer.appendChild(card);
    });
}


/* =========================================
   ШТОРКА АКЦИИ
   ========================================= */

function openPromoDrawer(id) {

    const item =
        loadedPromotions.find(
            p => String(p.id) === String(id)
        );

    if (!item) {
        console.error(
            "Акция не найдена:",
            id
        );
        return;
    }

    selectedPromotionId = item.id;

    let serversString =
        "Нет доступных серверов";

    if (
        item.stocks &&
        typeof item.stocks === "object"
    ) {

        const availableFlags =
            Object.keys(item.stocks)
                .filter(flag =>
                    Number(item.stocks[flag]) > 0
                );

        if (availableFlags.length) {
            serversString =
                availableFlags.join(", ");
        }

    } else if (
        typeof item.stocks === "string" &&
        item.stocks.trim()
    ) {

        serversString = item.stocks;
    }


    document.getElementById(
        "drawerImage"
    ).src = item.image || "";


    document.getElementById(
        "drawerName"
    ).innerText = item.name || "";


    document.getElementById(
        "drawerServers"
    ).innerText = serversString;


    document.getElementById(
        "drawerHorses"
    ).innerText =
        item.horses
            ? `${item.horses} шт.`
            : "0 шт.";


    document.getElementById(
        "drawerDescription"
    ).innerText =
        item.description || "";


    document.getElementById(
        "drawerPrice"
    ).innerText =
        item.price
            ? `${item.price} ₽`
            : "0 ₽";


    const drawer =
        document.getElementById(
            "promoDrawer"
        );

    if (drawer) {
        drawer.classList.add("active");
    }


    /* Кнопка "В корзину" */

    const buyButton =
        document.querySelector(
            ".drawer-buy-btn"
        );

    if (buyButton) {

        buyButton.onclick = () => {

            addPromotionToCart(item);

            closePromoDrawer();

        };
    }
}


/* =========================================
   ЗАКРЫТИЕ ШТОРКИ АКЦИИ
   ========================================= */

function closePromoDrawer() {

    const drawer =
        document.getElementById(
            "promoDrawer"
        );

    if (drawer) {
        drawer.classList.remove("active");
    }
}


/* =========================================
   ПОИСК
   ========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            const query =
                event.target.value
                    .toLowerCase()
                    .trim();

            const filtered =
                loadedPromotions.filter(
                    item => {

                        const name =
                            item.name
                                ? item.name
                                    .toLowerCase()
                                : "";

                        const description =
                            item.description
                                ? item.description
                                    .toLowerCase()
                                : "";

                        const keywords =
                            Array.isArray(
                                item.keywords
                            )
                                ? item.keywords
                                    .join(" ")
                                    .toLowerCase()
                                : "";

                        return (
                            name.includes(query) ||
                            description.includes(query) ||
                            keywords.includes(query)
                        );
                    }
                );

            renderPromotions(filtered);
        }
    );
}


/* =========================================
   УВЕДОМЛЕНИЕ
   ========================================= */

function showPromoToast(text) {

    let toast =
        document.getElementById(
            "promoToast"
        );

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "promoToast";

        toast.style.cssText = `
            position:fixed;
            bottom:25px;
            left:50%;
            transform:translateX(-50%);
            background:#2e7d32;
            color:white;
            padding:12px 20px;
            border-radius:8px;
            font-weight:bold;
            z-index:10000;
            box-shadow:0 4px 15px rgba(0,0,0,.2);
        `;

        document.body.appendChild(toast);
    }

    toast.textContent = text;

    clearTimeout(
        window.promoToastTimer
    );

    window.promoToastTimer =
        setTimeout(() => {

            toast.remove();

        }, 2500);
}


/* =========================================
   ДЕЛАЕМ ФУНКЦИИ ДОСТУПНЫМИ ИЗ HTML
   ========================================= */

window.openPromoDrawer =
    openPromoDrawer;

window.closePromoDrawer =
    closePromoDrawer;

window.changePromotionCartQty =
    changePromotionCartQty;

window.removePromotionFromCart =
    removePromotionFromCart;


/* Первоначальное состояние */

updateCartUI();
