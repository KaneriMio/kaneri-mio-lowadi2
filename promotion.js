const container = document.getElementById("promotionContainer");

fetch("promotion.json")
    .then(r => r.json())
    .then(renderPromotions);

function renderPromotions(items){

    container.innerHTML = "";

    items.forEach(item=>{

        const card=document.createElement("div");

        card.className="promotion-card";

        card.innerHTML=`
            <img src="${item.image}">
            <h2>${item.name}</h2>

            <div>🐴 ${item.horses} лошадей</div>

            <p>${item.description}</p>

            <div class="promotion-price">
                ${item.price} ₽
            </div>
        `;

        container.appendChild(card);

    });

}
