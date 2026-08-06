// Проверяем, что объявляем переменные строго один раз на весь файл
if (typeof promoContainer === 'undefined') {
    var promoContainer = document.getElementById("promotionContainer");
}
if (typeof loadedPromotions === 'undefined') {
    var loadedPromotions = [];
}

// Загружаем данные из JSON
fetch("promotion.json")
    .then(r => r.json())
    .then(data => {
        loadedPromotions = data; // Сохраняем данные глобально
        renderPromotions(data);   // Выводим карточки на экран
    })
    .catch(error => {
        console.error("Не удалось загрузить акции из JSON:", error);
        if (promoContainer) {
            promoContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Не удалось загрузить акции. Проверьте консоль.</p>";
        }
    });

// Функция отрисовки карточек в каталоге акций
function renderPromotions(items) {
    if (!promoContainer) return;
    promoContainer.innerHTML = "";

    if (items.length === 0) {
        promoContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666; margin-top: 20px;'>Наборы не найдены</p>";
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
            <div class="promotion-price">
                ${item.price} ₽
            </div>
            <button class="promo-more-btn" onclick="openPromoDrawer('${item.id}')">Подробнее</button>
        `;
        promoContainer.appendChild(card);
    });
}

// ФУНКЦИЯ ОТКРЫТИЯ ШТОРКИ (С ИСПРАВЛЕННЫМ ВЫВОДОМ ФЛАГОВ > 0)
function openPromoDrawer(id) {
    const item = loadedPromotions.find(p => String(p.id) === String(id));
    if (!item) {
        console.error("Товар с ID " + id + " не найден.");
        return;
    }

    let serversString = "Нет доступных серверов";
    
    // Проверяем, является ли stocks объектом
    if (item.stocks && typeof item.stocks === 'object') {
        // Фильтруем флаги, оставляя только те, у которых значение строго больше 0
        const availableFlags = Object.keys(item.stocks).filter(flag => {
            return Number(item.stocks[flag]) > 0;
        });
        
        if (availableFlags.length > 0) {
            serversString = availableFlags.join(", "); 
        }
    } else if (typeof item.stocks === 'string' && item.stocks.trim() !== '') {
        serversString = item.stocks;
    }

    // Заполняем поля шторки данными конкретной акции
    document.getElementById("drawerImage").src = item.image || '';
    document.getElementById("drawerName").innerText = item.name || '';
    document.getElementById("drawerServers").innerText = serversString; 
    document.getElementById("drawerHorses").innerText = item.horses ? `${item.horses} шт.` : '0 шт.';
    document.getElementById("drawerDescription").innerText = item.description || '';
    document.getElementById("drawerPrice").innerText = item.price ? `${item.price} ₽` : '0 ₽';

    // Показываем шторку
    const drawer = document.getElementById("promoDrawer");
    if (drawer) {
        drawer.classList.add("active");
    }
}

function closePromoDrawer() {
    const drawer = document.getElementById("promoDrawer");
    if (drawer) {
        drawer.classList.remove("active");
    }
}

// ЖИВОЙ ПОИСК ПО НАЗВАНИЮ И КЛЮЧЕВЫМ СЛОВАМ
const searchInput = document.getElementById("promoSearchInput");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Фильтруем массив акций по имени или описанию
        const filtered = loadedPromotions.filter(item => {
            const nameMatch = item.name ? item.name.toLowerCase().includes(query) : false;
            const descMatch = item.description ? item.description.toLowerCase().includes(query) : false;
            return nameMatch || descMatch;
        });
        
        renderPromotions(filtered);
    });
}
