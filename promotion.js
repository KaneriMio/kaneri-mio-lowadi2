const container = document.getElementById("promotionContainer");

// Глобальный массив, куда запишутся данные сразу после загрузки из JSON
let currentPromotions = [];

// Загружаем данные только из файла
fetch("promotion.json")
    .then(r => r.json())
    .then(data => {
        currentPromotions = data; // Сохраняем данные для шторки
        renderPromotions(data);   // Выводим карточки на экран
    })
    .catch(error => {
        console.error("Не удалось загрузить акции из JSON:", error);
        if (container) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Не удалось загрузить акции. Пожалуйста, запустите сайт через локальный сервер.</p>";
        }
    });

// Функция отрисовки карточек в каталоге
function renderPromotions(items) {
    if (!container) return;
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "promotion-card";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <div>🐴 ${item.horses} лошадей</div>
            <p>${item.description}</p>
            <div class="promotion-price">
                ${item.price} ₽
            </div>
            <button class="promo-more-btn" onclick="openPromoDrawer(${item.id})">Подробнее</button>
        `;
        container.appendChild(card);
    });
}

// Функции управления шторкой (Drawer)
function openPromoDrawer(id) {
    // Ищем нужный товар в массиве, который загрузился из JSON
    const item = currentPromotions.find(p => p.id === id);
    if (!item) return;

    // Заполняем поля шторки
    document.getElementById("drawerImage").src = item.image;
    document.getElementById("drawerName").innerText = item.name;
    document.getElementById("drawerServers").innerText = item.stocks || "Все серверы";
    document.getElementById("drawerHorses").innerText = `${item.horses} шт.`;
    document.getElementById("drawerDescription").innerText = item.description;
    document.getElementById("drawerPrice").innerText = `${item.price} ₽`;

    // Показываем шторку
    document.getElementById("promoDrawer").classList.add("active");
}

function closePromoDrawer() {
    document.getElementById("promoDrawer").classList.remove("active");
}
