// Объявляем переменные строго ОДИН раз
const promoContainer = document.getElementById("promotionContainer");
let loadedPromotions = [];

// Загружаем данные только из файла
fetch("promotion.json")
    .then(r => r.json())
    .then(data => {
        loadedPromotions = data; // Сохраняем данные для шторки
        renderPromotions(data);   // Выводим карточки на экран
    })
    .catch(error => {
        console.error("Не удалось загрузить акции из JSON:", error);
        if (promoContainer) {
            promoContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Не удалось загрузить акции. Проверьте консоль.</p>";
        }
    });

// Функция отрисовки карточек в каталоге
function renderPromotions(items) {
    if (!promoContainer) return;
    promoContainer.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "promotion-card";

        // Обратите внимание на openPromoDrawer('${item.id}') — кавычки исправляют ошибку promo_1
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <div>🐴 ${item.horses} лошадей</div>
            <p>${item.description}</p>
            <div class="promotion-price">
                ${item.price} ₽
            </div>
            <button class="promo-more-btn" onclick="openPromoDrawer('${item.id}')">Подробнее</button>
        `;
        promoContainer.appendChild(card);
    });
}

// Функции управления шторкой (Drawer)
function openPromoDrawer(id) {
    // Приводим ID к строке для надежности сравнения
    const item = loadedPromotions.find(p => String(p.id) === String(id));
    if (!item) {
        console.error("Товар с ID " + id + " не найден в массиве.");
        return;
    }

    // Заполняем поля шторки
    document.getElementById("drawerImage").src = item.image || '';
    document.getElementById("drawerName").innerText = item.name || '';
    document.getElementById("drawerServers").innerText = item.stocks || "Все серверы";
    document.getElementById("drawerHorses").innerText = item.horses ? `${item.horses} шт.` : '0 шт.';
    document.getElementById("drawerDescription").innerText = item.description || '';
    document.getElementById("drawerPrice").innerText = item.price ? `${item.price} ₽` : '0 ₽';

    // Показываем шторку
    const drawer = document.getElementById("promoDrawer");
    if (drawer) {
        drawer.classList.add("active");
    } else {
        console.error("Элемент #promoDrawer не найден в HTML!");
    }
}

function closePromoDrawer() {
    const drawer = document.getElementById("promoDrawer");
    if (drawer) {
        drawer.classList.remove("active");
    }
}
