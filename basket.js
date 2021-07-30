

const catalog = {
    catalogContent: [
        { name: 'apple', price: 80 },
        { name: 'melon', price: 50 },
        { name: 'pear', price: 75 },
        { name: 'banana', price: 50 },
        { name: 'grapes', price: 120 },
    ]

}

const basket = {
    basketContent: {
    },

    countBasketPrice: function () {
        let totalCost = 0;
        for (item in this.basketContent) {
            totalCost = totalCost + this.basketContent[item].price * this.basketContent[item].quantity;
        }
        return totalCost;
    },

    addItem: function (itemName, itemPrice) {
        let item = this.basketContent[itemName];

        if (!item) {
            this.basketContent[itemName] = {
                price: itemPrice,
                quantity: 0
            };

            item = this.basketContent[itemName];
        }

        item.quantity++;
    }
}

function renderBasket() {
    const myBasket = document.getElementById('my-basket').firstChild;

    if (Object.keys(basket.basketContent).length !== 0) {
        if (Object.keys(basket.basketContent).length > 1) {
            myBasket.nodeValue = 'В корзине ' + Object.keys(basket.basketContent).length + ' различных товаров на сумму ' + basket.countBasketPrice();
        } else if (Object.keys(basket.basketContent).length == 1) {
            myBasket.nodeValue = 'В корзине ' + Object.keys(basket.basketContent).length + ' товар на сумму ' + basket.countBasketPrice();
        }

        const myBasketList = document.getElementById('my-basket-list');
        myBasketList.innerHTML = '';

        for (const item in basket.basketContent) {
            const liElement = document.createElement('li');
            liElement.innerText = item + " x" + basket.basketContent[item].quantity;

            myBasketList.appendChild(liElement);
        }


    }
    else {
        myBasket.nodeValue = 'Корзина пуста';
    }
}

function renderCatalog() {
    const myCatalog = document.getElementById('my-catalog');

    for (const item of catalog.catalogContent) {
        const liElement = document.createElement('li');
        liElement.innerText = item.name;

        const button = document.createElement('button');
        button.innerText = '  Купить ' + item.name;
        button.onclick = function () {
            basket.addItem(item.name, item.price);
            renderBasket();
        };
        liElement.appendChild(button);

        myCatalog.appendChild(liElement);
    }
}

renderBasket();
renderCatalog();
