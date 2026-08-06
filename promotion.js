const container = document.getElementById("promotionContainer");

// Массив данных (добавили поле "stocks" для доступных серверов)
const backupItems = [
  {
    "id": 1,
    "name": "Стартовый набор",
    "horses": 5,
    "stocks": "RU, UN",
    "description": "Лучший старт для нового игрока. Включает базовые элементы Черного рынка, помогающие быстро вырастить первых чемпионов.",
    "price": "299",
    "image": "https://ibb.co" // Примерная иконка крюка/копытного ножа
  },
  {
    "id": 2,
    "name": "Элитный табун",
    "horses": 3,
    "stocks": "RU",
    "description": "Эксклюзивный набор, содержащий породистых скакунов с высокими генетическими навыками для успешного разведения.",
    "price": "499",
    "image": "https://unsplash.com"
  }
];

// Глобальная переменная для хранения загруженных товаров
let currentPromotions = [];

fetch("promotion.json")
    .then(r => {
        if (!r.ok) throw new Error("Ошибка загрузки файла");
        return r.json();
    })
    .then(data => {
        currentPromotions = data;
        renderPromotions(data);
    })
    .catch(error => {
        console.warn("Fetch заблокирован или файл не найден. Используем локальные данные.");
        currentPromotions = backupItems;
        renderPromotions(backupItems);
    });

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
            <!-- Добавлена кнопка "Подробнее" -->
            <button class="promo-more-btn" onclick="openPromoDrawer(${item.id})">Подробнее</button>
        `;
        container.appendChild(card);
    });
}

// ФУНКЦИИ УПРАВЛЕНИЯ ШТОРКОЙ
function openPromoDrawer(id) {
    const item = currentPromotions.find(p => p.id === id);
    if (!item) return;

    // Заполняем поля шторки данными конкретной акции
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
